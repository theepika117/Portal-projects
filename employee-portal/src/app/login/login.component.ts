import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpClientModule} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage: string | null = null;

  // // Mock data for demo
  // mockUsers = [
  //   { empId: '00000001', password: 'TEST@123' },
  //   { empId: '00000002', password: 'TEST@123' },
  //   { empId: '00000003', password: 'TEST@123' },
  //   { empId: '00000004', password: 'TEST@123' },
  //   { empId: '00000005', password: 'TEST@123' },
  //   { empId: '00000011', password: 'TEST@123' },
  //   { empId: '00000012', password: 'TEST@123' },
  //   { empId: '00000013', password: 'TEST@123' },
  //   { empId: '00000014', password: 'TEST@123' },
  //   { empId: '00000015', password: 'TEST@123' }
  // ];
  // The URL for your new Node.js middleware server
  private readonly middlewareUrl = 'http://localhost:3000/api/login-odata';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

//   onSubmit(): void {
//   if (this.loginForm.invalid) {
//     this.markFormGroupTouched(this.loginForm);
//     return;
//   }

//   this.isLoading = true;
//   const { employeeId, password } = this.loginForm.value;

//   // Simulate API call with mock data
//   setTimeout(() => {
//     const user = this.mockUsers.find(
//       u => u.empId === employeeId && u.password === password
//     );

//     if (user) {
//       const userData = {
//         empId: user.empId,
//         loginTime: new Date().toISOString()
//       };

//       if (typeof window !== 'undefined') {
//         if (this.loginForm.value.rememberMe) {
//           localStorage.setItem('employeeData', JSON.stringify(userData));
//           localStorage.setItem('employeeId', user.empId); // store empId separately
//         } else {
//           sessionStorage.setItem('employeeData', JSON.stringify(userData));
//           sessionStorage.setItem('employeeId', user.empId); // store empId separately
//         }
//       }

//       this.router.navigate(['/home']);
//     } else {
//       alert('Invalid Employee ID or Password');
//     }

//     this.isLoading = false;
//   }, 1500);
// }

 onSubmit(): void {
    // Clear any previous error messages
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    const { employeeId, password } = this.loginForm.value;

    this.loginWithMiddleware(employeeId, password);
  }

  private loginWithMiddleware(employeeId: string, password: string): void {
    // The Angular frontend now sends a POST request to the middleware
    // with the employeeId and password in the request body.
    const loginPayload = { employeeId, password };

    // The middleware will handle the Basic Auth and communication with SAP.
    // The frontend no longer needs to know the SAP URL or credentials.
    this.http.post<any>(this.middlewareUrl, loginPayload)
      .pipe(
        // Handle API errors gracefully
        catchError((error: HttpErrorResponse) => {
          console.error('API Error:', error);
          this.isLoading = false;
          // Use the error message from the middleware
          this.errorMessage = error.error?.error || 'An unexpected error occurred.';
          return of(null); // Return a new observable with a null value to prevent re-throwing the error
        })
      )
      .subscribe(response => {
        this.isLoading = false;

        localStorage.clear();
        sessionStorage.clear();

        // Check if the middleware returned a success response
        if (response && response.success) {
          console.log('Login successful!', response.message);

          const userData = {
            empId: employeeId,
            loginTime: new Date().toISOString()
          };

          if (typeof window !== 'undefined') {
            if (this.loginForm.value.rememberMe) {
              localStorage.setItem('employeeData', JSON.stringify(userData));
            } else {
              sessionStorage.setItem('employeeData', JSON.stringify(userData));
            }
          }
          this.router.navigate(['/home']);
        } else {
          // The middleware returned a non-success response (e.g., 401)
          this.errorMessage = 'Invalid Employee ID or Password.';
          console.warn('Login failed: Invalid credentials.');
        }
      });
  }


private markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();
  });
}


ngOnInit(): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const savedUser = localStorage.getItem('employeeData');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      console.log('Previous login found:', userData);
      // Optional: automatically navigate to home
      // this.router.navigate(['/home']);
    }
  }
}
}















// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule, NgIf } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { ApiService } from '../services/api.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, NgIf, HttpClientModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent {
//   loginForm: FormGroup;
//   isLoading = false;
//   showPassword = false;
//   errorMessage: string | null = null;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private apiService: ApiService // Inject the new service
//   ) {
//     this.loginForm = this.fb.group({
//       employeeId: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       rememberMe: [false]
//     });
//   }

