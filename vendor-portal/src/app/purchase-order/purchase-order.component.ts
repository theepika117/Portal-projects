import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.scss'
})
export class PurchaseOrderComponent implements OnInit {
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}
  
  isLoading = true;
  showPopup = false;
  selectedPO: any = null;
  errorMessage = '';

  // Purchase Order data from SAP
  poList: any[] = [];

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('[PO] User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Fetch Purchase Order data using logged-in vendor ID
    this.fetchPOData();
  }

  fetchPOData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get the logged-in vendor ID
    const vendorId = this.authService.getLoggedInVendorId();
    
    if (!vendorId) {
      console.error('[PO] No vendor ID found in session');
      this.errorMessage = 'Session expired. Please login again.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log(`[PO] Fetching purchase order data for vendor ID: ${vendorId}`);

    // Call backend API to get purchase order data
    this.http.get<any>(`http://localhost:3000/api/purchase-order/${vendorId}`).subscribe({
      next: (response) => {
        console.log('[PO] Purchase order data received:', response);
        
        if (response.success) {
          // Map the response to the expected structure for the UI
          this.poList = response.purchaseOrders.map((item: any) => ({
            DOC_NUM: item.docNum,
            DOC_TYPE: item.docType,
            PURCHASING_ORG: item.purchasingOrg,
            PUCHASING_GRP: item.purchasingGrp,
            DOC_DATE: this.formatDate(item.docDate),
            DELIVERY_DATE: this.formatDate(item.deliveryDate),
            CREATOR: item.creator,
            ITEM_NUM: item.itemNum,
            MATERIAL_NUM: item.materialNum,
            SHORT_TXT: item.shortTxt,
            PURCHASE_ORDER_QNTY: this.formatQuantity(item.purchaseOrderQnty),
            UNIT_OF_MEASURE: item.unitOfMeasure,
            NET_PRICE: this.formatPrice(item.netPrice),
            PLANT: item.plant,
            ITEM_CAT: item.itemCat
          }));
          
          console.log(`[PO] Mapped ${this.poList.length} purchase order(s) successfully`);
        } else {
          this.errorMessage = 'Failed to load purchase order data.';
          console.error('[PO] Invalid response structure:', response);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[PO] Failed to fetch purchase order data:', error);
        
        if (error.status === 404) {
          this.errorMessage = 'No purchase orders found for the current vendor.';
        } else if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Unable to load purchase order data. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  refreshPO() {
    console.log('[PO] Refreshing purchase order data...');
    this.fetchPOData();
  }

  viewPO(po: any) {
    this.selectedPO = po;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedPO = null;
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

  // Helper method to format quantity
  private formatQuantity(quantity: number): string {
    return quantity.toLocaleString('de-DE', { minimumFractionDigits: 3 });
  }
}
