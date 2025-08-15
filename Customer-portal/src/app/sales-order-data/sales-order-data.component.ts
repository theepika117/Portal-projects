// src/app/sales-order-data/sales-order-data.component.ts
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
import { CustomerService, SalesOrderData } from '../customer.service'; // Import SalesOrderData interface
import { SalesOrderDetailDialogComponent } from '../sales-order-detail-dialog/sales-order-detail-dialog.component'; // Import dialog component

@Component({
  selector: 'app-sales-order-data',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './sales-order-data.component.html',
  styleUrls: ['./sales-order-data.component.scss']
})
export class SalesOrderDataComponent implements OnInit {
  salesOrders: SalesOrderData[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private customerService: CustomerService,
    public dialog: MatDialog // Inject MatDialog service
  ) {}

  ngOnInit(): void {
    this.fetchSalesOrderData();
  }

  /**
   * Fetches sales order data for the logged-in customer.
   */
  fetchSalesOrderData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const customerId = this.authService.getCurrentCustomerId();

    if (customerId) {
      this.customerService.getCustomerSalesOrders(customerId).subscribe({
        next: (data) => {
          this.salesOrders = data;
          this.isLoading = false;
          console.log('Sales Order Data:', data);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load sales order data.';
          this.isLoading = false;
          console.error('Error fetching sales order data:', err);
        }
      });
    } else {
      this.errorMessage = 'No customer ID found. Please log in again.';
      this.isLoading = false;
      console.warn('No customer ID available to fetch sales order data.');
      // this.router.navigate(['/login']); // Optionally redirect to login
    }
  }

  /**
   * Opens a dialog to display full details of a selected sales order.
   * @param salesOrder The SalesOrderData object to display.
   */
  viewSalesOrderDetails(salesOrder: SalesOrderData): void {
    this.dialog.open(SalesOrderDetailDialogComponent, {
      width: '650px', // Set a width for the dialog
      data: salesOrder // Pass the selected sales order data to the dialog
    });
  }

  /**
   * Navigates back to the customer dashboard page.
   */
  goBack(): void {
    this.router.navigate(['/customer-dashboard']);
  }
}












// // src/app/sales-order-data/sales-order-data.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-sales-order-data',
//   standalone: true,
//   imports: [CommonModule, MatButtonModule, MatToolbarModule, MatIconModule],
//   template: `
//     <div class="page-container">
//       <mat-toolbar class="app-toolbar">
//         <button mat-icon-button (click)="goBack()" aria-label="Back to Dashboard">
//           <mat-icon>arrow_back</mat-icon>
//         </button>
//         <span>Sales Order Data</span>
//       </mat-toolbar>
//       <div class="content-area">
//         <h1>Sales Order Data Details</h1>
//         <p>This page will display all your sales orders with the company.</p>
//         <p>Track the status of your orders from creation to delivery.</p>
//         <!-- Add table or list of sales orders here -->
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
// export class SalesOrderDataComponent {
//   constructor(private router: Router) {}
//   goBack() {
//     this.router.navigate(['/customer-dashboard']);
//   }
// }















// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-sales-order-data',
// //   imports: [],
// //   templateUrl: './sales-order-data.component.html',
// //   styleUrl: './sales-order-data.component.scss'
// // })
// // export class SalesOrderDataComponent {

// // }
