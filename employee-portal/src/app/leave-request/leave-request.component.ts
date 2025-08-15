import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';

interface LeaveDetail {
  EmpId: string;
  Type: string;
  AbsenceQuota: string;
  PayrollDays: string;
  PayrollHrs: string;
  StartDate: string;
  EndDate: string;
  LastChangedTime: string;
  LastChangedOn: string | null;
  ChangedBy: string;
  QuotaAssigned: string;
  QuotaUsed: string;
  QuotaType: string;
}

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss']
})
export class LeaveRequestComponent implements OnInit {
  leaveDetails: LeaveDetail[] = [];
  filteredLeaveDetails: LeaveDetail[] = [];
  isLoading = true;
  employeeId = '';
  selectedType = '';
  dateFilterOption = '';
  sortBy = 'startDate';
  sortOrder = 'asc';
  errorMessage = '';

  private readonly middlewareUrl = 'http://localhost:3000/api/leave-details';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const employeeDataString =
      sessionStorage.getItem('employeeData') ||
      localStorage.getItem('employeeData');

    if (!employeeDataString) {
      this.errorMessage = 'Please log in again.';
      this.isLoading = false;
      console.error('❌ No employee data found in storage.');
      // this.router.navigate(['/login']); // Optional redirect
      return;
    }

    const { empId } = JSON.parse(employeeDataString);
    this.employeeId = empId;

    console.log('🔍 Fetching leave details for empId:', this.employeeId);

