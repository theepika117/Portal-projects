import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}
  
  isLoading = true;
  errorMessage = '';
  
  // Vendor profile data structure matching SAP response
  vendorProfile: any = null;

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('[Profile] User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Fetch profile data using logged-in vendor ID
    this.fetchProfileData();
  }

  fetchProfileData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get the logged-in vendor ID
    const vendorId = this.authService.getLoggedInVendorId();
    
    if (!vendorId) {
      console.error('[Profile] No vendor ID found in session');
      this.errorMessage = 'Session expired. Please login again.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log(`[Profile] Fetching profile data for vendor ID: ${vendorId}`);

    // Call backend API to get profile data
    this.http.get<any>(`http://localhost:3000/api/profile/${vendorId}`).subscribe({
      next: (response) => {
        console.log('[Profile] Profile data received:', response);
        
        if (response.success && response.profile) {
          // Map the response to the expected structure for the UI
          this.vendorProfile = {
            VENDOR_ID: response.profile.vendorId,
            NAME: response.profile.name,
            ADDRESS: response.profile.address,
            STREET: response.profile.street,
            CITY: response.profile.city,
            POSTAL_CODE: response.profile.postalCode,
            COMPANY_CODE: response.profile.companyCode,
            RECONCILIATION_ACCOUNT: response.profile.reconciliationAccount,
            PURCHASING_ORG: response.profile.purchasingOrg,
            PURCHASE_ORDER_CURRENCY: response.profile.purchaseOrderCurrency || 'INR'
          };
          
          console.log('[Profile] Profile data mapped successfully:', this.vendorProfile);
        } else {
          this.errorMessage = 'Failed to load profile data.';
          console.error('[Profile] Invalid response structure:', response);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Profile] Failed to fetch profile data:', error);
        
        if (error.status === 404) {
          this.errorMessage = 'Profile not found for the current vendor.';
        } else if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Unable to load profile data. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  refreshProfile() {
    console.log('[Profile] Refreshing profile data...');
    this.fetchProfileData();
  }
}
