// src/app/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  cardHover = false;
  buttonHover = false;
  isLoggingIn = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      customerId: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        // Reverted to the pattern that includes lowercase letters for "TEST@123" to work
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
      ]]
    });

    // Check if localStorage is available and if 'customerId' actually has a value
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedCustomerId = localStorage.getItem('customerId');
      if (storedCustomerId) { // Only redirect if storedCustomerId is not null or an empty string
        console.log('Found customerId in localStorage, redirecting to /list-of-delivery:', storedCustomerId);
        this.router.navigate(['/list-of-delivery']);
      } else {
        console.log('No valid customerId found in localStorage. Staying on login page.');
      }
    } else {
      console.warn('AuthService: localStorage not available (likely non-browser context). Cannot check for stored customerId.');
    }
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    const { customerId, password } = this.loginForm.value;
    this.isLoggingIn = true;

    this.authService.login(customerId, password).subscribe({
      next: (response) => {
        this.isLoggingIn = false;

        if (response.status === 'S') {
          // localStorage.setItem('customerId', customerId); // This is now handled in AuthService, no need to duplicate here
          this.snackBar.open('Login successful', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        } else {
          this.snackBar.open(response.message || 'Login failed. Please check your credentials.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
        }
      },
      error: error => {
        this.isLoggingIn = false;
        console.error('Login error:', error);
        const errorMessage = error.error?.error || error.message || 'Server error. Please try again later.';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }
}



















// // src/app/login/login.component.ts

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../auth.service';

// // Angular Material Modules
// import { MatCardModule } from '@angular/material/card';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatInputModule,
//     MatButtonModule,
//     MatFormFieldModule,
//     MatSnackBarModule,
//     MatProgressSpinnerModule
//   ],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   cardHover = false;
//   buttonHover = false;
//   isLoggingIn = false;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService,
//     private snackBar: MatSnackBar
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       customerId: ['', Validators.required],
//       password: ['', [
//         Validators.required,
//         Validators.minLength(8),
//         // Revert to the pattern that includes lowercase letters
//         Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
//       ]]
//     });

//     // Optional: Check if already logged in (e.g., customerId exists in localStorage)
//     // If so, redirect to dashboard or deliveries page immediately
//     if (typeof window !== 'undefined' && window.localStorage && localStorage.getItem('customerId')) {
//       this.router.navigate(['/list-of-delivery']); // Or your dashboard route
//     }
//   }

//   onLogin(): void {
//     if (this.loginForm.invalid) {
//       this.loginForm.markAllAsTouched();
//       this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
//       return;
//     }

//     const { customerId, password } = this.loginForm.value;
//     this.isLoggingIn = true;

//     this.authService.login(customerId, password).subscribe({
//       next: (response) => {
//         this.isLoggingIn = false;

//         if (response.status === 'S') {
//           // localStorage.setItem('customerId', customerId); // This is now handled in AuthService
//           this.snackBar.open('Login successful', 'Close', { duration: 3000 });
//           this.router.navigate(['/list-of-delivery']);
//         } else {
//           this.snackBar.open(response.message || 'Login failed. Please check your credentials.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
//         }
//       },
//       error: error => {
//         this.isLoggingIn = false;
//         console.error('Login error:', error);
//         const errorMessage = error.error?.error || error.message || 'Server error. Please try again later.';
//         this.snackBar.open(errorMessage, 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
//       }
//     });
//   }
// }















// // src/app/login/login.component.ts

// import { Component, OnInit } from '@angular/core';

// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// import { Router } from '@angular/router';

// import { CommonModule } from '@angular/common';

// import { AuthService } from '../auth.service';



// // Angular Material Modules

// import { MatCardModule } from '@angular/material/card';

// import { MatInputModule } from '@angular/material/input';

// import { MatButtonModule } from '@angular/material/button';

// import { MatFormFieldModule } from '@angular/material/form-field';

// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



// @Component({

// selector: 'app-login',

// standalone: true,

// imports: [

// CommonModule,

// ReactiveFormsModule,

// MatCardModule,

// MatInputModule,

// MatButtonModule,

// MatFormFieldModule,

// MatSnackBarModule,

// MatProgressSpinnerModule // ✅ added here

// ],

// templateUrl: './login.component.html',

// styleUrls: ['./login.component.scss']

// })

// export class LoginComponent implements OnInit {

// loginForm!: FormGroup;

// cardHover = false;

// buttonHover = false;

// isLoggingIn = false; // ✅ spinner/loading state



// constructor(

// private fb: FormBuilder,

// private router: Router,

// private authService: AuthService,

// private snackBar: MatSnackBar

// ) {}



// ngOnInit(): void {

// this.loginForm = this.fb.group({

// customerId: ['', Validators.required],

// password: ['', [

// Validators.required,

// Validators.minLength(8),

// //Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)

// Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)




// ]]

// });

// }



// onLogin(): void {

// if (this.loginForm.invalid) {

// this.loginForm.markAllAsTouched();

// return;

// }



// const { customerId, password } = this.loginForm.value;

// this.isLoggingIn = true;



// this.authService.login(customerId, password).subscribe({

// next: success => {

// this.isLoggingIn = false;



// if (success) {

// this.snackBar.open('Login successful', 'Close', { duration: 3000 });

// this.router.navigate(['/home']);

// } else {

// this.snackBar.open('Login failed. Please check your credentials.', 'Close', { duration: 3000 });

// }

// },

// error: error => {

// this.isLoggingIn = false;

// console.error('Login error:', error);

// this.snackBar.open('Server error. Please try again later.', 'Close', { duration: 3000 });

// }

// });

// }

// }

















// src/app/login/login.component.ts
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../auth.service'; // Your existing AuthService

// // Angular Material Modules
// import { MatCardModule } from '@angular/material/card';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatInputModule,
//     MatButtonModule,
//     MatFormFieldModule,
//     MatSnackBarModule,
//     MatProgressSpinnerModule
//   ],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   cardHover = false;
//   buttonHover = false;
//   isLoggingIn = false;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService, // Your existing AuthService
//     private snackBar: MatSnackBar
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       customerId: ['', Validators.required],
//       password: ['', [
//         Validators.required,
//         Validators.minLength(8),
//         //Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
//         Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Z\d!@#$%^&*()_+]{8,}$/)
//       ]]
//     });

//     // Optional: Check if already logged in (e.g., customerId exists in localStorage)
//     // If so, redirect to dashboard or deliveries page immediately
//     if (localStorage.getItem('customerId')) {
//       this.router.navigate(['/list-of-delivery']); // Or your dashboard route
//     }
//   }

//   onLogin(): void {
//     if (this.loginForm.invalid) {
//       this.loginForm.markAllAsTouched();
//       this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
//       return;
//     }

//     const { customerId, password } = this.loginForm.value;
//     this.isLoggingIn = true;

//     this.authService.login(customerId, password).subscribe({
//       next: (response) => { // Changed 'success' to 'response' to handle status object
//         this.isLoggingIn = false;

//         // Assuming AuthService.login now returns an object with 'status' and 'message'
//         if (response.status === 'S') { // Check the status from the backend response
//           // ****************************************************
//           // IMPORTANT: Store customerId in localStorage upon successful login
//           // ****************************************************
//           localStorage.setItem('customerId', customerId); // Store the actual customerId
//           this.snackBar.open('Login successful', 'Close', { duration: 3000 });
//           this.router.navigate(['/list-of-delivery']); // Navigate to deliveries page or dashboard
//         } else {
//           this.snackBar.open(response.message || 'Login failed. Please check your credentials.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
//         }
//       },
//       error: error => {
//         this.isLoggingIn = false;
//         console.error('Login error:', error);
//         // Display a more specific error if available from the backend
//         const errorMessage = error.error?.error || error.message || 'Server error. Please try again later.';
//         this.snackBar.open(errorMessage, 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
//       }
//     });
//   }
// }













// // src/app/login/login.component.ts
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../auth.service';

// // Angular Material Modules
// import { MatCardModule } from '@angular/material/card';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatInputModule,
//     MatButtonModule,
//     MatFormFieldModule,
//     MatSnackBarModule,
//     MatProgressSpinnerModule // ✅ added here
//   ],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   cardHover = false;
//   buttonHover = false;
//   isLoggingIn = false; // ✅ spinner/loading state

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService,
//     private snackBar: MatSnackBar
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       customerId: ['', Validators.required],
//       password: ['', [
//         Validators.required,
//         Validators.minLength(8),
//         //Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
//         Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Z\d!@#$%^&*()_+]{8,}$/)

//       ]]
//     });
//   }

//   onLogin(): void {
//     if (this.loginForm.invalid) {
//       this.loginForm.markAllAsTouched();
//       return;
//     }

//     const { customerId, password } = this.loginForm.value;
//     this.isLoggingIn = true;

//     this.authService.login(customerId, password).subscribe({
//       next: success => {
//         this.isLoggingIn = false;

//         if (success) {
//           this.snackBar.open('Login successful', 'Close', { duration: 3000 });
//           this.router.navigate(['/home']);
//         } else {
//           this.snackBar.open('Login failed. Please check your credentials.', 'Close', { duration: 3000 });
//         }
//       },
//       error: error => {
//         this.isLoggingIn = false;
//         console.error('Login error:', error);
//         this.snackBar.open('Server error. Please try again later.', 'Close', { duration: 3000 });
//       }
//     });
//   }
// }












// // src/app/login/login.component.ts
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../auth.service';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


// // Angular Material Modules
// import { MatCardModule } from '@angular/material/card';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';



// @Component({
  
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatInputModule,
//     MatButtonModule,
//     MatFormFieldModule,
//     MatSnackBarModule
//   ],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   cardHover = false;
//   buttonHover = false;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService,
//     private snackBar: MatSnackBar
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       customerId: ['', Validators.required],
//       password: ['', [
//         Validators.required,
//         Validators.minLength(8),
//         Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
//       ]]
//     });
//   }

//   onLogin(): void {
//     if (this.loginForm.invalid) {
//       this.loginForm.markAllAsTouched();
//       return;
//     }

//     const { customerId, password } = this.loginForm.value;

//     this.authService.login(customerId, password).subscribe(success => {
//       if (success) {
//         this.snackBar.open('Login successful', 'Close', { duration: 3000 });
//         this.router.navigate(['/home']);
//       } else {
//         this.snackBar.open('Login failed. Please check your credentials.', 'Close', { duration: 3000 });
//       }
//     }, error => {
//       console.error('Login error:', error);
//       this.snackBar.open('Server error. Please try again later.', 'Close', { duration: 3000 });
//     });
//   }
// }










// // src/app/login/login.component.ts
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';

// // Angular Material Imports
// import { MatCardModule } from '@angular/material/card';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';

// import { AuthService } from '../auth.service'; // Import AuthService

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatInputModule,
//     MatButtonModule,
//     MatFormFieldModule
//   ],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   cardHover: boolean = false;
//   buttonHover: boolean = false;

//   // Inject AuthService along with FormBuilder and Router
//   constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) { }

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       customerId: ['', Validators.required],
//       password: ['', [
//         Validators.required,
//         Validators.minLength(8),
//         Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
//       ]]
//     });
//   }

//   onLogin(): void {
//     if (this.loginForm.valid) {
//       const { customerId, password } = this.loginForm.value;

//       // Use AuthService for login
//       const loginSuccess = this.authService.login(customerId, password);

//       if (loginSuccess) {
//         console.log('Login successful. Navigating to Home.');
//         this.router.navigate(['/home']); // Navigate to the home/dashboard page
//       } else {
//         console.error('Login failed: Invalid customer ID or password.');
//         // You might want to display a user-friendly error message on the UI here
//         // For example, by setting a form error or using a MatSnackBar.
//       }
//     } else {
//       console.log('Form is invalid. Please check the fields.');
//       this.loginForm.markAllAsTouched();
//     }
//   }
// }
















// // src/app/login/login.component.ts
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common'; // <--- ADD THIS IMPORT for *ngIf and ngClass

// // Angular Material Imports for Standalone Components
// import { MatCardModule } from '@angular/material/card';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,        // <--- ADD CommonModule here
//     ReactiveFormsModule,
//     MatCardModule,
//     MatInputModule,
//     MatButtonModule,
//     MatFormFieldModule
//   ],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   cardHover: boolean = false;
//   buttonHover: boolean = false;

//   constructor(private fb: FormBuilder, private router: Router) { }

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       customerId: ['', Validators.required],
//       password: ['', [
//         Validators.required,
//         Validators.minLength(8),
//         Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
//       ]]
//     });
//   }

//   onLogin(): void {
//     if (this.loginForm.valid) {
//       const { customerId, password } = this.loginForm.value;
//       console.log('Login attempt:', { customerId, password });

//       // Simulate API call delay
//       setTimeout(() => {
//         console.log('Simulating successful login. Navigating to Home.');
//         this.router.navigate(['/home']);
//       }, 1000);
//     } else {
//       console.log('Form is invalid. Please check the fields.');
//       this.loginForm.markAllAsTouched();
//     }
//   }
// }









// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-login',
// //   imports: [],
// //   templateUrl: './login.component.html',
// //   styleUrl: './login.component.scss'
// // })
// // export class LoginComponent {

// // }
