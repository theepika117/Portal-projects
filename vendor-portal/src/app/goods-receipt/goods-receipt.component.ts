import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './goods-receipt.component.html',
  styleUrl: './goods-receipt.component.scss'
})
export class GoodsReceiptComponent implements OnInit {
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}
  
  isLoading = true;
  showPopup = false;
  selectedGR: any = null;
  errorMessage = '';

  // Goods Receipt data from SAP
  grList: any[] = [];

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('[GR] User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Fetch Goods Receipt data using logged-in vendor ID
    this.fetchGRData();
  }

  fetchGRData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get the logged-in vendor ID
    const vendorId = this.authService.getLoggedInVendorId();
    
    if (!vendorId) {
      console.error('[GR] No vendor ID found in session');
      this.errorMessage = 'Session expired. Please login again.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log(`[GR] Fetching goods receipt data for vendor ID: ${vendorId}`);

    // Call backend API to get goods receipt data
    this.http.get<any>(`http://localhost:3000/api/goods-receipt/${vendorId}`).subscribe({
      next: (response) => {
        console.log('[GR] Goods receipt data received:', response);
        
        if (response.success) {
          // Map the response to the expected structure for the UI
          this.grList = response.goodsReceipts.map((item: any) => ({
            MATERIAL_DOC_NUM: item.materialDocNum,
            MATERIAL_DOC_YEAR: item.materialDocYear,
            DOC_DATE: this.formatDate(item.docDate),
            POSTING_DATE: this.formatDate(item.postingDate),
            DOC_TYPE: item.docType,
            USER_NAME: item.userName,
            ITEM_NUM_M: item.itemNumM,
            PURCHASE_ORDER_NUM: item.purchaseOrderNum,
            ITEM_NUM_P: item.itemNumP,
            MOVEMENT_TYPE: item.movementType,
            UNIT_OF_MEASURE: item.unitOfMeasure,
            MATERIAL_NUM: item.materialNum,
            PLANT: item.plant,
            STORAGE_LOC: item.storageLoc,
            SUPLIER_NUM: item.supplierNum
          }));
          
          console.log(`[GR] Mapped ${this.grList.length} goods receipt(s) successfully`);
        } else {
          this.errorMessage = 'Failed to load goods receipt data.';
          console.error('[GR] Invalid response structure:', response);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[GR] Failed to fetch goods receipt data:', error);
        
        if (error.status === 404) {
          this.errorMessage = 'No goods receipts found for the current vendor.';
        } else if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Unable to load goods receipt data. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  refreshGR() {
    console.log('[GR] Refreshing goods receipt data...');
    this.fetchGRData();
  }

  viewGR(gr: any) {
    this.selectedGR = gr;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedGR = null;
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
}
