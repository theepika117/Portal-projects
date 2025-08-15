// src/app/customer-dashboard/customer-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, ngClass
import { Router } from '@angular/router'; // For navigation

// Angular Material Imports for Standalone Components
import { MatCardModule } from '@angular/material/card';     // For the feature cards
import { MatIconModule } from '@angular/material/icon';     // For icons on cards
import { MatButtonModule } from '@angular/material/button'; // For any potential buttons (e.g., help)
import { MatToolbarModule } from '@angular/material/toolbar'; // For the top bar (optional, but good for consistency)

@Component({
  selector: 'app-customer-dashboard',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule // Include if you want a toolbar on this page as well
  ],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit {
  // Flags for card hover effects
  inquiryCardHover: boolean = false;
  salesOrderCardHover: boolean = false;
  deliveryCardHover: boolean = false;

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
   * Navigates to the Inquiry Data page.
   */
  navigateToInquiryData(): void {
    console.log('Navigating to Inquiry Data page...');
    this.router.navigate(['/inquiry-data']);
  }

  /**
   * Navigates to the Sales Order Data page.
   */
  navigateToSalesOrderData(): void {
    console.log('Navigating to Sales Order Data page...');
    this.router.navigate(['/sales-order-data']);
  }

  /**
   * Navigates to the List of Delivery page.
   */
  navigateToDeliveryList(): void {
    console.log('Navigating to List of Delivery page...');
    this.router.navigate(['/list-of-delivery']);
  }

  /**
   * Shows a quick help message for a card.
   * @param featureName The name of the feature for which help is requested.
   */
  showQuickHelp(featureName: string): void {
    alert(`Quick Help for ${featureName}:\n\nThis section provides detailed information about your ${featureName}.`);
  }
}









// // src/app/customer-dashboard/customer-dashboard.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-customer-dashboard',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="page-container">
//       <h1>Customer Dashboard</h1>
//       <p>This page will display the end-to-end transactions between you and the company.</p>
//       <p>Here you'll find details like:</p>
//       <ul>
//         <li>Order History</li>
//         <li>Delivery Status</li>
//         <li>Open Orders</li>
//         <li>Recent Interactions</li>
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
// export class CustomerDashboardComponent {
//   constructor(private router: Router) {}
//   goBack() {
//     this.router.navigate(['/home']);
//   }
// }







// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-customer-dashboard',
// //   imports: [],
// //   templateUrl: './customer-dashboard.component.html',
// //   styleUrl: './customer-dashboard.component.scss'
// // })
// // export class CustomerDashboardComponent {

// // }
