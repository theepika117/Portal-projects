// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import Router for navigation
import { AuthService } from '../auth.service';


// Angular Material Imports for Standalone Components
import { MatToolbarModule } from '@angular/material/toolbar'; // For the top bar
import { MatIconModule } from '@angular/material/icon';     // For icons (menu, dashboard, financial)
import { MatButtonModule } from '@angular/material/button'; // For buttons (menu trigger)
import { MatMenuModule } from '@angular/material/menu';     // For the dropdown menu
import { MatCardModule } from '@angular/material/card';     // For the dashboard and financial cards

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Flags for card hover effects
  dashboardCardHover: boolean = false;
  financialCardHover: boolean = false;

  //constructor(private router: Router) { }
  constructor(
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) { }

  ngOnInit(): void {
    // Initialization logic if any
  }

  /**
   * Navigates to the user's profile page.
   */
  navigateToProfile(): void {
    console.log('Navigating to My Profile page...');
    this.router.navigate(['/profile']);
  }

  /**
   * Logs the user out.
   * In a real application, this would clear authentication tokens/sessions.
   * For now, it navigates back to the login page.
   */
   logout(): void {
    console.log('Logging out...');
    this.authService.logout(); // Clear customerId from localStorage using AuthService

    // Navigate to login page and then force a full page reload
    // This ensures that the entire Angular app re-initializes and re-checks localStorage
    this.router.navigate(['/login']).then(() => {
      window.location.reload(); // Force a full page reload
    });
  }
  // logout(): void {
  //   console.log('Logging out...');
  //   // Implement actual logout logic here (e.g., clear tokens, call backend logout API)
  //   this.router.navigate(['/login']); // Redirect to login page after logout
  // }

  /**
   * Navigates to the Customer Dashboard page.
   */
  navigateToCustomerDashboard(): void {
    console.log('Navigating to Customer Dashboard page...');
    this.router.navigate(['/customer-dashboard']);
  }

  /**
   * Navigates to the Customer Financial Sheet page.
   */
  navigateToFinancialSheets(): void {
    console.log('Navigating to Customer Financial Sheet page...');
    this.router.navigate(['/customer-financial-sheets']);
  }

  /**
   * Shows a quick help message for a card.
   * In a real app, this might open a tooltip, modal, or navigate to a help section.
   * @param featureName The name of the feature for which help is requested.
   */
  showQuickHelp(featureName: string): void {
    alert(`Quick Help for ${featureName}:\n\nThis section provides detailed information about your ${featureName}.`);
  }
}















// // src/app/home/home.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common'; // Often useful for directives like ngIf, ngFor

// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.scss']
// })
// export class HomeComponent {
//   // Add properties or methods for your dashboard functionality here
// }










// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-home',
// //   imports: [],
// //   templateUrl: './home.component.html',
// //   styleUrl: './home.component.scss'
// // })
// // export class HomeComponent {

// // }
