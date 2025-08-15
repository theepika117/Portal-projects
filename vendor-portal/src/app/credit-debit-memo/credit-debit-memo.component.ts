import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

interface CreditDebitMemoData {
  COMPANY_CODE: string;
  DOC_NUM: string;
  FISCAL_YEAR: string;
  LINE_ITEM_NUM: string;
  TYPE: string;
  AMOUNT: string;
  GENDRAL_LEDGER: string;
  POSTING_KEY: string;
  VENDOR_NUM: string;
  CLEARING_DOC_NUM: string;
  SPECIAL_INDICATOR: string;
  POSTING_DATE: string;
  DOC_DATE: string;
  DOC_CURRENCY: string;
  CREATOR_NAME: string;
}

@Component({
  selector: 'app-credit-debit-memo',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './credit-debit-memo.component.html',
  styleUrl: './credit-debit-memo.component.scss'
})
export class CreditDebitMemoComponent implements OnInit {
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}
  
  isLoading = true;
  errorMessage = '';
  
  // Credit Debit Memo data from SAP
  creditDebitMemoData: CreditDebitMemoData[] = [];

  selectedMemo: CreditDebitMemoData | null = null;
  showPopup = false;

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('[CreditDebit] User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Fetch Credit Debit Memo data using logged-in vendor ID
    this.fetchCreditDebitData();
  }

  fetchCreditDebitData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get the logged-in vendor ID
    const vendorId = this.authService.getLoggedInVendorId();
    
    if (!vendorId) {
      console.error('[CreditDebit] No vendor ID found in session');
      this.errorMessage = 'Session expired. Please login again.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log(`[CreditDebit] Fetching credit debit data for vendor ID: ${vendorId}`);

    // Call backend API to get credit debit data
    this.http.get<any>(`http://localhost:3000/api/credit-debit/${vendorId}`).subscribe({
      next: (response) => {
        console.log('[CreditDebit] Credit debit data received:', response);
        
        if (response.success) {
          // Map the response to the expected structure for the UI
          this.creditDebitMemoData = response.creditDebit.map((item: any) => ({
            COMPANY_CODE: item.companyCode,
            DOC_NUM: item.docNum,
            FISCAL_YEAR: item.fiscalYear,
            LINE_ITEM_NUM: item.lineItemNum,
            TYPE: item.type,
            AMOUNT: this.formatAmount(item.amount),
            GENDRAL_LEDGER: item.generalLedger,
            POSTING_KEY: item.postingKey,
            VENDOR_NUM: item.vendorNum,
            CLEARING_DOC_NUM: item.clearingDocNum || '',
            SPECIAL_INDICATOR: item.specialIndicator || '',
            POSTING_DATE: this.formatDate(item.postingDate),
            DOC_DATE: this.formatDate(item.docDate),
            DOC_CURRENCY: item.docCurrency,
            CREATOR_NAME: item.creatorName
          }));
          
          console.log(`[CreditDebit] Mapped ${this.creditDebitMemoData.length} credit debit record(s) successfully`);
        } else {
          this.errorMessage = 'Failed to load credit debit data.';
          console.error('[CreditDebit] Invalid response structure:', response);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[CreditDebit] Failed to fetch credit debit data:', error);
        
        if (error.status === 404) {
          this.errorMessage = 'No credit debit data found for the current vendor.';
        } else if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Unable to load credit debit data. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  viewMemo(memo: CreditDebitMemoData) {
    this.selectedMemo = memo;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedMemo = null;
  }

  refreshMemos() {
    console.log('[CreditDebit] Refreshing credit debit data...');
    this.fetchCreditDebitData();
  }

  getTypeDisplay(type: string): string {
    return type.toUpperCase() === 'S' ? 'S - Credit' : 'H - Debit';
  }

  getTypeClass(type: string): string {
    return type.toUpperCase() === 'S' ? 'credit' : 'debit';
  }

  getFieldLabel(fieldName: string): string {
    const fieldLabels: { [key: string]: string } = {
      'COMPANY_CODE': 'Company Code',
      'DOC_NUM': 'Document Number',
      'FISCAL_YEAR': 'Fiscal Year',
      'LINE_ITEM_NUM': 'Line Item Number',
      'TYPE': 'Debit/Credit Indicator',
      'AMOUNT': 'Amount',
      'GENDRAL_LEDGER': 'General Ledger Account',
      'POSTING_KEY': 'Posting Key',
      'VENDOR_NUM': 'Vendor Number',
      'CLEARING_DOC_NUM': 'Clearing Document Number',
      'SPECIAL_INDICATOR': 'Special G/L Indicator',
      'POSTING_DATE': 'Posting Date',
      'DOC_DATE': 'Document Date',
      'DOC_CURRENCY': 'Currency',
      'CREATOR_NAME': 'Creator Name'
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
