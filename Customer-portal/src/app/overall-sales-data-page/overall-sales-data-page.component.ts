// src/app/overall-sales-data-page/overall-sales-data-page.component.ts
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
import { CustomerService, OverallSalesData } from '../customer.service'; // Import OverallSalesData interface
import { OverallSalesDataDetailDialogComponent } from '../overall-sales-data-detail-dialog/overall-sales-data-detail-dialog.component'; // Import dialog component

@Component({
  selector: 'app-overall-sales-data-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './overall-sales-data-page.component.html',
  styleUrls: ['./overall-sales-data-page.component.scss']
})
export class OverallSalesDataPageComponent implements OnInit {
  overallSalesData: OverallSalesData[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private customerService: CustomerService,
    public dialog: MatDialog // Inject MatDialog service
  ) {}

  ngOnInit(): void {
    this.fetchOverallSalesData();
  }

  /**
   * Fetches overall sales data for the logged-in customer.
   */
  fetchOverallSalesData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const customerId = this.authService.getCurrentCustomerId();

    if (customerId) {
      this.customerService.getOverallSalesData(customerId).subscribe({
        next: (data) => {
          this.overallSalesData = data;
          this.isLoading = false;
          console.log('Overall Sales Data:', data);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load overall sales data.';
          this.isLoading = false;
          console.error('Error fetching overall sales data:', err);
        }
      });
    } else {
      this.errorMessage = 'No customer ID found. Please log in again.';
      this.isLoading = false;
      console.warn('No customer ID available to fetch overall sales data.');
      // this.router.navigate(['/login']); // Optionally redirect to login
    }
  }

  /**
   * Opens a dialog to display full details of a selected sales record.
   * @param salesRecord The OverallSalesData object to display.
   */
  viewSalesDetails(salesRecord: OverallSalesData): void {
    this.dialog.open(OverallSalesDataDetailDialogComponent, {
      width: '650px', // Set a width for the dialog
      data: salesRecord // Pass the selected sales record data to the dialog
    });
  }

  /**
   * Navigates back to the customer financial sheet page.
   */
  goBack(): void {
    this.router.navigate(['/customer-financial-sheets']);
  }
}











// // src/app/overall-sales-data-page/overall-sales-data-page.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-overall-sales-data-page',
//   standalone: true,
//   imports: [CommonModule, MatButtonModule, MatToolbarModule, MatIconModule],
//   template: `
//     <div class="page-container">
//       <mat-toolbar class="app-toolbar">
//         <button mat-icon-button (click)="goBack()" aria-label="Back to Financial Sheet">
//           <mat-icon>arrow_back</mat-icon>
//         </button>
//         <span>Overall Sales Data</span>
//       </mat-toolbar>
//       <div class="content-area">
//         <h1>Overall Sales Data</h1>
//         <p>This page provides a comprehensive overview of your sales transactions with the company.</p>
//         <p>View summarized sales figures, trends, and key performance indicators.</p>
//         <!-- Add charts, summary tables, or KPIs here -->
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
// export class OverallSalesDataPageComponent {
//   constructor(private router: Router) {}
//   goBack() {
//     this.router.navigate(['/customer-financial-sheets']);
//   }
// }











// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-overall-sales-data-page',
// //   imports: [],
// //   templateUrl: './overall-sales-data-page.component.html',
// //   styleUrl: './overall-sales-data-page.component.scss'
// // })
// // export class OverallSalesDataPageComponent {

// // }
