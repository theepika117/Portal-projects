// src/app/payments-aging-page/payments-aging-page.component.ts
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

import { AuthService } from '../auth.service';
import { CustomerService, AgingData } from '../customer.service'; // Import AgingData interface
import { PaymentsAgingDetailDialogComponent } from '../payments-aging-detail-dialog/payments-aging-detail-dialog.component'; // Import dialog component

@Component({
  selector: 'app-payments-aging-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './payments-aging-page.component.html',
  styleUrls: ['./payments-aging-page.component.scss']
})
export class PaymentsAgingPageComponent implements OnInit {
  agingData: AgingData[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private customerService: CustomerService,
    public dialog: MatDialog // Inject MatDialog service
  ) {}

  ngOnInit(): void {
    this.fetchAgingData();
  }

  /**
   * Fetches aging data for the logged-in customer.
   */
  fetchAgingData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const customerId = this.authService.getCurrentCustomerId();

    if (customerId) {
      this.customerService.getAgingData(customerId).subscribe({
        next: (data) => {
          this.agingData = data;
          this.isLoading = false;
          console.log('Aging Data:', data);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load aging data.';
          this.isLoading = false;
          console.error('Error fetching aging data:', err);
        }
      });
    } else {
      this.errorMessage = 'No customer ID found. Please log in again.';
      this.isLoading = false;
      console.warn('No customer ID available to fetch aging data.');
      // this.router.navigate(['/login']); // Optionally redirect to login
    }
  }

  /**
   * Opens a dialog to display full details of a selected aging record.
   * @param record The AgingData object to display.
   */
  viewAgingDetails(record: AgingData): void {
    this.dialog.open(PaymentsAgingDetailDialogComponent, {
      width: '650px', // Set a width for the dialog
      data: record // Pass the selected aging data to the dialog
    });
  }

  /**
   * Navigates back to the customer financial sheet page.
   */
  goBack(): void {
    this.router.navigate(['/customer-financial-sheets']);
  }
}













// // src/app/payments-aging-page/payments-aging-page.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-payments-aging-page',
//   standalone: true,
//   imports: [CommonModule, MatButtonModule, MatToolbarModule, MatIconModule],
//   template: `
//     <div class="page-container">
//       <mat-toolbar class="app-toolbar">
//         <button mat-icon-button (click)="goBack()" aria-label="Back to Financial Sheet">
//           <mat-icon>arrow_back</mat-icon>
//         </button>
//         <span>Payments & Aging</span>
//       </mat-toolbar>
//       <div class="content-area">
//         <h1>Payments and Aging Report</h1>
//         <p>This page displays your balances, sorted by date interval or by aging period definition.</p>
//         <p>Review your payment history and outstanding amounts.</p>
//         <!-- Add table or charts for payments and aging here -->
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
// export class PaymentsAgingPageComponent {
//   constructor(private router: Router) {}
//   goBack() {
//     this.router.navigate(['/customer-financial-sheets']);
//   }
// }












// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-payments-aging-page',
// //   imports: [],
// //   templateUrl: './payments-aging-page.component.html',
// //   styleUrl: './payments-aging-page.component.scss'
// // })
// // export class PaymentsAgingPageComponent {

// // }
