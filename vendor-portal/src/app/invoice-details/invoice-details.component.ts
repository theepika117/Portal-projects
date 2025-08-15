import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

interface InvoiceData {
  DOC_NUM: string;
  FISCAL_YEAR: string;
  DOC_TYPE: string;
  DOC_DATE: string;
  USER_NAME: string;
  COMPANY_CODE: string;
  WAERS: string;
  GROSS_AMOUNT: string;
  TAX_AMOUNT: string;
  PURCHASE_DOC_NUM: string;
  ITEM_NUM: string;
  MATERIAL_NUM: string;
  PLANT: string;
  AMOUNT: string;
  QUANTITY: string;
  UNIT: string;
}

@Component({
  selector: 'app-invoice-details',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.scss'
})
export class InvoiceDetailsComponent implements OnInit {
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}
  
  isLoading = true;
  isDownloading = false;
  errorMessage = '';
  
  // Invoice data from SAP
  invoiceData: InvoiceData[] = [];

  selectedInvoice: InvoiceData | null = null;
  showPopup = false;

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('[Invoice] User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Fetch Invoice data using logged-in vendor ID
    this.fetchInvoiceData();
  }

  fetchInvoiceData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get the logged-in vendor ID
    const vendorId = this.authService.getLoggedInVendorId();
    
    if (!vendorId) {
      console.error('[Invoice] No vendor ID found in session');
      this.errorMessage = 'Session expired. Please login again.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log(`[Invoice] Fetching invoice data for vendor ID: ${vendorId}`);

    // Call backend API to get invoice data
    this.http.get<any>(`http://localhost:3000/api/invoice-details/${vendorId}`).subscribe({
      next: (response) => {
        console.log('[Invoice] Invoice data received:', response);
        
        if (response.success) {
          // Map the response to the expected structure for the UI
          this.invoiceData = response.invoiceDetails.map((item: any) => ({
            DOC_NUM: item.docNum,
            FISCAL_YEAR: item.fiscalYear,
            DOC_TYPE: item.docType,
            DOC_DATE: this.formatDate(item.docDate),
            USER_NAME: item.userName,
            COMPANY_CODE: item.companyCode,
            WAERS: item.waers,
            GROSS_AMOUNT: this.formatAmount(item.grossAmount),
            TAX_AMOUNT: this.formatAmount(item.taxAmount),
            PURCHASE_DOC_NUM: item.purchaseDocNum,
            ITEM_NUM: item.itemNum,
            MATERIAL_NUM: item.materialNum,
            PLANT: item.plant,
            AMOUNT: this.formatAmount(item.amount),
            QUANTITY: this.formatQuantity(item.quantity),
            UNIT: item.unit
          }));
          
          console.log(`[Invoice] Mapped ${this.invoiceData.length} invoice(s) successfully`);
        } else {
          this.errorMessage = 'Failed to load invoice data.';
          console.error('[Invoice] Invalid response structure:', response);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Invoice] Failed to fetch invoice data:', error);
        
        if (error.status === 404) {
          this.errorMessage = 'No invoices found for the current vendor.';
        } else if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Unable to load invoice data. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  viewInvoice(invoice: InvoiceData) {
    this.selectedInvoice = invoice;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedInvoice = null;
  }

  refreshInvoices() {
    console.log('[Invoice] Refreshing invoice data...');
    this.fetchInvoiceData();
  }

  // downloadInvoice(docNum: string) {
  //   // Mock PDF download functionality
  //   // In real implementation, this would call a service to generate and download PDF
  //   const link = document.createElement('a');
  //   link.href = '#'; // This would be the actual PDF URL from backend
  //   link.download = `Invoice_${docNum}.pdf`;
  //   link.click();
    
  //   // Show a mock alert for demonstration
  //   alert(`Downloading Invoice PDF for Document Number: ${docNum}`);
  // }
  downloadInvoice(docNum: string) {

    // Get the logged-in vendor ID from the service
    const vendorId = this.authService.getLoggedInVendorId();
    if (!vendorId) {
        console.error('[Invoice] Vendor ID is not available.');
        this.errorMessage = 'Vendor ID not found. Please log in again.';
        this.isDownloading = false;
        return;
    }
    console.log(`[Invoice] Preparing to download invoice for Document Number: ${docNum}?vendorId=${vendorId}`);
    this.isDownloading = true; // Set downloading state

    // Call the new backend endpoint to get the PDF
   this.http.get(`http://localhost:3000/api/download-invoice/${docNum}?vendorId=${vendorId}`, { responseType: 'arraybuffer' }).subscribe({
     next: (response) => {
       console.log('[Invoice] PDF data received from backend, initiating download.');
       const blob = new Blob([response], { type: 'application/pdf' });
       const url = window.URL.createObjectURL(blob);

       const link = document.createElement('a');
       link.href = url;
       link.download = `Invoice_${docNum}.pdf`;
       link.click();

       window.URL.revokeObjectURL(url);
       this.isDownloading = false;
     },
     error: (error) => {
       console.error('[Invoice] Failed to download invoice:', error);
       this.errorMessage = 'Failed to download invoice. Please try again.';
       this.isDownloading = false;
     }
   });
  }



  getFieldLabel(fieldName: string): string {
    const fieldLabels: { [key: string]: string } = {
      'DOC_NUM': 'Document Number',
      'FISCAL_YEAR': 'Fiscal Year',
      'DOC_TYPE': 'Document Type',
      'DOC_DATE': 'Document Date',
      'USER_NAME': 'User Name',
      'COMPANY_CODE': 'Company Code',
      'WAERS': 'Currency',
      'GROSS_AMOUNT': 'Gross Amount',
      'TAX_AMOUNT': 'Tax Amount',
      'PURCHASE_DOC_NUM': 'Purchase Document Number',
      'ITEM_NUM': 'Item Number',
      'MATERIAL_NUM': 'Material Number',
      'PLANT': 'Plant',
      'AMOUNT': 'Amount',
      'QUANTITY': 'Quantity',
      'UNIT': 'Unit of Measure'
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

  // Helper method to format quantity
  private formatQuantity(quantity: number): string {
    return quantity.toLocaleString('de-DE', { minimumFractionDigits: 3 });
  }
}
