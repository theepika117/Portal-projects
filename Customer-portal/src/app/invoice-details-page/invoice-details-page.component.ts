// src/app/invoice-details-page/invoice-details-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog'; // For opening dialogs
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // For showing messages

import { AuthService } from '../auth.service';
import { CustomerService, InvoiceData } from '../customer.service'; // Import InvoiceData interface
import { InvoiceDetailDialogComponent } from '../invoice-detail-dialog/invoice-detail-dialog.component'; // Import dialog component

@Component({
  selector: 'app-invoice-details-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule // Add MatSnackBarModule here
  ],
  templateUrl: './invoice-details-page.component.html',
  styleUrls: ['./invoice-details-page.component.scss']
})
export class InvoiceDetailsPageComponent implements OnInit {
  invoices: InvoiceData[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private customerService: CustomerService,
    public dialog: MatDialog, // Inject MatDialog service
    private snackBar: MatSnackBar // Inject MatSnackBar service
  ) {}

  ngOnInit(): void {
    this.fetchInvoiceData();
  }

  /**
   * Fetches invoice data for the logged-in customer.
   */
  fetchInvoiceData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const customerId = this.authService.getCurrentCustomerId();

    if (customerId) {
      this.customerService.getInvoiceData(customerId).subscribe({
        next: (data) => {
          this.invoices = data;
          this.isLoading = false;
          console.log('Invoice Data:', data);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load invoice data.';
          this.isLoading = false;
          console.error('Error fetching invoice data:', err);
          // Fixed: Ensure errorMessage is a string
          this.snackBar.open(this.errorMessage ?? 'Failed to load invoice data.', 'Close', { duration: 5000 });
        }
      });
    } else {
      this.errorMessage = 'No customer ID found. Please log in again.';
      this.isLoading = false;
      console.warn('No customer ID available to fetch invoice data.');
      // Fixed: Ensure errorMessage is a string
      this.snackBar.open(this.errorMessage ?? 'Failed to load invoice data. Please log in.', 'Close', { duration: 5000 });
      // this.router.navigate(['/login']); // Optionally redirect to login
    }
  }

  /**
   * Opens a dialog to display full details of a selected invoice.
   * @param invoice The InvoiceData object to display.
   */
  viewInvoiceDetails(invoice: InvoiceData): void {
    this.dialog.open(InvoiceDetailDialogComponent, {
      width: '650px', // Set a width for the dialog
      data: invoice // Pass the selected invoice data to the dialog
    });
  }

  /**
   * Initiates the download of a specific invoice.
   * @param invoice The InvoiceData object for the invoice to download.
   */
  downloadInvoice(invoice: InvoiceData): void {
    this.snackBar.open(`Initiating download for Invoice ${invoice.DOC_NUM}...`, 'Dismiss', { duration: 3000 });
    this.customerService.downloadInvoice(invoice.DOC_NUM).subscribe({
      next: (blob) => {
        // Create a URL for the blob and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${invoice.DOC_NUM}.pdf`; // Suggest a filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); // Clean up the URL object
        this.snackBar.open(`Invoice ${invoice.DOC_NUM} downloaded successfully!`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        const msg = err.message || `Failed to download invoice ${invoice.DOC_NUM}.`;
        console.error('Download error:', err);
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }

  /**
   * Navigates back to the customer financial sheet page.
   */
  goBack(): void {
    this.router.navigate(['/customer-financial-sheets']);
  }
}


















// // src/app/invoice-details-page/invoice-details-page.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-invoice-details-page',
//   standalone: true,
//   imports: [CommonModule, MatButtonModule, MatToolbarModule, MatIconModule],
//   template: `
//     <div class="page-container">
//       <mat-toolbar class="app-toolbar">
//         <button mat-icon-button (click)="goBack()" aria-label="Back to Financial Sheet">
//           <mat-icon>arrow_back</mat-icon>
//         </button>
//         <span>Invoice Details</span>
//       </mat-toolbar>
//       <div class="content-area">
//         <h1>Invoice Details</h1>
//         <p>This page will display all your invoices and their payment status.</p>
//         <p>An invoice is a document which holds the amount to be paid back to the vendor.</p>
//         <!-- Add table or list of invoices here -->
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
// export class InvoiceDetailsPageComponent {
//   constructor(private router: Router) {}
//   goBack() {
//     this.router.navigate(['/customer-financial-sheets']);
//   }
// }















// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-invoice-details-page',
// //   imports: [],
// //   templateUrl: './invoice-details-page.component.html',
// //   styleUrl: './invoice-details-page.component.scss'
// // })
// // export class InvoiceDetailsPageComponent {

// // }