    this.fetchLeaveDetails();
  }

  fetchLeaveDetails(): void {
    this.isLoading = true;

    this.http
      .get<{ success: boolean; leaveDetails: LeaveDetail[] }>(
        `${this.middlewareUrl}?empId=${this.employeeId}`
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('❌ API Error:', error);
          this.errorMessage =
            error.error?.error || 'An unexpected error occurred.';
          return of({ success: false, leaveDetails: [] });
        })
      )
      .subscribe((response) => {
        this.isLoading = false;
        if (response.success) {
          this.leaveDetails = response.leaveDetails;
          this.applyFilters();
        }
      });
  }

  get uniqueTypes(): string[] {
    return [...new Set(this.leaveDetails.map((leave) => leave.Type))];
  }

  applyFilters(): void {
    let filtered = [...this.leaveDetails];

    if (this.selectedType) {
      filtered = filtered.filter((leave) => leave.Type === this.selectedType);
    }

    if (this.dateFilterOption) {
      const now = new Date();
      filtered = filtered.filter((leave) => {
        const startDate = new Date(
          parseInt(leave.StartDate.match(/\d+/)?.[0] || '0')
        );
        switch (this.dateFilterOption) {
          case 'upcoming':
            return startDate > now;
          case 'past':
            return startDate < now;
          case 'current':
            return (
              startDate <= now &&
              new Date(parseInt(leave.EndDate.match(/\d+/)?.[0] || '0')) >= now
            );
          default:
            return true;
        }
      });
    }

    this.filteredLeaveDetails = filtered;
    this.applySorting();
  }

  applySorting(): void {
    this.filteredLeaveDetails.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'type':
          valueA = a.Type;
          valueB = b.Type;
          break;
        case 'startDate':
          valueA = new Date(parseInt(a.StartDate.match(/\d+/)?.[0] || '0'));
          valueB = new Date(parseInt(b.StartDate.match(/\d+/)?.[0] || '0'));
          break;
        case 'endDate':
          valueA = new Date(parseInt(a.EndDate.match(/\d+/)?.[0] || '0'));
          valueB = new Date(parseInt(b.EndDate.match(/\d+/)?.[0] || '0'));
          break;
        case 'quotaAssigned':
          valueA = parseFloat(a.QuotaAssigned) || 0;
          valueB = parseFloat(b.QuotaAssigned) || 0;
          break;
        case 'quotaUsed':
          valueA = parseFloat(a.QuotaUsed) || 0;
          valueB = parseFloat(b.QuotaUsed) || 0;
          break;
        case 'availableBalance':
          valueA = this.getAvailableBalance(a.QuotaAssigned, a.QuotaUsed);
          valueB = this.getAvailableBalance(b.QuotaAssigned, b.QuotaUsed);
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applySorting();
  }

  formatDate(dateString: string): string {
    const date = new Date(parseInt(dateString.match(/\d+/)?.[0] || '0'));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getAvailableBalance(quotaAssigned: string, quotaUsed: string): number {
    const assigned = parseFloat(quotaAssigned) || 0;
    const used = parseFloat(quotaUsed) || 0;
    return assigned - used;
  }

  getProgressPercentage(quotaAssigned: string, quotaUsed: string): number {
    const assigned = parseFloat(quotaAssigned) || 0;
    const used = parseFloat(quotaUsed) || 0;
    if (assigned <= 0) return 0;
    return Math.min((used / assigned) * 100, 100);
  }

  getLeaveTypeDescription(type: string): string {
    const typeMap: { [key: string]: string } = {
      '0300': 'Annual Leave',
      '0720': 'Sick Leave',
      '0100': 'Casual Leave',
      '0200': 'Maternity Leave',
      '0500': 'Paternity Leave'
    };
    return typeMap[type] || type;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
















// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { catchError, of } from 'rxjs';

// interface LeaveDetail {
//   EmpId: string;
//   Type: string;
//   AbsenceQuota: string;
//   PayrollDays: string;
//   PayrollHrs: string;
//   StartDate: string;
//   EndDate: string;
//   LastChangedTime: string;
//   LastChangedOn: string | null;
//   ChangedBy: string;
//   QuotaAssigned: string;
//   QuotaUsed: string;
//   QuotaType: string;
// }

// @Component({
//   selector: 'app-leave-request',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './leave-request.component.html',
//   styleUrls: ['./leave-request.component.scss']
// })
// export class LeaveRequestComponent implements OnInit {
//   leaveDetails: LeaveDetail[] = [];
//   filteredLeaveDetails: LeaveDetail[] = [];
//   isLoading = true;
//   // employeeId = localStorage.getItem('empId'); // Mock employee ID
//   employeeId = '';
//   selectedType = '';
//   dateFilterOption = '';
//   sortBy = 'startDate';
//   sortOrder = 'asc';

//   // private readonly middlewareUrl = 'http://localhost:3000/api/leave-details';

//   constructor(private router: Router, private http: HttpClient) {}

//   ngOnInit(): void {
//     const storedId = localStorage.getItem('empId');
//   if (storedId) {
//     this.employeeId = storedId;
//   } else {
//     console.error('No Employee ID found. Redirecting to login...');
//     // this.router.navigate(['/login']);
//     return;
//   }
//     this.fetchLeaveDetails();
//   }

//   fetchLeaveDetails(): void {
//     // Simulate API call with mock data
//     // setTimeout(() => {
//     //   this.leaveDetails = [
//     //     {
//     //       EmpId: '00000001',
//     //       Type: '0300',
//     //       AbsenceQuota: '4.00',
//     //       PayrollDays: '4.00',
//     //       PayrollHrs: '31.70',
//     //       StartDate: '/Date(1741651200000)/',
//     //       EndDate: '/Date(1741910400000)/',
//     //       LastChangedTime: 'PT00H00M00S',
//     //       LastChangedOn: null,
//     //       ChangedBy: '',
//     //       QuotaAssigned: '5.00',
//     //       QuotaUsed: '0.00',
//     //       QuotaType: '12'
//     //     },
//     //     {
//     //       EmpId: '00000001',
//     //       Type: '0720',
//     //       AbsenceQuota: '2.00',
//     //       PayrollDays: '2.00',
//     //       PayrollHrs: '16.00',
//     //       StartDate: '/Date(1744588800000)/',
//     //       EndDate: '/Date(1744675200000)/',
//     //       LastChangedTime: 'PT00H00M00S',
//     //       LastChangedOn: null,
//     //       ChangedBy: '',
//     //       QuotaAssigned: '5.00',
//     //       QuotaUsed: '0.00',
//     //       QuotaType: '12'
//     //     },
//     //     {
//     //       EmpId: '00000001',
//     //       Type: '0100',
//     //       AbsenceQuota: '3.00',
//     //       PayrollDays: '3.00',
//     //       PayrollHrs: '24.00',
//     //       StartDate: '/Date(1746297600000)/',
//     //       EndDate: '/Date(1746384000000)/',
//     //       LastChangedTime: 'PT00H00M00S',
//     //       LastChangedOn: null,
//     //       ChangedBy: '',
//     //       QuotaAssigned: '5.00',
//     //       QuotaUsed: '1.00',
//     //       QuotaType: '12'
//     //     }
//     //   ];
//     //   this.applyFilters();
//     //   this.isLoading = false;
//     // }, 1500);

//     this.http.get<any>(`http://localhost:3000/api/leave-details?empId=${this.employeeId}`)
//     .subscribe({
//       next: (response) => {
//         if (response.success) {
//           this.leaveDetails = response.leaveDetails;
//           this.applyFilters();
//         }
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Error fetching leave details:', err);
//         this.isLoading = false;
//       }
//     });
//   }

//   get uniqueTypes(): string[] {
//     return [...new Set(this.leaveDetails.map(leave => leave.Type))];
//   }

//   applyFilters(): void {
//     let filtered = [...this.leaveDetails];

//     // Filter by type
//     if (this.selectedType) {
//       filtered = filtered.filter(leave => leave.Type === this.selectedType);
//     }

//     // Filter by date
//     if (this.dateFilterOption) {
//       const now = new Date();
//       filtered = filtered.filter(leave => {
//         const startDate = new Date(parseInt(leave.StartDate.match(/\d+/)?.[0] || '0'));
//         switch (this.dateFilterOption) {
//           case 'upcoming':
//             return startDate > now;
//           case 'past':
//             return startDate < now;
//           case 'current':
//             return startDate <= now && new Date(parseInt(leave.EndDate.match(/\d+/)?.[0] || '0')) >= now;
//           default:
//             return true;
//         }
//       });
//     }

//     this.filteredLeaveDetails = filtered;
//     this.applySorting();
//   }

//   applySorting(): void {
//     this.filteredLeaveDetails.sort((a, b) => {
//       let valueA: any;
//       let valueB: any;

//       switch (this.sortBy) {
//         case 'type':
//           valueA = a.Type;
//           valueB = b.Type;
//           break;
//         case 'startDate':
//           valueA = new Date(parseInt(a.StartDate.match(/\d+/)?.[0] || '0'));
//           valueB = new Date(parseInt(b.StartDate.match(/\d+/)?.[0] || '0'));
//           break;
//         case 'endDate':
//           valueA = new Date(parseInt(a.EndDate.match(/\d+/)?.[0] || '0'));
//           valueB = new Date(parseInt(b.EndDate.match(/\d+/)?.[0] || '0'));
//           break;
//         case 'quotaAssigned':
//           valueA = parseFloat(a.QuotaAssigned) || 0;
//           valueB = parseFloat(b.QuotaAssigned) || 0;
//           break;
//         case 'quotaUsed':
//           valueA = parseFloat(a.QuotaUsed) || 0;
//           valueB = parseFloat(b.QuotaUsed) || 0;
//           break;
//         case 'availableBalance':
//           valueA = this.getAvailableBalance(a.QuotaAssigned, a.QuotaUsed);
//           valueB = this.getAvailableBalance(b.QuotaAssigned, b.QuotaUsed);
//           break;
//         default:
//           return 0;
//       }

//       if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
//       if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
//       return 0;
//     });
//   }

//   toggleSortOrder(): void {
//     this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
//     this.applySorting();
//   }

//   formatDate(dateString: string): string {
//     const date = new Date(parseInt(dateString.match(/\d+/)?.[0] || '0'));
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   }

//   getAvailableBalance(quotaAssigned: string, quotaUsed: string): number {
//     const assigned = parseFloat(quotaAssigned) || 0;
//     const used = parseFloat(quotaUsed) || 0;
//     return assigned - used;
//   }

//   getProgressPercentage(quotaAssigned: string, quotaUsed: string): number {
//     const assigned = parseFloat(quotaAssigned) || 0;
//     const used = parseFloat(quotaUsed) || 0;
//     if (assigned <= 0) return 0;
//     return Math.min((used / assigned) * 100, 100);
//   }

//   getLeaveTypeDescription(type: string): string {
//     const typeMap: { [key: string]: string } = {
//       '0300': 'Annual Leave',
//       '0720': 'Sick Leave',
//       '0100': 'Casual Leave',
//       '0200': 'Maternity Leave',
//       '0500': 'Paternity Leave'
//     };
//     return typeMap[type] || type;
//   }

//   goBack(): void {
//     this.router.navigate(['/home']);
//   }
// }
