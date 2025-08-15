/// src/app/list-of-delivery/list-of-delivery.component.ts
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
import { CustomerService, DeliveryData } from '../customer.service'; // Import DeliveryData interface
import { DeliveryDetailDialogComponent } from '../delivery-detail-dialog/delivery-detail-dialog.component'; // Import dialog component

@Component({
  selector: 'app-list-of-delivery',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './list-of-delivery.component.html',
  styleUrls: ['./list-of-delivery.component.scss']
})
export class ListOfDeliveryComponent implements OnInit {
  deliveries: DeliveryData[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private customerService: CustomerService,
    public dialog: MatDialog // Inject MatDialog service
  ) {}

  ngOnInit(): void {
  

    this.fetchDeliveryData();
  }

  /**
   * Fetches delivery data for the logged-in customer.
   */
  fetchDeliveryData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    console.log('Retrieved customerId:', this.authService.getCurrentCustomerId());
    const customerId = this.authService.getCurrentCustomerId();

    if (customerId) {
      this.customerService.getCustomerDeliveries(customerId).subscribe({
        next: (data) => {
          this.deliveries = data;
          this.isLoading = false;
          console.log('Delivery Data:', data);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load delivery data.';
          this.isLoading = false;
          console.error('Error fetching delivery data:', err);
        }
      });
    } else {
      this.errorMessage = 'No customer ID found. Please log in again.';
      this.isLoading = false;
      console.warn('No customer ID available to fetch delivery data.');
      // this.router.navigate(['/login']); // Optionally redirect to login
    }
  }

  /**
   * Opens a dialog to display full details of a selected delivery.
   * @param delivery The DeliveryData object to display.
   */
  viewDeliveryDetails(delivery: DeliveryData): void {
    this.dialog.open(DeliveryDetailDialogComponent, {
      width: '650px', // Set a width for the dialog
      data: delivery // Pass the selected delivery data to the dialog
    });
  }

  /**
   * Navigates back to the customer dashboard page.
   */
  goBack(): void {
    this.router.navigate(['/customer-dashboard']);
  }
}










// // // src/app/list-of-delivery/list-of-delivery.component.ts
// // import { Component } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { Router } from '@angular/router';
// // import { MatButtonModule } from '@angular/material/button';
// // import { MatToolbarModule } from '@angular/material/toolbar';
// // import { MatIconModule } from '@angular/material/icon';

// // @Component({
// //   selector: 'app-list-of-delivery',
// //   standalone: true,
// //   imports: [CommonModule, MatButtonModule, MatToolbarModule, MatIconModule],
// //   template: `
// //     <div class="page-container">
// //       <mat-toolbar class="app-toolbar">
// //         <button mat-icon-button (click)="goBack()" aria-label="Back to Dashboard">
// //           <mat-icon>arrow_back</mat-icon>
// //         </button>
// //         <span>List of Delivery</span>
// //       </mat-toolbar>
// //       <div class="content-area">
// //         <h1>Delivery List Details</h1>
// //         <p>This page will display all your delivery documents and their status.</p>
// //         <p>Monitor your shipments and view complete delivery transactions.</p>
// //         <!-- Add table or list of deliveries here -->
// //       </div>
// //     </div>
// //   `,
// //   styles: [`
// //     .page-container {
// //       display: flex;
// //       flex-direction: column;
// //       min-height: 100vh;
// //       background-color: #e0f2f7; /* Consistent background */
// //       font-family: 'Roboto', sans-serif;
// //     }
// //     .app-toolbar {
// //       background-color: #00796b;
// //       color: white;
// //       padding: 0 20px;
// //       box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
// //     }
// //     .content-area {
// //       flex-grow: 1;
// //       display: flex;
// //       flex-direction: column;
// //       justify-content: center;
// //       align-items: center;
// //       padding: 30px;
// //       text-align: center;
// //     }
// //     h1 { color: #00796b; font-size: 2.5em; margin-bottom: 20px; }
// //     p { color: #333; font-size: 1.2em; margin-bottom: 10px; }
// //   `]
// // })
// // export class ListOfDeliveryComponent {
// //   constructor(private router: Router) {}
// //   goBack() {
// //     this.router.navigate(['/customer-dashboard']);
// //   }
// // }






// // // import { Component } from '@angular/core';

// // // @Component({
// // //   selector: 'app-list-of-delivery',
// // //   imports: [],
// // //   templateUrl: './list-of-delivery.component.html',
// // //   styleUrl: './list-of-delivery.component.scss'
// // // })
// // // export class ListOfDeliveryComponent {

// // // }