//   // // Mock data for demo
//   // mockUsers = [
//   //   { empId: '00000001', password: 'TEST@123' },
//   //   { empId: '00000002', password: 'TEST@123' },
//   //   { empId: '00000003', password: 'TEST@123' },
//   //   { empId: '00000004', password: 'TEST@123' },
//   //   { empId: '00000005', password: 'TEST@123' },
//   //   { empId: '00000011', password: 'TEST@123' },
//   //   { empId: '00000012', password: 'TEST@123' },
//   //   { empId: '00000013', password: 'TEST@123' },
//   //   { empId: '00000014', password: 'TEST@123' },
//   //   { empId: '00000015', password: 'TEST@123' }
//   // ];


//   togglePasswordVisibility(): void {
//     this.showPassword = !this.showPassword;
//   }

// //   onSubmit(): void {
// //   if (this.loginForm.invalid) {
// //     this.markFormGroupTouched(this.loginForm);
// //     return;
// //   }

// //   this.isLoading = true;
// //   const { employeeId, password } = this.loginForm.value;

// //   // Simulate API call with mock data
// //   setTimeout(() => {
// //     const user = this.mockUsers.find(
// //       u => u.empId === employeeId && u.password === password
// //     );

// //     if (user) {
// //       const userData = {
// //         empId: user.empId,
// //         loginTime: new Date().toISOString()
// //       };

// //       if (typeof window !== 'undefined') {
// //         if (this.loginForm.value.rememberMe) {
// //           localStorage.setItem('employeeData', JSON.stringify(userData));
// //           localStorage.setItem('employeeId', user.empId); // store empId separately
// //         } else {
// //           sessionStorage.setItem('employeeData', JSON.stringify(userData));
// //           sessionStorage.setItem('employeeId', user.empId); // store empId separately
// //         }
// //       }

// //       this.router.navigate(['/home']);
// //     } else {
// //       alert('Invalid Employee ID or Password');
// //     }

// //     this.isLoading = false;
// //   }, 1500);
// // }

// // private markFormGroupTouched(formGroup: FormGroup): void {
// //   Object.keys(formGroup.controls).forEach(key => {
// //     const control = formGroup.get(key);
// //     control?.markAsTouched();
// //   });
// // }


// onSubmit(): void {
//     this.errorMessage = null; // Clear previous error messages

//     if (this.loginForm.invalid) {
//       this.markFormGroupTouched(this.loginForm);
//       return;
//     }

//     this.isLoading = true;
//     const { employeeId, password } = this.loginForm.value;

//     // Call the API service for authentication
//     this.apiService.login(employeeId, password).subscribe({
//       next: (response) => {
//         // OData response for a successful login should contain results
//         if (response && response.d && response.d.results && response.d.results.length > 0) {
//           const userData = {
//             empId: response.d.results[0].EmpId,
//             loginTime: new Date().toISOString()
//           };
          
//           if (typeof window !== 'undefined') {
//             if (this.loginForm.value.rememberMe) {
//               localStorage.setItem('employeeData', JSON.stringify(userData));
//               localStorage.setItem('employeeId', userData.empId);
//             } else {
//               sessionStorage.setItem('employeeData', JSON.stringify(userData));
//               sessionStorage.setItem('employeeId', userData.empId);
//             }
//           }

//           this.router.navigate(['/home']);
//         } else {
//           // No results found for the given credentials
//           this.errorMessage = 'Invalid Employee ID or Password.';
//         }
//         this.isLoading = false;
//       },
//       error: (error) => {
//         // Handle API errors, e.g., network issues or authentication failures
//         console.error('Login API Error:', error);
//         this.errorMessage = 'An error occurred during login. Please try again later.';
//         this.isLoading = false;
//       }
//     });
//   }

//   private markFormGroupTouched(formGroup: FormGroup): void {
//     Object.keys(formGroup.controls).forEach(key => {
//       const control = formGroup.get(key);
//       control?.markAsTouched();
//     });
//   }

  


// ngOnInit(): void {
//   if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
//     const savedUser = localStorage.getItem('employeeData');
//     if (savedUser) {
//       const userData = JSON.parse(savedUser);
//       console.log('Previous login found:', userData);
//       // Optional: automatically navigate to home
//       // this.router.navigate(['/home']);
//     }
//   }
// }
// }
