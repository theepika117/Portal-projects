import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-for-quotation',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './request-for-quotation.component.html',
  styleUrl: './request-for-quotation.component.scss'
})
export class RequestForQuotationComponent implements OnInit {
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}
  
  isLoading = true;
  showPopup = false;
  selectedRFQ: any = null;
  errorMessage = '';

  // RFQ data from SAP
  rfqList: any[] = [];

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('[RFQ] User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Fetch RFQ data using logged-in vendor ID
    this.fetchRFQData();
  }

  fetchRFQData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get the logged-in vendor ID
    const vendorId = this.authService.getLoggedInVendorId();
    
    if (!vendorId) {
      console.error('[RFQ] No vendor ID found in session');
      this.errorMessage = 'Session expired. Please login again.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log(`[RFQ] Fetching quotation data for vendor ID: ${vendorId}`);

    // Call backend API to get quotation data
    this.http.get<any>(`http://localhost:3000/api/quotation/${vendorId}`).subscribe({
      next: (response) => {
        console.log('[RFQ] Quotation data received:', response);
        
        if (response.success) {
          // Map the response to the expected structure for the UI
          this.rfqList = response.quotations.map((item: any) => ({
            DOC_NUM: item.docNum,
            DOC_TYPE: item.docType,
            PURCHASING_ORG: item.purchasingOrg,
            PUCHASING_GRP: item.purchasingGrp,
            DOC_DATE: this.formatDate(item.docDate),
            CREATOR: item.creator,
            ITEM_NUM: item.itemNum,
            MATERIAL_NUM: item.materialNum,
            SHORT_TXT: item.shortTxt,
            PURCHASE_ORDER_QNTY: item.purchaseOrderQnty.toString(),
            UNIT_OF_MEASURE: item.unitOfMeasure,
            NET_PRICE: this.formatPrice(item.netPrice),
            DELIVERY_DATE: this.formatDate(item.deliveryDate),
            CURRENCY_KEY: item.currencyKey
          }));
          
          console.log(`[RFQ] Mapped ${this.rfqList.length} quotation(s) successfully`);
        } else {
          this.errorMessage = 'Failed to load quotation data.';
          console.error('[RFQ] Invalid response structure:', response);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[RFQ] Failed to fetch quotation data:', error);
        
        if (error.status === 404) {
          this.errorMessage = 'No quotation requests found for the current vendor.';
        } else if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Unable to load quotation data. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  refreshRFQ() {
    console.log('[RFQ] Refreshing quotation data...');
    this.fetchRFQData();
  }

  viewRFQ(rfq: any) {
    this.selectedRFQ = rfq;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedRFQ = null;
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

  // Helper method to format price
  private formatPrice(price: number): string {
    return price.toLocaleString('de-DE', { minimumFractionDigits: 2 });
  }
}
