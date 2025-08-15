// src/app/customer-financial-sheet/customer-financial-sheet.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, ngClass
import { Router } from '@angular/router'; // For navigation

// Angular Material Imports for Standalone Components
import { MatCardModule } from '@angular/material/card';     // For the feature cards
import { MatIconModule } from '@angular/material/icon';     // For icons on cards
import { MatButtonModule } from '@angular/material/button'; // For any potential buttons (e.g., help)
import { MatToolbarModule } from '@angular/material/toolbar'; // For the top bar (optional, but good for consistency)

@Component({
  selector: 'app-customer-financial-sheet',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule // Include if you want a toolbar on this page as well
  ],
  templateUrl: './customer-financial-sheet.component.html',
  styleUrls: ['./customer-financial-sheet.component.scss']
})
export class CustomerFinancialSheetComponent implements OnInit {
  // Flags for card hover effects
  invoiceCardHover: boolean = false;
  paymentsCardHover: boolean = false;
  creditDebitCardHover: boolean = false;
  overallSalesCardHover: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Initialization logic if any
  }

  /**
   * Navigates back to the home page.
   */
  goBackToHome(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Navigates to the Invoice Details page.
   */
  navigateToInvoiceDetails(): void {
    console.log('Navigating to Invoice Details page...');
    this.router.navigate(['/invoice-details']);
  }

  /**
   * Navigates to the Payments and Aging page.
   */
  navigateToPaymentsAging(): void {
    console.log('Navigating to Payments and Aging page...');
    this.router.navigate(['/payments-aging']);
  }

  /**
   * Navigates to the Credit/Debit Memo page.
   */
  navigateToCreditDebitMemo(): void {
    console.log('Navigating to Credit/Debit Memo page...');
    this.router.navigate(['/credit-debit-memo']);
  }

  /**
   * Navigates to the Overall Sales Data page.
   */
  navigateToOverallSalesData(): void {
    console.log('Navigating to Overall Sales Data page...');
    this.router.navigate(['/overall-sales-data']);
  }

  /**
   * Shows a quick help message for a card.
   * @param featureName The name of the feature for which help is requested.
   */
  showQuickHelp(featureName: string): void {
    alert(`Quick Help for ${featureName}:\n\nThis section provides detailed information about your ${featureName}.`);
  }
}











// // src/app/customer-financial-sheet/customer-financial-sheet.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-customer-financial-sheet',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="page-container">
//       <h1>Customer Financial Sheets</h1>
//       <p>This page will display your complete financial transactions with the company.</p>
//       <p>Here you'll find details like:</p>
//       <ul>
//         <li>Invoices (Paid & Unpaid)</li>
//         <li>Payment History</li>
//         <li>Credit Memos</li>
//         <li>Account Statements</li>
//       </ul>
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
//     ul { list-style: none; padding: 0; margin-bottom: 20px; }
//     li { color: #555; font-size: 1em; margin-bottom: 5px; }
//     button { margin-top: 30px; padding: 10px 20px; }
//   `]
// })
// export class CustomerFinancialSheetComponent {
//   constructor(private router: Router) {}
//   goBack() {
//     this.router.navigate(['/home']);
//   }
// }













// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-customer-financial-sheet',
// //   imports: [],
// //   templateUrl: './customer-financial-sheet.component.html',
// //   styleUrl: './customer-financial-sheet.component.scss'
// // })
// // export class CustomerFinancialSheetComponent {

// // }
