import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';
//import { tap } from 'rxjs/operators';

interface EmployeeProfile {
  EmpId: string;
  Fname: string;
  Lname: string;
  Gender: string;
  Address: string;
  City: string;
  State: string;
  Country: string;
  Nationality: string;
  CompanyCode: string;
  CostCenter: string;
  JobPosition: string;
  Job: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  employeeProfile: EmployeeProfile | null = null;
  isLoading = true;
  errorMessage = '';


  private readonly middlewareUrl = 'http://localhost:3000/api/profile-odata';


    constructor(
    private router: Router,
    private http: HttpClient // Inject HttpClient
  ) {}


  // public fetchProfileData(): void {
  //   // Simulate API call with mock data
  //   setTimeout(() => {
  //     this.employeeProfile = {
  //       EmpId: '00000002',
  //       Fname: 'Malik',
  //       Lname: 'Malik',
  //       Gender: '1',
  //       Address: 'Anna nagar',
  //       City: 'Madurai',
  //       State: '',
  //       Country: '',
  //       Nationality: 'SA',
  //       CompanyCode: 'AT01',
  //       CostCenter: '',
  //       JobPosition: '99999999',
  //       Job: '00000000'
  //     };
  //     this.isLoading = false;
  //   }, 1000); // Simulate network delay
  // }

  // getGenderDisplay(gender: string): string {
  //   return gender === '1' ? 'Male' : gender === '2' ? 'Female' : 'Other';
  // }

  // getFullName(): string {
  //   return this.employeeProfile 
  //     ? `${this.employeeProfile.Fname} ${this.employeeProfile.Lname}`
  //     : '';
  // }


  ngOnInit(): void {
    // Call the method to fetch the profile data
    this.fetchProfileData();
  }

  // public fetchProfileData(): void {
  //   this.isLoading = true;
  //   this.errorMessage = '';
   

  //   const employeeDataString = sessionStorage.getItem('employeeData') || localStorage.getItem('employeeData');
  //   if (!employeeDataString) {
  //   this.errorMessage = 'Please log in again.';
  //   this.isLoading = false;
  //   return;
  // }

  // const { empId } = JSON.parse(employeeDataString);

  // this.http.get<EmployeeProfile>(`${this.middlewareUrl}/${empId}`)
  //   .subscribe(profile => {
  //     this.isLoading = false;
  //     if (profile) {
  //       console.log('Profile from middleware:', profile); // Debug
  //       this.employeeProfile = profile; // <-- No mixing with old data
  //     }
  //   });




  //   // Make the GET request to the middleware
  //   this.http.get<EmployeeProfile>(`${this.middlewareUrl}/${empId}`)
  //     .pipe(
  //       catchError((error: HttpErrorResponse) => {
  //         this.isLoading = false;
  //         console.error('API Error:', error);
  //         this.errorMessage = error.error?.error || 'An unexpected error occurred.';
  //         return of(null);
  //       })
  //     )
  //     .subscribe(profile => {
  //       console.log("📦 Profile data received in Angular:", profile); 
  //       this.isLoading = false;
  //       if (profile) {
  //         console.log("Profile data from middleware:", profile); 
  //         this.employeeProfile = profile;
  //       }
  //     });
  // }
  public fetchProfileData(): void {
  this.isLoading = true;
  this.errorMessage = '';

  const employeeDataString =
    sessionStorage.getItem('employeeData') ||
    localStorage.getItem('employeeData');

  if (!employeeDataString) {
    this.errorMessage = 'Please log in again.';
    this.isLoading = false;
    return;
  }

  const { empId } = JSON.parse(employeeDataString);

  console.log("🔍 Fetching profile for empId:", empId); // Debug

  this.http.get<EmployeeProfile>(`${this.middlewareUrl}/${empId}`)
    .pipe(
      
      catchError((error: HttpErrorResponse) => {
        console.log("🔍 Fetching profile for:", empId);
        this.isLoading = false;
        console.error('❌ API Error:', error);
        this.errorMessage = error.error?.error || 'An unexpected error occurred.';
        return of(null);
      })
    )
    .subscribe(profile => {
      this.isLoading = false;
      console.log("📦 Profile data received in Angular:", profile); // Debug
      if (profile) {
        this.employeeProfile = profile;
      }
    });
}


  getGenderDisplay(gender: string): string {
    return gender === '1' ? 'Male' : gender === '2' ? 'Female' : 'Other';
  }

  getFullName(): string {
    return this.employeeProfile
      ? `${this.employeeProfile.Fname} ${this.employeeProfile.Lname}`
      : '';
  }


  goBack(): void {
    this.router.navigate(['/home']);
  }
}
