// src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar'; // Add MatToolbarModule
import { MatIconModule } from '@angular/material/icon'; // Add MatIconModule for toolbar icon
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Add MatSnackBar and MatSnackBarModule

import { AuthService } from '../auth.service';
import { CustomerService, CustomerProfile } from '../customer.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule, // Include MatToolbarModule
    MatIconModule,    // Include MatIconModule
    MatSnackBarModule // Include MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  customerProfile: CustomerProfile | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private customerService: CustomerService,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchCustomerProfile();
  }

  /**
   * Fetches the customer profile details from the CustomerService.
   * Uses the customerId from AuthService.
   */
  fetchCustomerProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const customerId = this.authService.getCurrentCustomerId();

    if (customerId) {
      this.customerService.getCustomerProfile(customerId).subscribe({
        next: (profile) => {
          this.customerProfile = profile;
          this.isLoading = false;
          console.log('Customer Profile Data:', profile);
        },
        error: (err) => {
          this.errorMessage = err.message || 'An unknown error occurred while fetching profile.';
          this.isLoading = false;
          console.error('Error fetching customer profile:', err);
          this.snackBar.open(this.errorMessage ?? 'Failed to load profile.', 'Close', { duration: 5000 });
        }
      });
    } else {
      this.errorMessage = 'No customer ID found. Please log in again.';
      this.isLoading = false;
      console.warn('No customer ID available in AuthService to fetch profile.');
      this.snackBar.open(this.errorMessage ?? 'Please log in to view profile.', 'Close', { duration: 5000 });
      // Optionally, redirect to login if no customerId
      // this.router.navigate(['/login']);
    }
  }

  /**
   * Navigates back to the home page.
   */
  goBack(): void {
    this.router.navigate(['/home']);
  }
}


















// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router'; // Import Router
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading indicator
// import { MatCardModule } from '@angular/material/card'; // For displaying profile in a card
// import { MatButtonModule } from '@angular/material/button'; // For the back button

// import { AuthService } from '../auth.service'; // Import AuthService
// import { CustomerService, CustomerProfile } from '../customer.service'; // Import CustomerService and interface

// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatProgressSpinnerModule, // Add MatProgressSpinnerModule
//     MatCardModule,            // Add MatCardModule
//     MatButtonModule           // Add MatButtonModule
//   ],
//   templateUrl: './profile.component.html', // Link to HTML template
//   styleUrls: ['./profile.component.scss'] // Link to SCSS styles
// })
// export class ProfileComponent implements OnInit {
//   customerProfile: CustomerProfile | null = null; // To hold fetched profile data
//   isLoading: boolean = true; // Loading indicator flag
//   errorMessage: string | null = null; // To display error messages

//   constructor(
//     private router: Router,
//     private authService: AuthService,
//     private customerService: CustomerService
//   ) {}

//   ngOnInit(): void {
//     this.fetchCustomerProfile();
//   }

//   /**
//    * Fetches the customer profile details from the CustomerService.
//    * Uses the customerId from AuthService.
//    */
//   fetchCustomerProfile(): void {
//     this.isLoading = true;
//     this.errorMessage = null;
//     const customerId = this.authService.getCurrentCustomerId();

//     if (customerId) {
//       this.customerService.getCustomerProfile(customerId).subscribe({
//         next: (profile) => {
//           this.customerProfile = profile;
//           this.isLoading = false;
//           console.log('Customer Profile Data:', profile);
//         },
//         error: (err) => {
//           this.errorMessage = err.message || 'An unknown error occurred while fetching profile.';
//           this.isLoading = false;
//           console.error('Error fetching customer profile:', err);
//         }
//       });
//     } else {
//       this.errorMessage = 'No customer ID found. Please log in again.';
//       this.isLoading = false;
//       console.warn('No customer ID available in AuthService to fetch profile.');
//       // Optionally, redirect to login if no customerId
//       // this.router.navigate(['/login']);
//     }
//   }

//   /**
//    * Navigates back to the home page.
//    */
//   goBack(): void {
//     this.router.navigate(['/home']);
//   }
// }













// // src/app/profile/profile.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router'; // Import Router

// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="page-container">
//       <h1>My Profile</h1>
//       <p>This page will display and allow editing of your customer profile details.</p>
//       <p><strong>Customer ID:</strong> [Dynamic Customer ID Here]</p>
//       <p><strong>Name:</strong> [Dynamic Customer Name Here]</p>
//       <p><strong>Email:</strong> [Dynamic Customer Email Here]</p>
//       <p><strong>Contact Number:</strong> [Dynamic Contact Number Here]</p>
//       <button mat-raised-button color="primary" (click)="goBack()">Go Back to Home</button>
//     </div>
//   `,
//   styles: [`
//     .page-container {
//       text-align: center;
//       padding: 50px;
//       background-color: #e0f2f7; /* Consistent background */
//       min-height: 100vh;
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//       align-items: center;
//       font-family: 'Roboto', sans-serif;
//     }
//     h1 { color: #00796b; font-size: 2.5em; margin-bottom: 20px; }
//     p { color: #333; font-size: 1.2em; margin-bottom: 10px; }
//     button { margin-top: 30px; padding: 10px 20px; }
//   `]
// })
// export class ProfileComponent {
//   constructor(private router: Router) {}
//   goBack() {
//     this.router.navigate(['/home']);
//   }
// }












// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-profile',
// //   imports: [],
// //   templateUrl: './profile.component.html',
// //   styleUrl: './profile.component.scss'
// // })
// // export class ProfileComponent {

// // }
