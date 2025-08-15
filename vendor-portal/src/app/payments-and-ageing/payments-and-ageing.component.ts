import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

interface PaymentAgeingData {
  DOC_NUM: string;
  DOC_DATE: string;
  DATS: string;
  AMOUNT: string;
  AGING: number;
}

@Component({
  selector: 'app-payments-and-ageing',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './payments-and-ageing.component.html',
  styleUrl: './payments-and-ageing.component.scss'
})
export class PaymentsAndAgeingComponent implements OnInit {
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}
  
  isLoading = true;
  errorMessage = '';
  
  // Payments and Ageing data from SAP
  paymentAgeingData: PaymentAgeingData[] = [];

  selectedPayment: PaymentAgeingData | null = null;
  showPopup = false;

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('[Payments] User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Fetch Payments and Ageing data using logged-in vendor ID
    this.fetchPaymentsData();
  }

  fetchPaymentsData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get the logged-in vendor ID
    const vendorId = this.authService.getLoggedInVendorId();
    
    if (!vendorId) {
      console.error('[Payments] No vendor ID found in session');
      this.errorMessage = 'Session expired. Please login again.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log(`[Payments] Fetching payments and ageing data for vendor ID: ${vendorId}`);

    // Call backend API to get payments and ageing data
    this.http.get<any>(`http://localhost:3000/api/payments-ageing/${vendorId}`).subscribe({
      next: (response) => {
        console.log('[Payments] Payments and ageing data received:', response);
        
        if (response.success) {
          // Map the response to the expected structure for the UI
          this.paymentAgeingData = response.paymentsAgeing.map((item: any) => ({
            DOC_NUM: item.docNum,
            DOC_DATE: this.formatDate(item.docDate),
            DATS: this.formatDate(item.dats),
            AMOUNT: this.formatAmount(item.amount),
            AGING: item.aging
          }));
          
          console.log(`[Payments] Mapped ${this.paymentAgeingData.length} payment(s) and ageing record(s) successfully`);
        } else {
          this.errorMessage = 'Failed to load payments and ageing data.';
          console.error('[Payments] Invalid response structure:', response);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Payments] Failed to fetch payments and ageing data:', error);
        
        if (error.status === 404) {
          this.errorMessage = 'No payments and ageing data found for the current vendor.';
        } else if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Unable to load payments and ageing data. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  viewPayment(payment: PaymentAgeingData) {
    this.selectedPayment = payment;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedPayment = null;
  }

  refreshPayments() {
    console.log('[Payments] Refreshing payments and ageing data...');
    this.fetchPaymentsData();
  }

  getAgeingStatus(aging: number): string {
    if (aging <= 30) return 'current';
    if (aging <= 60) return 'overdue';
    return 'critical';
  }

  getFieldLabel(fieldName: string): string {
    const fieldLabels: { [key: string]: string } = {
      'DOC_NUM': 'Document Number',
      'DOC_DATE': 'Document Date',
      'DATS': 'Due Date',
      'AMOUNT': 'Amount',
      'AGING': 'Aging (Days)'
    };
    return fieldLabels[fieldName] || fieldName;
  }

  // Helper method to format date
  private formatDate(dateString: string): string {
    if (!dateString || dateString === '0000-00-00') {
      return '';
    }
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB'); // DD.MM.YYYY format
    } catch (error) {
      return dateString;
    }
  }

  // Helper method to format amount
  private formatAmount(amount: number): string {
    return amount.toLocaleString('de-DE', { minimumFractionDigits: 2 });
  }
}
