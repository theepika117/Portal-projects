import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pay-slip.component.html',
  styleUrls: ['./pay-slip.component.scss']
})
export class PayslipComponent implements OnInit {

  constructor(private router: Router, private http: HttpClient) {}

  payslipData: { key: string, value: string }[] = [];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  isLoading = true;

  ngOnInit(): void {
    this.loadStoredMonthYear();
    if (this.selectedMonth && this.selectedYear) {
      this.fetchPayslipData();
    } else {
      this.isLoading = false;
    }
  }

  loadStoredMonthYear(): void {
    const stored = localStorage.getItem('payslipMonthYear');
    if (stored) {
      const [month, year] = stored.split('-');
      this.selectedMonth = parseInt(month);
      this.selectedYear = parseInt(year);
    } else {
      this.selectedMonth = 0;
      this.selectedYear = 0;
    }
  }

  saveMonthYear(): void {
    if (this.selectedMonth && this.selectedYear) {
      localStorage.setItem('payslipMonthYear', `${this.selectedMonth}-${this.selectedYear}`);
      this.fetchPayslipData();
    }
  }

  fetchPayslipData(): void {
    this.isLoading = true;

    // const empId = '00000001'; // You can make this dynamic later
    let empId = '';
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('employeeData') || sessionStorage.getItem('employeeData');
      if (stored) {
        const userData = JSON.parse(stored);
        empId = userData.empId;
      }
    }

    if (!empId) {
      console.error('No employee ID found in storage');
      this.payslipData = [];
      this.isLoading = false;
      return;
    }
    this.http.get<any>(`http://localhost:3000/api/payslip-details?empId=${empId}`).subscribe({
      next: (res) => {
        if (res && res.success && res.payslipDetails.length > 0) {
          const details = res.payslipDetails[0]; // Assuming first record for now
          this.payslipData = Object.keys(details)
            .filter(key => !key.startsWith('__')) // ignore metadata
            .map(key => ({ key, value: details[key] }));
        } else {
          this.payslipData = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching payslip data:', err);
        this.payslipData = [];
        this.isLoading = false;
      }
    });
  }

  getMonths(): { value: number, name: string }[] {
    return [
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' }
    ];
  }

  getMonthName(monthNumber: number | null): string {
    if (!monthNumber) return '';
    const months = this.getMonths();
    const month = months.find(m => m.value === monthNumber);
    return month ? month.name : '';
  }

  getYears(): number[] {
    const startYear = 2020;
    const endYear = 2025;
    const years = [];
    for (let i = startYear; i <= endYear; i++) {
      years.push(i);
    }
    return years;
  }

  getIconForField(field: string) {
    const icons: any = {
      Company_Code: '🏢',
      Emp_Id: '🆔',
      Fname: '👤',
      Lname: '👤',
      Pay_Scale_Group: '📊',
      Pay_Scale_Level: '📈',
      Wage_Type_Amt: '💵',
      Waers: '💱',
    };
    return icons[field] || '📄';
  }

  downloadPayslip() {
    alert(`Payslip download started for ${this.selectedMonth}/${this.selectedYear}...`);
  }

  goBack(): void {
    this.router.navigate(['/home']); 
  }
}





















// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-payslip',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './pay-slip.component.html',
//   styleUrls: ['./pay-slip.component.scss']
// })
// export class PayslipComponent implements OnInit {

//   constructor(private router: Router) {}

//   payslipData = [
//     { key: 'Company_Code', value: 'AT01' },
//     { key: 'Emp_Id', value: '00000002' },
//     { key: 'Fname', value: 'Malik' },
//     { key: 'Lname', value: 'Malik' },
//     { key: 'Pay_Scale_Group', value: '03' },
//     { key: 'Pay_Scale_Level', value: '06' },
//     { key: 'Wage_Type_Amt', value: '5000.00' },
//     { key: 'Waers', value: 'EUR' },
//   ];

//   selectedMonth = new Date().getMonth() + 1;
//   selectedYear = new Date().getFullYear();
//   isLoading = true;

//   ngOnInit(): void {
//     this.loadStoredMonthYear();
//     if (this.selectedMonth && this.selectedYear) {
//       this.fetchPayslipData();
//     } else {
//       this.isLoading = false;
//     }
//   }


// // Loads the previously selected month and year from local storage.
//   loadStoredMonthYear(): void {
//     const stored = localStorage.getItem('payslipMonthYear');
//     if (stored) {
//       const [month, year] = stored.split('-');
//       this.selectedMonth = parseInt(month);
//       this.selectedYear = parseInt(year);
//     } else {
//       this.selectedMonth = 0;
//       this.selectedYear = 0;
//     }
//   }

//   saveMonthYear(): void {
//     if (this.selectedMonth && this.selectedYear) {
//       localStorage.setItem('payslipMonthYear', `${this.selectedMonth}-${this.selectedYear}`);
//       this.fetchPayslipData();
//     }
//   }

