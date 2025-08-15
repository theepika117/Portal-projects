// src/app/inquiry-data/inquiry-data.component.ts
import { Component, OnInit } from '@angular/core';
import { CustomerService, InquiryData } from '../customer.service';
import { AuthService } from '../auth.service'; // Assuming you have an AuthService to get customer ID
// Import MatProgressSpinnerModule, MatCardModule, MatButtonModule, MatIconModule in app.module.ts
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';


@Component({
  selector: 'app-inquiry-data',
  standalone: true,
  imports: [
     CommonModule,
     MatButtonModule,
     MatToolbarModule,
     MatIconModule,
     MatProgressSpinnerModule,
     MatCardModule,
     MatSnackBarModule
   ],
  templateUrl: './inquiry-data.component.html',
  styleUrls: ['./inquiry-data.component.scss'] // Ensure this points to .scss
})
export class InquiryDataComponent implements OnInit {
  inquiries: InquiryData[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Properties for modal
  showModal: boolean = false;
  selectedInquiry: InquiryData | null = null;

  constructor(private customerService: CustomerService, private authService: AuthService) { }

  ngOnInit(): void {
    this.fetchInquiryData();
  }

  fetchInquiryData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const customerId = this.authService.getCurrentCustomerId(); // Get customer ID from AuthService

    if (customerId) {
      this.customerService.getCustomerInquiries(customerId).subscribe({
        next: (data) => {
          this.inquiries = data;
          this.isLoading = false;
          console.log('Inquiry data loaded:', this.inquiries);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load inquiry data.';
          this.isLoading = false;
          console.error('Error loading inquiry data:', err);
        }
      });
    } else {
      this.errorMessage = 'Customer ID not found. Please log in.';
      this.isLoading = false;
    }
  }

  // Function to open the modal and set the selected inquiry
  openInquiryDetailsModal(inquiry: InquiryData): void {
    this.selectedInquiry = inquiry;
    this.showModal = true;
  }

  // Function to close the modal
  closeInquiryDetailsModal(): void {
    this.showModal = false;
    this.selectedInquiry = null; // Clear selected inquiry when modal closes
  }
}














// // src/app/inquiry-data/inquiry-data.component.ts
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// // Angular Material Imports
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatCardModule } from '@angular/material/card';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// import { AuthService } from '../auth.service';
// import { CustomerService, InquiryData } from '../customer.service'; // Import InquiryData interface

// @Component({
//   selector: 'app-inquiry-data',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatButtonModule,
//     MatToolbarModule,
//     MatIconModule,
//     MatProgressSpinnerModule,
//     MatCardModule,
//     MatSnackBarModule
//   ],
//   templateUrl: './inquiry-data.component.html',
//   styleUrls: ['./inquiry-data.component.scss']
// })
// export class InquiryDataComponent implements OnInit {
//   inquiries: InquiryData[] = [];
//   isLoading: boolean = true;
//   errorMessage: string | null = null;

//   constructor(
//     private router: Router,
//     private authService: AuthService,
//     private customerService: CustomerService,
//     private snackBar: MatSnackBar
//   ) {}

//   ngOnInit(): void {
//     this.fetchInquiryData();
//   }

//   /**
//    * Fetches inquiry data for the logged-in customer.
//    */
//   fetchInquiryData(): void {
//     this.isLoading = true;
//     this.errorMessage = null;
//     const customerId = this.authService.getCurrentCustomerId();

//     if (customerId) {
//       this.customerService.getCustomerInquiries(customerId).subscribe({
//         next: (data) => {
//           this.inquiries = data;
//           this.isLoading = false;
//           console.log('Inquiry Data:', data);
//         },
//         error: (err) => {
//           this.errorMessage = err.message || 'Failed to load inquiry data.';
//           this.isLoading = false;
//           console.error('Error fetching inquiry data:', err);
//           this.snackBar.open(this.errorMessage ?? 'Failed to load inquiry data.', 'Close', { duration: 5000 });
//         }
//       });
//     } else {
//       this.errorMessage = 'No customer ID found. Please log in again.';
//       this.isLoading = false;
//       console.warn('No customer ID available to fetch inquiry data.');
//       this.snackBar.open(this.errorMessage ?? 'Please log in to view inquiry data.', 'Close', { duration: 5000 });
//       // this.router.navigate(['/login']); // Optionally redirect to login
//     }
//   }

//   /**
//    * Navigates back to the customer financial sheet page.
//    */
//   goBack(): void {
//     this.router.navigate(['/customer-financial-sheets']); // Or '/home' if that's the desired back destination
//   }
// }












// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// // Angular Material Imports
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading
// import { MatCardModule } from '@angular/material/card'; // For inquiry cards
// import { MatDialog } from '@angular/material/dialog'; // For opening dialogs

// import { AuthService } from '../auth.service';
// import { CustomerService, InquiryData } from '../customer.service'; // Import InquiryData interface
// import { InquiryDetailDialogComponent } from '../inquiry-detail-dialog/inquiry-detail-dialog.component'; // Import dialog component

// @Component({
//   selector: 'app-inquiry-data',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatButtonModule,
//     MatToolbarModule,
//     MatIconModule,
//     MatProgressSpinnerModule,
//     MatCardModule
//   ],
//   templateUrl: './inquiry-data.component.html', // Link to HTML template
//   styleUrls: ['./inquiry-data.component.scss'] // Link to SCSS styles
// })
// export class InquiryDataComponent implements OnInit {
//   inquiries: InquiryData[] = []; // Array to hold inquiry data
//   isLoading: boolean = true;
//   errorMessage: string | null = null;

//   constructor(
//     private router: Router,
//     private authService: AuthService,
//     private customerService: CustomerService,
//     public dialog: MatDialog // Inject MatDialog service
//   ) {}

//   ngOnInit(): void {
//     this.fetchInquiryData();
//   }

//   /**
//    * Fetches inquiry data for the logged-in customer.
//    */
//   fetchInquiryData(): void {
//     this.isLoading = true;
//     this.errorMessage = null;
//     const customerId = this.authService.getCurrentCustomerId();

//     if (customerId) {
//       this.customerService.getCustomerInquiries(customerId).subscribe({
//         next: (data) => {
//           this.inquiries = data;
//           this.isLoading = false;
//           console.log('Inquiry Data:', data);
//         },
//         error: (err) => {
//           this.errorMessage = err.message || 'Failed to load inquiry data.';
//           this.isLoading = false;
//           console.error('Error fetching inquiry data:', err);
//         }
//       });
//     } else {
//       this.errorMessage = 'No customer ID found. Please log in again.';
//       this.isLoading = false;
//       console.warn('No customer ID available to fetch inquiry data.');
//       // this.router.navigate(['/login']); // Optionally redirect to login
//     }
//   }

//   /**
//    * Opens a dialog to display full details of a selected inquiry.
//    * @param inquiry The InquiryData object to display.
//    */
//   viewInquiryDetails(inquiry: InquiryData): void {
//     this.dialog.open(InquiryDetailDialogComponent, {
//       width: '650px', // Set a width for the dialog
//       data: inquiry // Pass the selected inquiry data to the dialog
//     });
//   }

//   /**
//    * Navigates back to the customer dashboard page.
//    */
//   goBack(): void {
//     this.router.navigate(['/customer-dashboard']);
//   }
// }
















// // src/app/inquiry-data/inquiry-data.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-inquiry-data',
//   standalone: true,
//   imports: [CommonModule, MatButtonModule, MatToolbarModule, MatIconModule],
//   template: `
//     <div class="page-container">
//       <mat-toolbar class="app-toolbar">
//         <button mat-icon-button (click)="goBack()" aria-label="Back to Dashboard">
//           <mat-icon>arrow_back</mat-icon>
//         </button>
//         <span>Inquiry Data</span>
//       </mat-toolbar>
//       <div class="content-area">
//         <h1>Inquiry Data Details</h1>
//         <p>This page will display all your inquiries with the company.</p>
//         <p>Here you can see the status of your requests for quotations or information.</p>
//         <!-- Add table or list of inquiries here -->
//       </div>
//     </div>
//   `,
//   styles: [`
//     .page-container {
//       display: flex;
//       flex-direction: column;
//       min-height: 100vh;
//       background-color: #e0f2f7; /* Consistent background */
//       font-family: 'Roboto', sans-serif;
//     }
//     .app-toolbar {
//       background-color: #00796b;
//       color: white;
//       padding: 0 20px;
//       box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//     }
//     .content-area {
//       flex-grow: 1;
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//       align-items: center;
//       padding: 30px;
//       text-align: center;
//     }
//     h1 { color: #00796b; font-size: 2.5em; margin-bottom: 20px; }
//     p { color: #333; font-size: 1.2em; margin-bottom: 10px; }
//   `]
// })
// export class InquiryDataComponent {
//   constructor(private router: Router) {}
//   goBack() {
//     this.router.navigate(['/customer-dashboard']);
//   }
// }













// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-inquiry-data',
// //   imports: [],
// //   templateUrl: './inquiry-data.component.html',
// //   styleUrl: './inquiry-data.component.scss'
// // })
// // export class InquiryDataComponent {

// // }
