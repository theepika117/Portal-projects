// src/app/credit-debit-memo-page/credit-debit-memo-page.component.ts
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
import { CustomerService, CreditDebitMemoData } from '../customer.service'; // Import CreditDebitMemoData interface
import { CreditDebitMemoDetailDialogComponent } from '../credit-debit-memo-detail-dialog/credit-debit-memo-detail-dialog.component'; // Import dialog component

@Component({
  selector: 'app-credit-debit-memo-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './credit-debit-memo-page.component.html',
  styleUrls: ['./credit-debit-memo-page.component.scss']
})
export class CreditDebitMemoPageComponent implements OnInit {
  memos: CreditDebitMemoData[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private customerService: CustomerService,
    public dialog: MatDialog // Inject MatDialog service
  ) {}

  ngOnInit(): void {
    this.fetchCreditDebitMemos();
  }

  /**
   * Fetches credit/debit memo data for the logged-in customer.
   */
  fetchCreditDebitMemos(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const customerId = this.authService.getCurrentCustomerId();

    if (customerId) {
      this.customerService.getCreditDebitMemos(customerId).subscribe({
        next: (data) => {
          this.memos = data;
          this.isLoading = false;
          console.log('Credit/Debit Memo Data:', data);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load credit/debit memo data.';
          this.isLoading = false;
          console.error('Error fetching credit/debit memo data:', err);
        }
      });
    } else {
      this.errorMessage = 'No customer ID found. Please log in again.';
      this.isLoading = false;
      console.warn('No customer ID available to fetch credit/debit memo data.');
      // this.router.navigate(['/login']); // Optionally redirect to login
    }
  }

  /**
   * Opens a dialog to display full details of a selected memo.
   * @param memo The CreditDebitMemoData object to display.
   */
  viewMemoDetails(memo: CreditDebitMemoData): void {
    this.dialog.open(CreditDebitMemoDetailDialogComponent, {
      width: '650px', // Set a width for the dialog
      data: memo // Pass the selected memo data to the dialog
    });
  }

  /**
   * Navigates back to the customer financial sheet page.
   */
  goBack(): void {
    this.router.navigate(['/customer-financial-sheets']);
  }
}












// // src/app/credit-debit-memo-page/credit-debit-memo-page.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-credit-debit-memo-page',
//   standalone: true,
//   imports: [CommonModule, MatButtonModule, MatToolbarModule, MatIconModule],
//   template: `
//     <div class="page-container">
//       <mat-toolbar class="app-toolbar">
//         <button mat-icon-button (click)="goBack()" aria-label="Back to Financial Sheet">
//           <mat-icon>arrow_back</mat-icon>
//         </button>
//         <span>Credit/Debit Memo</span>
//       </mat-toolbar>
//       <div class="content-area">
//         <h1>Credit/Debit Memo Details</h1>
//         <p>This page displays transactions that adjust amounts payable or receivable.</p>
//         <p>A debit memo is a transaction that reduces Amounts Payable to a vendor.</p>
//         <!-- Add table or list of memos here -->
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
// export class CreditDebitMemoPageComponent {
//   constructor(private router: Router) {}
//   goBack() {
//     this.router.navigate(['/customer-financial-sheets']);
//   }
// }













// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-credit-debit-memo-page',
// //   imports: [],
// //   templateUrl: './credit-debit-memo-page.component.html',
// //   styleUrl: './credit-debit-memo-page.component.scss'
// // })
// // export class CreditDebitMemoPageComponent {

// // }