//   fetchPayslipData(): void {
//     this.isLoading = true;
//     // Simulate API call with selected month/year
//     setTimeout(() => {
//       // In real implementation, this would call backend with selectedMonth and selectedYear
//       this.isLoading = false;
//     }, 1500);
//   }

//   // getMonths(): number[] {
//   //   return Array.from({length: 12}, (_, i) => i + 1);
//   // }
//   getMonths(): { value: number, name: string }[] {
//     return [
//       { value: 1, name: 'January' },
//       { value: 2, name: 'February' },
//       { value: 3, name: 'March' },
//       { value: 4, name: 'April' },
//       { value: 5, name: 'May' },
//       { value: 6, name: 'June' },
//       { value: 7, name: 'July' },
//       { value: 8, name: 'August' },
//       { value: 9, name: 'September' },
//       { value: 10, name: 'October' },
//       { value: 11, name: 'November' },
//       { value: 12, name: 'December' }
//     ];
//   }

//   // Returns the name of the month for a given month number.
//   getMonthName(monthNumber: number | null): string {
//     if (!monthNumber) {
//       return '';
//     }
//     const months = this.getMonths();
//     const month = months.find(m => m.value === monthNumber);
//     return month ? month.name : '';
//   }

//   // getYears(): number[] {
//   //   const currentYear = new Date().getFullYear();
//   //   return Array.from({length: 10}, (_, i) => currentYear - 5 + i);
//   // }

//   // Returns an array of years centered around the current year.
//    getYears(): number[] {
//     const startYear = 2020;
//     const endYear = 2025;
//     const years = [];
//     for (let i = startYear; i <= endYear; i++) {
//       years.push(i);
//     }
//     return years;
//   }

//   getIconForField(field: string) {
//     const icons: any = {
//       Company_Code: '🏢',
//       Emp_Id: '🆔',
//       Fname: '👤',
//       Lname: '👤',
//       Pay_Scale_Group: '📊',
//       Pay_Scale_Level: '📈',
//       Wage_Type_Amt: '💵',
//       Waers: '💱',
//     };
//     return icons[field] || '📄';
//   }

//   downloadPayslip() {
//     alert(`Payslip download started for ${this.selectedMonth}/${this.selectedYear}...`);
//   }

//   goBack(): void {
//     this.router.navigate(['/home']); 
//   }
// }














// // import { Component, OnInit } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { Router } from '@angular/router';

// // interface PayslipDetail {
// //   Emp_Id: string;
// //   Company_Code: string;
// //   Emp_Grp: string;
// //   Emp_Sub_Grp: string;
// //   Emp_Position: string;
// //   Job: string;
// //   Org_Unit: string;
// //   Cost_Center: string;
// //   Payroll_Area: string;
// //   Title: string;
// //   Fname: string;
// //   Lname: string;
// //   Gender: string;
// //   Wage_Type: string;
// //   Wage_Type_Amt: string;
// //   Pay_Scale_Group: string;
// //   Pay_Scale_Level: string;
// //   Pay_Scale_Area: string;
// //   Waers: string;
// // }

// // @Component({
// //   selector: 'app-payslip',
// //   standalone: true,
// //   imports: [CommonModule],
// //   templateUrl: './pay-slip.component.html',
// //   styleUrls: ['./pay-slip.component.scss']
// // })
// // export class PayslipComponent implements OnInit {
// //   payslipData: PayslipDetail | null = null;
// //   isLoading = true;

// //   constructor(private router: Router) {}

// //   ngOnInit(): void {
// //     this.fetchMockPayslip();
// //   }

// //   fetchMockPayslip(): void {
// //     setTimeout(() => {
// //       this.payslipData = {
// //         Emp_Id: '00000002',
// //         Company_Code: 'AT01',
// //         Emp_Grp: '1',
// //         Emp_Sub_Grp: 'AH',
// //         Emp_Position: '99999999',
// //         Job: '00000000',
// //         Org_Unit: '00000000',
// //         Cost_Center: '',
// //         Payroll_Area: '01',
// //         Title: '',
// //         Fname: 'Malik',
// //         Lname: 'Malik',
// //         Gender: '1',
// //         Wage_Type: 'M020',
// //         Wage_Type_Amt: '5000.00',
// //         Pay_Scale_Group: '03',
// //         Pay_Scale_Level: '06',
// //         Pay_Scale_Area: '10',
// //         Waers: 'EUR'
// //       };
// //       this.isLoading = false;
// //     }, 1500);
// //   }

// //   goBack(): void {
// //     this.router.navigate(['/home']); // Go back to home
// //   }
// // }










// // // import { Component } from '@angular/core';

// // // @Component({
// // //   selector: 'app-pay-slip',
// // //   imports: [],
// // //   templateUrl: './pay-slip.component.html',
// // //   styleUrl: './pay-slip.component.scss'
// // // })
// // // export class PaySlipComponent {

// // // }
