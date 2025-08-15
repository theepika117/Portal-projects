// src/app/customer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators'; // Ensure 'map' is imported


//require('dotenv').config();

// Existing CustomerProfile interface
export interface CustomerProfile {
  KUNNR: string;
  NAME: string;
  ADDRESS: string;
  CITY: string;
  STREET: string;
  POSTAL_CODE: string;
}

// Existing InquiryData interface
export interface InquiryData {
  SALES_DOC_NO: string;
  CREATION_DATE: string;
  CUSTOMER_ID: string;
  SALES_GRP: string;
  DOC_ITEM: string;
  MATERIAL_NO: string;
  DESCRIPTION: string;
  VRKME: string;
  MEASUREMENT_UNIT: string;
}

// // Corrected SalesOrderData interface - ADDED DOC_TYPE
// export interface SalesOrderData {
//   CustomerId: string;
//   DocNum: string;
//   SalesDocType: string;
//   SalesOrg: string;
//   DistributionChannel: string;
//   ItemNum: string;
//   SalesOrderItem: string;
//   LineNum: string;
//   DeliveryDate: string; // Will be converted to DD.MM.YYYY for display
//   Quantity: string;
//   IssueDate: string; // Will be converted to DD.MM.YYYY for display
// }
export interface SalesOrderData {
  CUSTOMER_ID: string;
  DOC_NUM: string;
  SALES_DOC_TYPE: string;
  SALES_ORG: string;
  DISTRIBUTION_CHANNEL: string;
  ITEM_NUM: string;
  SALES_ORDER_ITEM: string;
  LINE_NUM: string;
  DELIVERY_DATE: string;
  QUANTITY: string;
  ISSUE_DATE: string;
  
}

// Existing DeliveryData interface
// export interface DeliveryData {
//   DOC_NUM: string;
//   CREATION_DATE: string;
//   DELIVERY_TYPE: string;
//   DELIVERY_DATE: string;
//   GOODS_ISSUE_DATE: string;
//   RECEIVING_POINT: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   PLANT: string;
//   STORAGE_LOC: string;
//   MATERIAL_ENTERED: string;
// }


//interface for list of deliveries
export interface DeliveryData {
  DocNum: string;
  CreationDate: string; // Will be converted to DD.MM.YYYY for display
  DeliveryType: string;
  DeliveryDate: string; // Will be converted to DD.MM.YYYY for display
  GoodsIssueDate: string; // Will be converted to DD.MM.YYYY for display
  ReceivingPoint: string;
  SalesOrg: string;
  ItemNum: string;
  MaterialNum: string;
  Plant: string;
  StorageLoc: string;
  MaterialEntered: string;
}

// Existing OverallSalesData interface
export interface OverallSalesData {
  CUSTOMER_ID: string;
  DOC_NUM: string;
  DOC_TYPE: string;
  SALES_ORG: string;
  DISTRIBUTION_CHANNEL?: string;
  ITEM_NUM: string;
  SALES_UNIT: string;
  NET_PRICE: string;
  NET_VALUE: string;
  SD_DOC_CURRENCY: string;
  COST: string;
  LINE_NUM: string;
  DELIVERY_DATE: string;
  QUANTITY: string;
  GOODS_ISSUED_DATE: string;
}

// Existing CreditDebitMemoData interface
export interface CreditDebitMemoData {
  DocNum: string;
  SoldToParty: string;
  BillingDate: string;
  BillingType: string;
  Division: string;
  Terms: string;
  RefDocNum: string;
  AssignmentNum: string;
  ItemNum: string;
  MaterialNum: string;
  InvoicedQnty: string;
  Unit: string;
}

// Existing AgingData interface
export interface AgingData {
  FUNC_CODE: string;
  DOC_NUM: string;
  BILLING_DATE: string;
  NET_AMT: string;
  SD_DOC_CURRENCY: string;
}

// Existing InvoiceData interface
export interface InvoiceData {
  DOC_NUM: string;
  SOLD_TO_PARTY: string;
  BILLING_DATE: string;
  BILLING_TYPE: string;
  SALES_ORG: string;
  DISTRIBUTION_CHANNEL: string;
  TERMS: string;
  DOC_ITEM: string;
  MATERIAL_NUM: string;
  BILLING_QNTY: string;
  NET_VALUE: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private backendUrl = '/api';
  //'http://localhost:3000/api'; // Your Node.js backend URL
  private sapProfileApiUrl = `${this.backendUrl}/profile`;
  private sapInquiryApiUrl = `${this.backendUrl}/inquiry`;
  private sapSalesOrderApiUrl = `${this.backendUrl}/sales-order`; // Corrected to use backend URL
  //private sapDeliveryApiUrl = `${this.backendUrl}/delivery`;
  private sapDeliveryApiUrl = '/api/delivery';
  private sapOverallSalesApiUrl = '/api/overall-sales-data';
  private sapCreditDebitMemoApiUrl = '/api/credit-memo';
  private sapAgingApiUrl = '/api/aging-data';
  private sapInvoiceApiUrl = '/api/invoice-data';
  private sapInvoiceDownloadApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INVOICE_DOWNLOAD_ENDPOINT';


  constructor(private http: HttpClient) { }

  getCustomerProfile(customerId: string): Observable<CustomerProfile> {
    console.log(`CustomerService: Fetching profile for customer ID: ${customerId} via backend.`);
    const payload = { customerId: customerId };

    return this.http.post<any>(this.sapProfileApiUrl, payload).pipe(
      map(response => {
        if (response.status === 'S' && response.profile) {
          console.log('Customer profile fetched successfully from backend:', response.profile);
          return response.profile;
        } else {
          const errorMessage = response.message || 'Failed to fetch customer profile from SAP.';
          console.error('SAP returned error for profile:', errorMessage);
          throw new Error(errorMessage);
        }
      }),
      catchError(error => {
        console.error('Error calling Node.js backend for profile:', error);
        return throwError(() => new Error(error.message || 'Network or backend error fetching profile.'));
      })
    );
  }

  /**
   * Fetches inquiry data for a specific customer from SAP via Node.js backend.
   * @param customerId The ID of the customer to fetch inquiry data for.
   * @returns An Observable of an array of InquiryData.
   */
  getCustomerInquiries(customerId: string): Observable<InquiryData[]> {
    console.log(`CustomerService: Fetching inquiry data for customer ID: ${customerId} via backend.`);
    const payload = { customerId: customerId }; // Send customerId as JSON to Node.js backend

    // --- REAL API CALL (UNCOMMENTED AND MOCK DATA REMOVED) ---
    return this.http.post<any>(this.sapInquiryApiUrl, payload).pipe(
      map(response => {
        // Node.js backend sends a JSON response like { inquiries: [...], message: "...", status: "..." }
        if (response.status === 'S' && response.inquiries) {
          console.log('Customer inquiry data fetched successfully from backend:', response.inquiries);
          // SAP's CreationDate is YYYY-MM-DD, convert to DD.MM.YYYY if needed for display
          return response.inquiries.map((item: InquiryData) => ({
            ...item,
            CREATION_DATE: item.CREATION_DATE ? new Date(item.CREATION_DATE).toLocaleDateString('en-GB') : ''
          }));
        } else {
          // If SAP returns an error status or inquiries data is missing
          const errorMessage = response.message || 'Failed to fetch inquiry data from SAP.';
          console.error('SAP returned error for inquiries:', errorMessage);
          throw new Error(errorMessage);
        }
      }),
      catchError(error => {
        console.error('Error calling Node.js backend for inquiries:', error);
        return throwError(() => new Error(error.message || 'Network or backend error fetching inquiry data.'));
      })
    );
    // --- END REAL API CALL ---

    // --- MOCK DATA FOR DEMONSTRATION (REMOVED) ---
    
  }




  // src/app/customer.service.ts

getCustomerSalesOrders(customerId: string): Observable<SalesOrderData[]> {
  console.log(`CustomerService: Fetching sales orders for customer ID: ${customerId}`);
  const apiUrl = 'http://localhost:3000/api/sales-order-data';
  const payload = { customerId };

  return this.http.post<SalesOrderData[]>(apiUrl, payload).pipe(
    map(response => {
      if (Array.isArray(response)) {
        console.log('Fetched sales order data from backend:', response);
        return response.map((item: SalesOrderData) => ({
          ...item,
          DELIVERY_DATE: item.DELIVERY_DATE
            ? new Date(item.DELIVERY_DATE).toLocaleDateString('en-GB')
            : '',
          ISSUE_DATE: item.ISSUE_DATE
            ? new Date(item.ISSUE_DATE).toLocaleDateString('en-GB')
            : ''
        }));
      } else {
        throw new Error('Unexpected format in sales order response.');
      }
    }),
    catchError(error => {
      console.error('Error fetching sales order data:', error);
      return throwError(() => new Error('Failed to load sales order data.'));
    })
  );
}







  // getCustomerSalesOrders(customerId: string): Observable<SalesOrderData[]> {
  //   console.log(`CustomerService: Fetching sales order data for customer ID: ${customerId}`);
  //   // --- REAL API CALL (UNCOMMENTED AND MOCK DATA REMOVED) ---
  //   const payload = { customerId: customerId };
  //   return this.http.post<SalesOrderData[]>(this.sapSalesOrderApiUrl, payload).pipe(
  //     map(salesOrders => {
  //       console.log('Customer sales order data fetched successfully from backend:', salesOrders);
  //       // Convert date formats from YYYY-MM-DD to DD.MM.YYYY for display
  //       return salesOrders.map(order => ({
  //         ...order,
  //         DeliveryDate: order.DELIVERY_DATE ? new Date(order.DELIVERY_DATE).toLocaleDateString('en-GB') : '',
  //         IssueDate: order.ISSUE_DATE ? new Date(order.ISSUE_DATE).toLocaleDateString('en-GB') : ''
  //       }));
  //     }),
  //     catchError(error => {
  //       console.error('Error calling Node.js backend for sales orders:', error);
  //       return throwError(() => new Error(error.message || 'Network or backend error fetching sales order data.'));
  //     })
  //   );
  //   // --- END REAL API CALL ---
  // }
  
    //   const mockSalesOrders: { [key: string]: SalesOrderData[] } = {
  //     '11': [
  //       { CUSTOMER_ID: '11', DOC_NUM: '20000024', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025', DOC_TYPE: 'QT' },
  //       { CUSTOMER_ID: '11', DOC_NUM: '20000034', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Oreo', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025', DOC_TYPE: 'QT' },
  //       { CUSTOMER_ID: '11', DOC_NUM: '20000044', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Finished Goods', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025', DOC_TYPE: 'QT' },
  //       { CUSTOMER_ID: '11', DOC_NUM: '291', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Sandwich Non Veg', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', ISSUE_DATE: '26.05.2025', DOC_TYPE: 'OR' },
  //       { CUSTOMER_ID: '11', DOC_NUM: '293', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', ISSUE_DATE: '26.05.2025', DOC_TYPE: 'OR' }
  //     ],
  //     '12': [
  //       { CUSTOMER_ID: '12', DOC_NUM: '00000150', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Laptop', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', ISSUE_DATE: '08.05.2025', DOC_TYPE: 'OR' }
  //     ],
  //     '1000': [
  //       { CUSTOMER_ID: '1000', DOC_NUM: '00000600', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Laptop', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', ISSUE_DATE: '08.05.2025', DOC_TYPE: 'OR' }
  //     ]
  //   };
  //   const salesOrders = mockSalesOrders[customerId] || [];
  //   if (salesOrders.length > 0) {
  //     return of(salesOrders).pipe(delay(1500));
  //   } else {
  //     return throwError(() => new Error(`No sales order data found for customer ID ${customerId} (Mock Data).`));
  //   }
  // }

  // 
  
  // getCustomerDeliveries(customerId: string): Observable<DeliveryData[]> {
  //   console.log(`CustomerService: Fetching delivery data for customer ID: ${customerId} via backend.`);
  //   const payload = { customerId: customerId }; // Send customerId as JSON to Node.js backend

  //   // --- REAL API CALL (UNCOMMENTED AND MOCK DATA REMOVED) ---
  //   return this.http.post<DeliveryData[]>(this.sapDeliveryApiUrl, payload).pipe(
  //     map(deliveries => {
  //       console.log('Customer delivery data fetched successfully from backend:', deliveries);
  //       // SAP's dates are YYYY-MM-DD, convert to DD.MM.YYYY for display
  //       return deliveries.map((item: DeliveryData) => ({
  //         ...item,
  //         CreationDate: item.CreationDate ? new Date(item.CreationDate).toLocaleDateString('en-GB') : '',
  //         DeliveryDate: item.DeliveryDate ? new Date(item.DeliveryDate).toLocaleDateString('en-GB') : '',
  //         GoodsIssueDate: item.GoodsIssueDate ? new Date(item.GoodsIssueDate).toLocaleDateString('en-GB') : ''
  //       }));
  //     }),
  //     catchError(error => {
  //       console.error('Error calling Node.js backend for deliveries:', error);
  //       return throwError(() => new Error(error.message || 'Network or backend error fetching delivery data.'));
  //     })
  //   );
  //   // --- END REAL API CALL ---
  // }

updateCustomerDelivery(updatedDelivery: DeliveryData): Observable<any> {
  console.log('CustomerService: Updating delivery...', updatedDelivery);

  return this.http.put<any>(this.sapDeliveryApiUrl + '/update', updatedDelivery).pipe(
    map(response => {
      if (response.status === 'S') {
        console.log('Delivery updated successfully:', response);
        return response;
      } else {
        const message = response.message || 'Failed to update delivery.';
        console.error('Backend returned failure status:', message);
        throw new Error(message);
      }
    }),
    catchError(error => {
      console.error('Error updating delivery:', error);
      return throwError(() => new Error(error.message || 'Error updating delivery.'));
    })
  );
}


getCustomerDeliveries(customerId: string): Observable<DeliveryData[]> {
  console.log(`CustomerService: Fetching delivery data for customer ID: ${customerId} via backend.`);
  const payload = { customerId: customerId }; // JSON payload sent to backend
  console.log('API URL being called:', this.sapDeliveryApiUrl);


  return this.http.post<any>(this.sapDeliveryApiUrl, payload).pipe(
    map(response => {
      // Backend returns array of delivery objects, or throws error on SAP failure
      if (Array.isArray(response)) {
        console.log('Customer delivery data fetched successfully from backend:', response);
        return response.map((item: DeliveryData) => ({
          ...item,
          // Convert date fields if needed for display (SAP gives YYYY-MM-DD)
          CreationDate: item.CreationDate ? new Date(item.CreationDate).toLocaleDateString('en-GB') : '',
          DeliveryDate: item.DeliveryDate ? new Date(item.DeliveryDate).toLocaleDateString('en-GB') : '',
          GoodsIssueDate: item.GoodsIssueDate ? new Date(item.GoodsIssueDate).toLocaleDateString('en-GB') : ''
        }));
      } else {
        const errorMessage = response.message || 'Unexpected format in delivery response.';
        console.error('Unexpected response structure for deliveries:', errorMessage);
        throw new Error(errorMessage);
      }
    }),
    catchError(error => {
      console.error('Error calling backend for customer deliveries:', error);
      return throwError(() => new Error(error.message || 'Network or backend error fetching delivery data.'));
    })
  );
}












  
getOverallSalesData(customerId: string): Observable<OverallSalesData[]> {
  console.log(`CustomerService: Fetching overall sales data for customer ID: ${customerId}`);
  const apiUrl = 'http://localhost:3000/api/overall-sales-data'; // adjust if hosted elsewhere
  const payload = { customerId };

  return this.http.post<OverallSalesData[]>(apiUrl, payload).pipe(
    map(response => {
      if (Array.isArray(response)) {
        console.log('Fetched overall sales data from backend:', response);
        return response.map((item: OverallSalesData) => ({
          ...item,
          DELIVERY_DATE: item.DELIVERY_DATE
            ? new Date(item.DELIVERY_DATE).toLocaleDateString('en-GB')
            : '',
          GOODS_ISSUED_DATE: item.GOODS_ISSUED_DATE
            ? new Date(item.GOODS_ISSUED_DATE).toLocaleDateString('en-GB')
            : ''
        }));
      } else {
        throw new Error('Unexpected format in sales data response.');
      }
    }),
    catchError(error => {
      console.error('Error fetching overall sales data:', error);
      return throwError(() => new Error('Failed to load overall sales data.'));
    })
  );
}













  // getOverallSalesData(customerId: string): Observable<OverallSalesData[]> {
  //   console.log(`CustomerService: Fetching overall sales data for customer ID: ${customerId}`);
  //   const mockOverallSales: { [key: string]: OverallSalesData[] } = {
  //     '11': [
  //       { CUSTOMER_ID: '11', DOC_NUM: '20000024', DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '10.00', NET_VALUE: '200.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '5.000',GOODS_ISSUED_DATE: '21.05.2025' },
  //       { CUSTOMER_ID: '11', DOC_NUM: '20000034', DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '28.00', NET_VALUE: '112.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '2.000',GOODS_ISSUED_DATE: '21.05.2025' },
  //       { CUSTOMER_ID: '11', DOC_NUM: '20000044', DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '44.90', NET_VALUE: '396.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
  //       { CUSTOMER_ID: '11', DOC_NUM: '291', DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '9.77', NET_VALUE: '68.39', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', GOODS_ISSUED_DATE: '26.05.2025' },
  //       { CUSTOMER_ID: '11', DOC_NUM: '293', DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '3.45', NET_VALUE: '10.35', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', GOODS_ISSUED_DATE: '26.05.2025' }
  //     ],
  //     '12': [
  //       { CUSTOMER_ID: '12', DOC_NUM: '00000150', DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '1200.00', NET_VALUE: '1200.00', SD_DOC_CURRENCY: 'USD', COST: '800.00', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', GOODS_ISSUED_DATE: '08.05.2025' }
  //     ],
  //     '1000': [
  //       { CUSTOMER_ID: '1000', DOC_NUM: '00000600', DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '5000.00', NET_VALUE: '10000.00', SD_DOC_CURRENCY: 'USD', COST: '7000.00', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', GOODS_ISSUED_DATE: '05.07.2025' }
  //     ]
  //   };
  //   const salesData = mockOverallSales[customerId] || [];
  //   if (salesData.length > 0) {
  //     return of(salesData).pipe(delay(1500));
  //   } else {
  //     return throwError(() => new Error(`No overall sales data found for customer ID ${customerId} (Mock Data).`));
  //   }
  // }





getCreditDebitMemos(customerId: string): Observable<CreditDebitMemoData[]> {
  console.log(`CustomerService: Fetching credit/debit memos for customer ID: ${customerId}`);
  const apiUrl = 'http://localhost:3000/api/credit-memo';
  const payload = { customerId };

  return this.http.post<CreditDebitMemoData[]>(apiUrl, payload).pipe(
    map(response => {
      if (Array.isArray(response)) {
        console.log('Fetched memo data from backend:', response);
        return response.map((item: CreditDebitMemoData) => ({
          ...item,
          BILLING_DATE: item.BillingDate
            ? new Date(item.BillingDate).toLocaleDateString('en-GB')
            : ''
        }));
      } else {
        throw new Error('Unexpected format in memo response.');
      }
    }),
    catchError(error => {
      console.error('Error fetching memo data:', error);
      return throwError(() => new Error('Failed to load credit/debit memo data.'));
    })
  );
}



//   getCreditDebitMemos(customerId: string): Observable<CreditDebitMemoData[]> {
//   console.log(`CustomerService: Fetching credit/debit memos for customer ID: ${customerId}`);
//   const payload = { customerId: customerId };
//   const apiUrl = '/api/credit-memo';

//   //return this.http.post<any>(apiUrl, payload).pipe(
//   return this.http.get<{ memos: any[] }>(`http://localhost:3000/api/credit-memos/${customerId}`)
//     .pipe(
//       map(response => response.memos)
//     );
//     map(response => {
//       if (Array.isArray(response)) {
//         console.log('Fetched memo data from backend:', response);
//         return response.map((item: CreditDebitMemoData) => ({
//           ...item,
//           BILLING_DATE: item.BILLING_DATE
//             ? new Date(item.BILLING_DATE).toLocaleDateString('en-GB')
//             : ''
//         }));
//       } else {
//         throw new Error('Unexpected format in memo response.');
//       }
//     }),
//     catchError(error => {
//       console.error('Error fetching memo data:', error);
//       return throwError(() => new Error(error.message || 'Failed to load credit/debit memo data.'));
//     })
//   );
// }






  // getCreditDebitMemos(customerId: string): Observable<CreditDebitMemoData[]> {
  //   console.log(`CustomerService: Fetching credit/debit memo data for customer ID: ${customerId}`);
  //   const mockMemos: { [key: string]: CreditDebitMemoData[] } = {
  //     '11': [
  //       { DOC_NUM: '90000009', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'L2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000000999', ASSIGNMENT_NUM: '16', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', INVOICED_QNTY: '2.000', UNIT: 'EA' },
  //       { DOC_NUM: '90000114', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'G2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '900000114', ASSIGNMENT_NUM: '3', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT002', INVOICED_QNTY: '1.000', UNIT: 'EA' }
  //     ],
  //     '12': [
  //       { DOC_NUM: '90000200', SOLD_TO_PARTY: '12', BILLING_DATE: '05.06.2025', BILLING_TYPE: 'L2', DIVISION: '02', TERMS: '0002', REF_DOC_NUM: '9000020000', ASSIGNMENT_NUM: '1', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', INVOICED_QNTY: '1.000', UNIT: 'PC' }
  //     ],
  //     '1000': [
  //       { DOC_NUM: '90000800', SOLD_TO_PARTY: '1000', BILLING_DATE: '10.07.2025', BILLING_TYPE: 'L2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000080000', ASSIGNMENT_NUM: '5', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', INVOICED_QNTY: '1.000', UNIT: 'PC' }
  //     ]
  //   };
  //   const memos = mockMemos[customerId] || [];
  //   if (memos.length > 0) {
  //     return of(memos).pipe(delay(1500));
  //   } else {
  //     return throwError(() => new Error(`No credit/debit memo data found for customer ID ${customerId} (Mock Data).`));
  //   }
  // }











  getAgingData(customerId: string): Observable<AgingData[]> {
  console.log(`CustomerService: Fetching aging data for customer ID: ${customerId}`);
  const apiUrl = 'http://localhost:3000/api/aging-data';
  const payload = { customerId };

  return this.http.post<AgingData[]>(apiUrl, payload).pipe(
    map(response => {
      if (Array.isArray(response)) {
        console.log('Fetched aging data from backend:', response);
        return response.map((item: AgingData) => ({
          ...item,
          BILLING_DATE: item.BILLING_DATE
            ? new Date(item.BILLING_DATE).toLocaleDateString('en-GB')
            : ''
        }));
      } else {
        throw new Error('Unexpected format in aging response.');
      }
    }),
    catchError(error => {
      console.error('Error fetching aging data:', error);
      return throwError(() => new Error('Failed to load aging data.'));
    })
  );
}


  

  // getAgingData(customerId: string): Observable<AgingData[]> {
  //   console.log(`CustomerService: Fetching aging data for customer ID: ${customerId}`);
  //   const mockAgingData: { [key: string]: AgingData[] } = {
  //     '11': [
  //       { FUNC_CODE: 'BP', DOC_NUM: '90000009', BILLING_DATE: '21.05.2025', NET_AMT: '1190.00', SD_DOC_CURRENCY: 'EUR' },
  //       { FUNC_CODE: 'BP', DOC_NUM: '90000114', BILLING_DATE: '21.05.2025', NET_AMT: '33.00', SD_DOC_CURRENCY: 'EUR' },
  //       { FUNC_CODE: 'BP', DOC_NUM: '90000115', BILLING_DATE: '15.04.2025', NET_AMT: '500.00', SD_DOC_CURRENCY: 'EUR' }
  //     ],
  //     '12': [
  //       { FUNC_CODE: 'BP', DOC_NUM: '90000250', BILLING_DATE: '01.06.2025', NET_AMT: '750.00', SD_DOC_CURRENCY: 'USD' }
  //     ],
  //     '1000': [
  //       { FUNC_CODE: 'BP', DOC_NUM: '90000900', BILLING_DATE: '01.07.2025', NET_AMT: '2500.00', SD_DOC_CURRENCY: 'USD' }
  //     ]
  //   };
  //   const agingRecords = mockAgingData[customerId] || [];
  //   if (agingRecords.length > 0) {
  //     return of(agingRecords).pipe(delay(1500));
  //   } else {
  //     return throwError(() => new Error(`No aging data found for customer ID ${customerId} (Mock Data).`));
  //   }
  // }







  /**
   * Fetches invoice data for a specific customer from SAP.
   * @param customerId The ID of the customer to fetch invoice data for.
   * @returns An Observable of an array of InvoiceData.
   */
//   getInvoiceData(customerId: string): Observable<InvoiceData[]> {
//     console.log(`CustomerService: Fetching invoice data for customer ID: ${customerId}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       CUSTOMER_ID: customerId
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post<InvoiceData[]>(this.sapInvoiceApiUrl, payload).pipe(
//       tap(data => console.log('Customer invoice data fetched:', data)),
//       catchError(error => {
//         console.error('Error fetching customer invoice data:', error);
//         return throwError(() => new Error('Failed to fetch customer invoice data from SAP.'));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     const mockInvoices: { [key: string]: InvoiceData[] } = {
//       '11': [
//         {
//           DOC_NUM: '90000009', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'L2',
//           SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', TERMS: '0001', DOC_ITEM: '000010',
//           MATERIAL_NUM: '16', BILLING_QNTY: '2.000', NET_VALUE: '1190.00'
//         },
//         {
//           DOC_NUM: '90000114', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'G2',
//           SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', TERMS: '0001', DOC_ITEM: '000010',
//           MATERIAL_NUM: '9', BILLING_QNTY: '1.000', NET_VALUE: '33.00'
//         }
//       ],
//       '12': [
//         {
//           DOC_NUM: '90000200', SOLD_TO_PARTY: '12', BILLING_DATE: '05.06.2025', BILLING_TYPE: 'L2',
//           SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', TERMS: '0002', DOC_ITEM: '000010',
//           MATERIAL_NUM: 'MAT005', BILLING_QNTY: '1.000', NET_VALUE: '750.00'
//         }
//       ],
//       '1000': [
//         {
//           DOC_NUM: '90000800', SOLD_TO_PARTY: '1000', BILLING_DATE: '10.07.2025', BILLING_TYPE: 'L2',
//           SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', TERMS: '0001', DOC_ITEM: '000010',
//           MATERIAL_NUM: 'MAT010', BILLING_QNTY: '1.000', NET_VALUE: '2500.00'
//         }
//       ]
//     };

//     const invoices = mockInvoices[customerId] || [];
//     if (invoices.length > 0) {
//       return of(invoices).pipe(delay(1500)); // Simulate network delay
//     } else {
//       return throwError(() => new Error(`No invoice data found for customer ID ${customerId} (Mock Data).`));
//     }
//     // --- END MOCK DATA ---
//   }

//   /**
//    * Simulates downloading an invoice PDF.
//    * In a real scenario, this would call an SAP RFC Webservice that generates a PDF
//    * and returns it as a Blob.
//    * @param docNum The document number of the invoice to download.
//    * @returns An Observable of a Blob (PDF file).
//    */
//   downloadInvoice(docNum: string): Observable<Blob> {
//     console.log(`CustomerService: Attempting to download invoice for document number: ${docNum}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       DOC_NUM: docNum
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post(this.sapInvoiceDownloadApiUrl, payload, { responseType: 'blob' }).pipe(
//       tap(() => console.log(`Invoice ${docNum} download initiated.`)),
//       catchError(error => {
//         console.error(`Error downloading invoice ${docNum}:`, error);
//         return throwError(() => new Error(`Failed to download invoice ${docNum}.`));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     // Create a simple mock PDF content (very basic, not a real PDF)
//     const mockPdfContent = `Invoice ${docNum}\n\nThis is a mock PDF for invoice document number ${docNum}.\n\nDate: ${new Date().toLocaleDateString()}\n\nDetails: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
//     const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
//     return of(blob).pipe(delay(1000)); // Simulate network delay
//     // --- END MOCK DATA ---
//   }
// }


getInvoiceData(customerId: string): Observable<InvoiceData[]> {
  console.log(`CustomerService: Fetching invoice data for customer ID: ${customerId}`);

  const apiUrl = 'http://localhost:3000/api/invoice-data'; // Make sure your proxy is set up or use full URL in prod
  const payload = { customerId };

  return this.http.post<InvoiceData[]>(apiUrl, payload).pipe(
    map(response => {
      if (Array.isArray(response)) {
        console.log('Fetched invoice data from backend:', response);
        return response.map((item: InvoiceData) => ({
          ...item,
          BILLING_DATE: item.BILLING_DATE
            ? new Date(item.BILLING_DATE).toLocaleDateString('en-GB')
            : ''
        }));
      } else {
        throw new Error('Unexpected format in invoice response.');
      }
    }),
    catchError(error => {
      console.error('Error fetching invoice data:', error);
      return throwError(() => new Error('Failed to load invoice data.'));
    })
  );
}

downloadInvoice(docNum: string): Observable<Blob> {
    console.log(`CustomerService: Attempting to download invoice for document number: ${docNum}`);

    // --- REAL API CALL (Uncomment and replace with your actual logic) ---
    /*
    const payload = {
      DOC_NUM: docNum
      // Add any other required parameters for your RFC Webservice call
    };
    return this.http.post(this.sapInvoiceDownloadApiUrl, payload, { responseType: 'blob' }).pipe(
      tap(() => console.log(`Invoice ${docNum} download initiated.`)),
      catchError(error => {
        console.error(`Error downloading invoice ${docNum}:`, error);
        return throwError(() => new Error(`Failed to download invoice ${docNum}.`));
      })
    );
    */

    // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
    // Create a simple mock PDF content (very basic, not a real PDF)
    const mockPdfContent = `Invoice ${docNum}\n\nThis is a mock PDF for invoice document number ${docNum}.\n\nDate: ${new Date().toLocaleDateString()}\n\nDetails: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
    const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
    return of(blob).pipe(delay(1000)); // Simulate network delay
    // --- END MOCK DATA ---
  }
}

















// src/app/customer.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, throwError } from 'rxjs';
// import { delay, tap, catchError, map } from 'rxjs/operators'; // Ensure 'map' is imported

// // Existing CustomerProfile interface
// export interface CustomerProfile {
//   KUNNR: string;
//   NAME: string;
//   ADDRESS: string;
//   CITY: string;
//   STREET: string;
//   POSTAL_CODE: string;
// }

// // Existing InquiryData interface
// export interface InquiryData {
//   SALES_DOC_NO: string;
//   CREATION_DATE: string;
//   CUSTOMER_ID: string;
//   SALES_GRP: string;
//   DOC_ITEM: string;
//   MATERIAL_NO: string;
//   DESCRIPTION: string;
//   VRKME: string;
//   MEASUREMENT_UNIT: string;
// }

// // Existing SalesOrderData interface
// export interface SalesOrderData {
//   CUSTOMER_ID: string;
//   DOC_NUM: string;
//   SALES_DOC_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL: string;
//   ITEM_NUM: string;
//   SALES_ORDER_ITEM: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   ISSUE_DATE: string;
// }

// // Existing DeliveryData interface
// export interface DeliveryData {
//   DOC_NUM: string;
//   CREATION_DATE: string;
//   DELIVERY_TYPE: string;
//   DELIVERY_DATE: string;
//   GOODS_ISSUE_DATE: string;
//   RECEIVING_POINT: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   PLANT: string;
//   STORAGE_LOC: string;
//   MATERIAL_ENTERED: string;
// }

// // Corrected OverallSalesData interface - ADDED CUSTOMER_ID
// export interface OverallSalesData {
//   CUSTOMER_ID: string; // Added this line
//   DOC_NUM: string;
//   DOC_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL?: string; // This was added previously
//   ITEM_NUM: string;
//   SALES_UNIT: string;
//   NET_PRICE: string;
//   NET_VALUE: string;
//   SD_DOC_CURRENCY: string;
//   COST: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   GOODS_ISSUED_DATE: string;
// }

// // Existing CreditDebitMemoData interface
// export interface CreditDebitMemoData {
//   DOC_NUM: string;
//   SOLD_TO_PARTY: string;
//   BILLING_DATE: string;
//   BILLING_TYPE: string;
//   DIVISION: string;
//   TERMS: string;
//   REF_DOC_NUM: string;
//   ASSIGNMENT_NUM: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   INVOICED_QNTY: string;
//   UNIT: string;
// }

// // Existing AgingData interface
// export interface AgingData {
//   FUNC_CODE: string;
//   DOC_NUM: string;
//   BILLING_DATE: string;
//   NET_AMT: string;
//   SD_DOC_CURRENCY: string;
// }

// // Existing InvoiceData interface
// export interface InvoiceData {
//   DOC_NUM: string;
//   SOLD_TO_PARTY: string;
//   BILLING_DATE: string;
//   BILLING_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL: string;
//   TERMS: string;
//   DOC_ITEM: string;
//   MATERIAL_NUM: string;
//   BILLING_QNTY: string;
//   NET_VALUE: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CustomerService {
//   private sapProfileApiUrl = 'http://localhost:3000/api/profile';
//   private sapInquiryApiUrl = 'http://localhost:3000/api/inquiry';
//   private sapSalesOrderApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_SALESORDER_ENDPOINT';
//   private sapDeliveryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_DELIVERY_ENDPOINT';
//   private sapOverallSalesApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_OVERALLSALES_ENDPOINT';
//   private sapCreditDebitMemoApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_CREDITDEBITMEMO_ENDPOINT';
//   private sapAgingApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_AGING_ENDPOINT';
//   private sapInvoiceApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INVOICE_ENDPOINT';
//   private sapInvoiceDownloadApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INVOICE_DOWNLOAD_ENDPOINT';


//   constructor(private http: HttpClient) { }

//   getCustomerProfile(customerId: string): Observable<CustomerProfile> {
//     console.log(`CustomerService: Fetching profile for customer ID: ${customerId} via backend.`);
//     const payload = { customerId: customerId };

//     return this.http.post<any>(this.sapProfileApiUrl, payload).pipe(
//       map(response => {
//         if (response.status === 'S' && response.profile) {
//           console.log('Customer profile fetched successfully from backend:', response.profile);
//           return response.profile;
//         } else {
//           const errorMessage = response.message || 'Failed to fetch customer profile from SAP.';
//           console.error('SAP returned error for profile:', errorMessage);
//           throw new Error(errorMessage);
//         }
//       }),
//       catchError(error => {
//         console.error('Error calling Node.js backend for profile:', error);
//         return throwError(() => new Error(error.message || 'Network or backend error fetching profile.'));
//       })
//     );
//   }

//   /**
//    * Fetches inquiry data for a specific customer from SAP via Node.js backend.
//    * @param customerId The ID of the customer to fetch inquiry data for.
//    * @returns An Observable of an array of InquiryData.
//    */
//   getCustomerInquiries(customerId: string): Observable<InquiryData[]> {
//     console.log(`CustomerService: Fetching inquiry data for customer ID: ${customerId} via backend.`);
//     const payload = { customerId: customerId }; // Send customerId as JSON to Node.js backend

//     // --- REAL API CALL (UNCOMMENTED AND MOCK DATA REMOVED) ---
//     return this.http.post<any>(this.sapInquiryApiUrl, payload).pipe(
//       map(response => {
//         // Node.js backend sends a JSON response like { inquiries: [...], message: "...", status: "..." }
//         if (response.status === 'S' && response.inquiries) {
//           console.log('Customer inquiry data fetched successfully from backend:', response.inquiries);
//           // SAP's CreationDate is YYYY-MM-DD, convert to DD.MM.YYYY if needed for display
//           return response.inquiries.map((item: InquiryData) => ({
//             ...item,
//             CREATION_DATE: item.CREATION_DATE ? new Date(item.CREATION_DATE).toLocaleDateString('en-GB') : ''
//           }));
//         } else {
//           // If SAP returns an error status or inquiries data is missing
//           const errorMessage = response.message || 'Failed to fetch inquiry data from SAP.';
//           console.error('SAP returned error for inquiries:', errorMessage);
//           throw new Error(errorMessage);
//         }
//       }),
//       catchError(error => {
//         console.error('Error calling Node.js backend for inquiries:', error);
//         return throwError(() => new Error(error.message || 'Network or backend error fetching inquiry data.'));
//       })
//     );
//     // --- END REAL API CALL ---

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVED) ---
//     /*
//     const mockInquiries: { [key: string]: InquiryData[] } = {
//       '11': [
//         { SALES_DOC_NO: '00000024', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000034', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT002', DESCRIPTION: 'Oreo', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000044', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG2', DOC_ITEM: '000010', MATERIAL_NO: 'MAT003', DESCRIPTION: 'Finished Goods', VRKME: 'IN', MEASUREMENT_UNIT: 'KG' },
//         { SALES_DOC_NO: '70000010', CREATION_DATE: '21.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '291', CREATION_DATE: '25.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG3', DOC_ITEM: '000020', MATERIAL_NO: 'MAT004', DESCRIPTION: 'Sandwich Non Veg', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' }
//       ],
//       '12': [
//         { SALES_DOC_NO: '00000100', CREATION_DATE: '15.04.2025', CUSTOMER_ID: '12', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT005', DESCRIPTION: 'Software License', VRKME: 'EA', MEASUREMENT_UNIT: 'LIC' }
//       ],
//       '1000': [
//         { SALES_DOC_NO: '00000500', CREATION_DATE: '01.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000010', MATERIAL_NO: 'MAT010', DESCRIPTION: 'Consulting Service', VRKME: 'HR', MEASUREMENT_UNIT: 'HR' },
//         { SALES_DOC_NO: '00000501', CREATION_DATE: '05.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000020', MATERIAL_NO: 'MAT011', DESCRIPTION: 'Hardware Purchase', VRKME: 'PC', MEASUREMENT_UNIT: 'PC' }
//       ]
//     };
//     const inquiries = mockInquiries[customerId] || [];
//     if (inquiries.length > 0) {
//       return of(inquiries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No inquiry data found for customer ID ${customerId} (Mock Data).`));
//     }
//     */
//     // --- END MOCK DATA ---
//   }

//   getCustomerSalesOrders(customerId: string): Observable<SalesOrderData[]> {
//     console.log(`CustomerService: Fetching sales order data for customer ID: ${customerId}`);
//     const mockSalesOrders: { [key: string]: SalesOrderData[] } = {
//       '11': [
//         { CUSTOMER_ID: '11', DOC_NUM: '20000024', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000034', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Oreo', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000044', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Finished Goods', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '291', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Sandwich Non Veg', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', ISSUE_DATE: '26.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '293', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', ISSUE_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { CUSTOMER_ID: '12', DOC_NUM: '00000150', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Laptop', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', ISSUE_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { CUSTOMER_ID: '1000', DOC_NUM: '00000600', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'PC', LINE_NUM: '5000.00', DELIVERY_DATE: '10000.00', QUANTITY:  '2.000', ISSUE_DATE: '05.07.2025' }
//       ]
//     };
//     const salesOrders = mockSalesOrders[customerId] || [];
//     if (salesOrders.length > 0) {
//       return of(salesOrders).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No sales order data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerDeliveries(customerId: string): Observable<DeliveryData[]> {
//     console.log(`CustomerService: Fetching delivery data for customer ID: ${customerId}`);
//     const mockDeliveries: { [key: string]: DeliveryData[] } = {
//       '11': [
//         { DOC_NUM: '00000002', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' },
//         { DOC_NUM: '00000005', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000020', MATERIAL_NUM: 'MAT002', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Oreo' },
//         { DOC_NUM: '00000007', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT003', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Finished Goods' },
//         { DOC_NUM: '00000018', CREATION_DATE: '19.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '20.05.2025', GOODS_ISSUE_DATE: '20.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT004', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Sandwich Non Veg' },
//         { DOC_NUM: '00000023', CREATION_DATE: '20.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '21.05.2025', GOODS_ISSUE_DATE: '21.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' }
//       ],
//       '12': [
//         { DOC_NUM: '00000200', CREATION_DATE: '01.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '02.05.2025', GOODS_ISSUE_DATE: '02.05.2025', RECEIVING_POINT: 'Z002', SALES_ORG: '0002', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', PLANT: 'Z002', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Laptop' }
//       ],
//       '1000': [
//         { DOC_NUM: '00000700', CREATION_DATE: '05.07.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '06.07.2025', GOODS_ISSUE_DATE: '06.07.2025', RECEIVING_POINT: 'Z005', SALES_ORG: '0005', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', PLANT: 'Z005', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Server Rack' }
//       ]
//     };
//     const deliveries = mockDeliveries[customerId] || [];
//     if (deliveries.length > 0) {
//       return of(deliveries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No delivery data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getOverallSalesData(customerId: string): Observable<OverallSalesData[]> {
//     console.log(`CustomerService: Fetching overall sales data for customer ID: ${customerId}`);
//     const mockOverallSales: { [key: string]: OverallSalesData[] } = {
//       '11': [
//         { CUSTOMER_ID: '11', DOC_NUM: '20000024', DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '10.00', NET_VALUE: '200.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '5.000',GOODS_ISSUED_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000034', DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '28.00', NET_VALUE: '112.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '2.000',GOODS_ISSUED_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000044', DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '44.90', NET_VALUE: '396.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '291', DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '9.77', NET_VALUE: '68.39', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', GOODS_ISSUED_DATE: '26.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '293', DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '3.45', NET_VALUE: '10.35', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', GOODS_ISSUED_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { CUSTOMER_ID: '12', DOC_NUM: '00000150', DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '1200.00', NET_VALUE: '1200.00', SD_DOC_CURRENCY: 'USD', COST: '800.00', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', GOODS_ISSUED_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { CUSTOMER_ID: '1000', DOC_NUM: '00000600', DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '5000.00', NET_VALUE: '10000.00', SD_DOC_CURRENCY: 'USD', COST: '7000.00', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', GOODS_ISSUED_DATE: '05.07.2025' }
//       ]
//     };
//     const salesData = mockOverallSales[customerId] || [];
//     if (salesData.length > 0) {
//       return of(salesData).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No overall sales data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCreditDebitMemos(customerId: string): Observable<CreditDebitMemoData[]> {
//     console.log(`CustomerService: Fetching credit/debit memo data for customer ID: ${customerId}`);
//     const mockMemos: { [key: string]: CreditDebitMemoData[] } = {
//       '11': [
//         { DOC_NUM: '90000009', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'L2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000000999', ASSIGNMENT_NUM: '16', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', INVOICED_QNTY: '2.000', UNIT: 'EA' },
//         { DOC_NUM: '90000114', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'G2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '900000114', ASSIGNMENT_NUM: '3', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT002', INVOICED_QNTY: '1.000', UNIT: 'EA' }
//       ],
//       '12': [
//         { DOC_NUM: '90000200', SOLD_TO_PARTY: '12', BILLING_DATE: '05.06.2025', BILLING_TYPE: 'L2', DIVISION: '02', TERMS: '0002', REF_DOC_NUM: '9000020000', ASSIGNMENT_NUM: '1', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', INVOICED_QNTY: '1.000', UNIT: 'PC' }
//       ],
//       '1000': [
//         { DOC_NUM: '90000800', SOLD_TO_PARTY: '1000', BILLING_DATE: '10.07.2025', BILLING_TYPE: 'L2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000080000', ASSIGNMENT_NUM: '5', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', INVOICED_QNTY: '1.000', UNIT: 'PC' }
//       ]
//     };
//     const memos = mockMemos[customerId] || [];
//     if (memos.length > 0) {
//       return of(memos).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No credit/debit memo data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getAgingData(customerId: string): Observable<AgingData[]> {
//     console.log(`CustomerService: Fetching aging data for customer ID: ${customerId}`);
//     const mockAgingData: { [key: string]: AgingData[] } = {
//       '11': [
//         { FUNC_CODE: 'BP', DOC_NUM: '90000009', BILLING_DATE: '21.05.2025', NET_AMT: '1190.00', SD_DOC_CURRENCY: 'EUR' },
//         { FUNC_CODE: 'BP', DOC_NUM: '90000114', BILLING_DATE: '21.05.2025', NET_AMT: '33.00', SD_DOC_CURRENCY: 'EUR' },
//         { FUNC_CODE: 'BP', DOC_NUM: '90000115', BILLING_DATE: '15.04.2025', NET_AMT: '500.00', SD_DOC_CURRENCY: 'EUR' }
//       ],
//       '12': [
//         { FUNC_CODE: 'BP', DOC_NUM: '90000250', BILLING_DATE: '01.06.2025', NET_AMT: '750.00', SD_DOC_CURRENCY: 'USD' }
//       ],
//       '1000': [
//         { FUNC_CODE: 'BP', DOC_NUM: '90000900', BILLING_DATE: '01.07.2025', NET_AMT: '2500.00', SD_DOC_CURRENCY: 'USD' }
//       ]
//     };
//     const agingRecords = mockAgingData[customerId] || [];
//     if (agingRecords.length > 0) {
//       return of(agingRecords).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No aging data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   /**
//    * Fetches invoice data for a specific customer from SAP.
//    * @param customerId The ID of the customer to fetch invoice data for.
//    * @returns An Observable of an array of InvoiceData.
//    */
//   getInvoiceData(customerId: string): Observable<InvoiceData[]> {
//     console.log(`CustomerService: Fetching invoice data for customer ID: ${customerId}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       CUSTOMER_ID: customerId
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post<InvoiceData[]>(this.sapInvoiceApiUrl, payload).pipe(
//       tap(data => console.log('Customer invoice data fetched:', data)),
//       catchError(error => {
//         console.error('Error fetching customer invoice data:', error);
//         return throwError(() => new Error('Failed to fetch customer invoice data from SAP.'));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     const mockInvoices: { [key: string]: InvoiceData[] } = {
//       '11': [
//         {
//           DOC_NUM: '90000009', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'L2',
//           SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', TERMS: '0001', DOC_ITEM: '000010',
//           MATERIAL_NUM: '16', BILLING_QNTY: '2.000', NET_VALUE: '1190.00'
//         },
//         {
//           DOC_NUM: '90000114', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'G2',
//           SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', TERMS: '0001', DOC_ITEM: '000010',
//           MATERIAL_NUM: '9', BILLING_QNTY: '1.000', NET_VALUE: '33.00'
//         }
//       ],
//       '12': [
//         {
//           DOC_NUM: '90000200', SOLD_TO_PARTY: '12', BILLING_DATE: '05.06.2025', BILLING_TYPE: 'L2',
//           SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', TERMS: '0002', DOC_ITEM: '000010',
//           MATERIAL_NUM: 'MAT005', BILLING_QNTY: '1.000', NET_VALUE: '750.00'
//         }
//       ],
//       '1000': [
//         {
//           DOC_NUM: '90000800', SOLD_TO_PARTY: '1000', BILLING_DATE: '10.07.2025', BILLING_TYPE: 'L2',
//           SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', TERMS: '0001', DOC_ITEM: '000010',
//           MATERIAL_NUM: 'MAT010', BILLING_QNTY: '1.000', NET_VALUE: '2500.00'
//         }
//       ]
//     };

//     const invoices = mockInvoices[customerId] || [];
//     if (invoices.length > 0) {
//       return of(invoices).pipe(delay(1500)); // Simulate network delay
//     } else {
//       return throwError(() => new Error(`No invoice data found for customer ID ${customerId} (Mock Data).`));
//     }
//     // --- END MOCK DATA ---
//   }

//   /**
//    * Simulates downloading an invoice PDF.
//    * In a real scenario, this would call an SAP RFC Webservice that generates a PDF
//    * and returns it as a Blob.
//    * @param docNum The document number of the invoice to download.
//    * @returns An Observable of a Blob (PDF file).
//    */
//   downloadInvoice(docNum: string): Observable<Blob> {
//     console.log(`CustomerService: Attempting to download invoice for document number: ${docNum}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       DOC_NUM: docNum
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post(this.sapInvoiceDownloadApiUrl, payload, { responseType: 'blob' }).pipe(
//       tap(() => console.log(`Invoice ${docNum} download initiated.`)),
//       catchError(error => {
//         console.error(`Error downloading invoice ${docNum}:`, error);
//         return throwError(() => new Error(`Failed to download invoice ${docNum}.`));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     // Create a simple mock PDF content (very basic, not a real PDF)
//     const mockPdfContent = `Invoice ${docNum}\n\nThis is a mock PDF for invoice document number ${docNum}.\n\nDate: ${new Date().toLocaleDateString()}\n\nDetails: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
//     const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
//     return of(blob).pipe(delay(1000)); // Simulate network delay
//     // --- END MOCK DATA ---
//   }
// }
















// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, throwError } from 'rxjs';
// import { delay, tap, catchError } from 'rxjs/operators';

// // Existing CustomerProfile interface
// export interface CustomerProfile {
//   KUNNR: string;
//   NAME: string;
//   ADDRESS: string;
//   CITY: string;
//   STREET: string;
//   POSTAL_CODE: string;
// }

// // Existing InquiryData interface
// export interface InquiryData {
//   SALES_DOC_NO: string;
//   CREATION_DATE: string;
//   CUSTOMER_ID: string;
//   SALES_GRP: string;
//   DOC_ITEM: string;
//   MATERIAL_NO: string;
//   DESCRIPTION: string;
//   VRKME: string;
//   MEASUREMENT_UNIT: string;
// }

// // Existing SalesOrderData interface
// export interface SalesOrderData {
//   CUSTOMER_ID: string;
//   DOC_NUM: string;
//   SALES_DOC_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL: string;
//   ITEM_NUM: string;
//   SALES_ORDER_ITEM: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   ISSUE_DATE: string;
// }

// // Existing DeliveryData interface
// export interface DeliveryData {
//   DOC_NUM: string;
//   CREATION_DATE: string;
//   DELIVERY_TYPE: string;
//   DELIVERY_DATE: string;
//   GOODS_ISSUE_DATE: string;
//   RECEIVING_POINT: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   PLANT: string;
//   STORAGE_LOC: string;
//   MATERIAL_ENTERED: string;
// }

// // Existing OverallSalesData interface
// export interface OverallSalesData {
//   DOC_NUM: string;
//   DOC_TYPE: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   SALES_UNIT: string;
//   NET_PRICE: string;
//   NET_VALUE: string;
//   SD_DOC_CURRENCY: string;
//   COST: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   GOODS_ISSUED_DATE: string;
// }

// // Existing CreditDebitMemoData interface
// export interface CreditDebitMemoData {
//   DOC_NUM: string;
//   SOLD_TO_PARTY: string;
//   BILLING_DATE: string;
//   BILLING_TYPE: string;
//   DIVISION: string;
//   TERMS: string;
//   REF_DOC_NUM: string;
//   ASSIGNMENT_NUM: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   INVOICED_QNTY: string;
//   UNIT: string;
// }

// // Existing AgingData interface
// export interface AgingData {
//   FUNC_CODE: string;
//   DOC_NUM: string;
//   BILLING_DATE: string;
//   NET_AMT: string;
//   SD_DOC_CURRENCY: string;
// }

// // New interface for Invoice Data (based on ZSD_INVOICE_RT_S)
// export interface InvoiceData {
//   DOC_NUM: string;
//   SOLD_TO_PARTY: string;
//   BILLING_DATE: string; // Assuming format like 'DD.MM.YYYY'
//   BILLING_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL: string;
//   TERMS: string;
//   DOC_ITEM: string;
//   MATERIAL_NUM: string;
//   BILLING_QNTY: string; // Billing quantity in stock keeping unit
//   NET_VALUE: string; // Net Value of Billing item in Document Currency
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CustomerService {
//   private sapProfileApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_PROFILE_ENDPOINT';
//   private sapInquiryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INQUIRY_ENDPOINT';
//   private sapSalesOrderApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_SALESORDER_ENDPOINT';
//   private sapDeliveryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_DELIVERY_ENDPOINT';
//   private sapOverallSalesApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_OVERALLSALES_ENDPOINT';
//   private sapCreditDebitMemoApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_CREDITDEBITMEMO_ENDPOINT';
//   private sapAgingApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_AGING_ENDPOINT';
//   // Placeholder for your actual SAP RFC Webservice endpoint for Invoice Data
//   private sapInvoiceApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INVOICE_ENDPOINT';
//   // Placeholder for your actual SAP RFC Webservice endpoint for Invoice PDF download
//   private sapInvoiceDownloadApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INVOICE_DOWNLOAD_ENDPOINT';


//   constructor(private http: HttpClient) { }

//   getCustomerProfile(customerId: string): Observable<CustomerProfile> {
//     console.log(`CustomerService: Fetching profile for customer ID: ${customerId}`);
//     const mockData: { [key: string]: CustomerProfile } = {
//       '11': { KUNNR: '11', NAME: 'NovaByte Corp.', ADDRESS: '688', CITY: 'Mumbai', STREET: '1st Ave', POSTAL_CODE: '400001' },
//       '12': { KUNNR: '12', NAME: 'Global Solutions', ADDRESS: '123', CITY: 'New York', STREET: 'Main St', POSTAL_CODE: '10001' },
//       '1000': { KUNNR: '1000', NAME: 'SAP Demo Customer', ADDRESS: '456', CITY: 'Walldorf', STREET: 'SAP Allee', POSTAL_CODE: '69190' }
//     };
//     const profile = mockData[customerId];
//     if (profile) {
//       return of(profile).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`Customer profile for ID ${customerId} not found (Mock Data).`));
//     }
//   }

//   getCustomerInquiries(customerId: string): Observable<InquiryData[]> {
//     console.log(`CustomerService: Fetching inquiry data for customer ID: ${customerId}`);
//     const mockInquiries: { [key: string]: InquiryData[] } = {
//       '11': [
//         { SALES_DOC_NO: '00000024', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000034', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT002', DESCRIPTION: 'Oreo', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000044', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG2', DOC_ITEM: '000010', MATERIAL_NO: 'MAT003', DESCRIPTION: 'Finished Goods', VRKME: 'IN', MEASUREMENT_UNIT: 'KG' },
//         { SALES_DOC_NO: '70000010', CREATION_DATE: '21.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '291', CREATION_DATE: '25.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG3', DOC_ITEM: '000020', MATERIAL_NO: 'MAT004', DESCRIPTION: 'Sandwich Non Veg', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' }
//       ],
//       '12': [
//         { SALES_DOC_NO: '00000100', CREATION_DATE: '15.04.2025', CUSTOMER_ID: '12', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT005', DESCRIPTION: 'Software License', VRKME: 'EA', MEASUREMENT_UNIT: 'LIC' }
//       ],
//       '1000': [
//         { SALES_DOC_NO: '00000500', CREATION_DATE: '01.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000010', MATERIAL_NO: 'MAT010', DESCRIPTION: 'Consulting Service', VRKME: 'HR', MEASUREMENT_UNIT: 'HR' },
//         { SALES_DOC_NO: '00000501', CREATION_DATE: '05.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000020', MATERIAL_NO: 'MAT011', DESCRIPTION: 'Hardware Purchase', VRKME: 'PC', MEASUREMENT_UNIT: 'PC' }
//       ]
//     };
//     const inquiries = mockInquiries[customerId] || [];
//     if (inquiries.length > 0) {
//       return of(inquiries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No inquiry data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerSalesOrders(customerId: string): Observable<SalesOrderData[]> {
//     console.log(`CustomerService: Fetching sales order data for customer ID: ${customerId}`);
//     const mockSalesOrders: { [key: string]: SalesOrderData[] } = {
//       '11': [
//         { CUSTOMER_ID: '11', DOC_NUM: '20000024', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000034', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Oreo', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000044', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Finished Goods', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '291', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Sandwich Non Veg', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', ISSUE_DATE: '26.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '293', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', ISSUE_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { CUSTOMER_ID: '12', DOC_NUM: '00000150', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Laptop', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', ISSUE_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { CUSTOMER_ID: '1000', DOC_NUM: '00000600', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Server Rack', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', ISSUE_DATE: '05.07.2025' }
//       ]
//     };
//     const salesOrders = mockSalesOrders[customerId] || [];
//     if (salesOrders.length > 0) {
//       return of(salesOrders).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No sales order data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerDeliveries(customerId: string): Observable<DeliveryData[]> {
//     console.log(`CustomerService: Fetching delivery data for customer ID: ${customerId}`);
//     const mockDeliveries: { [key: string]: DeliveryData[] } = {
//       '11': [
//         { DOC_NUM: '00000002', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' },
//         { DOC_NUM: '00000005', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000020', MATERIAL_NUM: 'MAT002', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Oreo' },
//         { DOC_NUM: '00000007', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT003', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Finished Goods' },
//         { DOC_NUM: '00000018', CREATION_DATE: '19.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '20.05.2025', GOODS_ISSUE_DATE: '20.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT004', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Sandwich Non Veg' },
//         { DOC_NUM: '00000023', CREATION_DATE: '20.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '21.05.2025', GOODS_ISSUE_DATE: '21.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' }
//       ],
//       '12': [
//         { DOC_NUM: '00000200', CREATION_DATE: '01.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '02.05.2025', GOODS_ISSUE_DATE: '02.05.2025', RECEIVING_POINT: 'Z002', SALES_ORG: '0002', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', PLANT: 'Z002', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Laptop' }
//       ],
//       '1000': [
//         { DOC_NUM: '00000700', CREATION_DATE: '05.07.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '06.07.2025', GOODS_ISSUE_DATE: '06.07.2025', RECEIVING_POINT: 'Z005', SALES_ORG: '0005', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', PLANT: 'Z005', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Server Rack' }
//       ]
//     };
//     const deliveries = mockDeliveries[customerId] || [];
//     if (deliveries.length > 0) {
//       return of(deliveries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No delivery data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getOverallSalesData(customerId: string): Observable<OverallSalesData[]> {
//     console.log(`CustomerService: Fetching overall sales data for customer ID: ${customerId}`);
//     const mockOverallSales: { [key: string]: OverallSalesData[] } = {
//       '11': [
//         { DOC_NUM: '20000024', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '10.00', NET_VALUE: '200.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { DOC_NUM: '20000034', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '28.00', NET_VALUE: '112.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { DOC_NUM: '20000044', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '44.90', NET_VALUE: '396.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { DOC_NUM: '291', DOC_TYPE: 'OR', SALES_ORG: 'Z001', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '9.77', NET_VALUE: '68.39', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', GOODS_ISSUED_DATE: '26.05.2025' },
//         { DOC_NUM: '293', DOC_TYPE: 'OR', SALES_ORG: 'Z001', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '3.45', NET_VALUE: '10.35', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', GOODS_ISSUED_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { DOC_NUM: '00000150', DOC_TYPE: 'OR', SALES_ORG: 'Z002', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '1200.00', NET_VALUE: '1200.00', SD_DOC_CURRENCY: 'USD', COST: '800.00', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', GOODS_ISSUED_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { DOC_NUM: '00000600', DOC_TYPE: 'OR', SALES_ORG: 'Z005', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '5000.00', NET_VALUE: '10000.00', SD_DOC_CURRENCY: 'USD', COST: '7000.00', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', GOODS_ISSUED_DATE: '05.07.2025' }
//       ]
//     };
//     const salesData = mockOverallSales[customerId] || [];
//     if (salesData.length > 0) {
//       return of(salesData).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No overall sales data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCreditDebitMemos(customerId: string): Observable<CreditDebitMemoData[]> {
//     console.log(`CustomerService: Fetching credit/debit memo data for customer ID: ${customerId}`);
//     const mockMemos: { [key: string]: CreditDebitMemoData[] } = {
//       '11': [
//         { DOC_NUM: '90000009', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'L2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000000999', ASSIGNMENT_NUM: '16', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', INVOICED_QNTY: '2.000', UNIT: 'EA' },
//         { DOC_NUM: '90000114', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'G2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '900000114', ASSIGNMENT_NUM: '3', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT002', INVOICED_QNTY: '1.000', UNIT: 'EA' }
//       ],
//       '12': [
//         { DOC_NUM: '90000200', SOLD_TO_PARTY: '12', BILLING_DATE: '05.06.2025', BILLING_TYPE: 'L2', DIVISION: '02', TERMS: '0002', REF_DOC_NUM: '9000020000', ASSIGNMENT_NUM: '1', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', INVOICED_QNTY: '1.000', UNIT: 'PC' }
//       ],
//       '1000': [
//         { DOC_NUM: '90000800', SOLD_TO_PARTY: '1000', BILLING_DATE: '10.07.2025', BILLING_TYPE: 'L2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000080000', ASSIGNMENT_NUM: '5', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', INVOICED_QNTY: '1.000', UNIT: 'PC' }
//       ]
//     };
//     const memos = mockMemos[customerId] || [];
//     if (memos.length > 0) {
//       return of(memos).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No credit/debit memo data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getAgingData(customerId: string): Observable<AgingData[]> {
//     console.log(`CustomerService: Fetching aging data for customer ID: ${customerId}`);
//     const mockAgingData: { [key: string]: AgingData[] } = {
//       '11': [
//         { FUNC_CODE: 'BP', DOC_NUM: '90000009', BILLING_DATE: '21.05.2025', NET_AMT: '1190.00', SD_DOC_CURRENCY: 'EUR' },
//         { FUNC_CODE: 'BP', DOC_NUM: '90000114', BILLING_DATE: '21.05.2025', NET_AMT: '33.00', SD_DOC_CURRENCY: 'EUR' },
//         { FUNC_CODE: 'BP', DOC_NUM: '90000115', BILLING_DATE: '15.04.2025', NET_AMT: '500.00', SD_DOC_CURRENCY: 'EUR' }
//       ],
//       '12': [
//         { FUNC_CODE: 'BP', DOC_NUM: '90000250', BILLING_DATE: '01.06.2025', NET_AMT: '750.00', SD_DOC_CURRENCY: 'USD' }
//       ],
//       '1000': [
//         { FUNC_CODE: 'BP', DOC_NUM: '90000900', BILLING_DATE: '01.07.2025', NET_AMT: '2500.00', SD_DOC_CURRENCY: 'USD' }
//       ]
//     };
//     const agingRecords = mockAgingData[customerId] || [];
//     if (agingRecords.length > 0) {
//       return of(agingRecords).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No aging data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   /**
//    * Fetches invoice data for a specific customer from SAP.
//    * @param customerId The ID of the customer to fetch invoice data for.
//    * @returns An Observable of an array of InvoiceData.
//    */
//   getInvoiceData(customerId: string): Observable<InvoiceData[]> {
//     console.log(`CustomerService: Fetching invoice data for customer ID: ${customerId}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       CUSTOMER_ID: customerId
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post<InvoiceData[]>(this.sapInvoiceApiUrl, payload).pipe(
//       tap(data => console.log('Customer invoice data fetched:', data)),
//       catchError(error => {
//         console.error('Error fetching customer invoice data:', error);
//         return throwError(() => new Error('Failed to fetch customer invoice data from SAP.'));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     const mockInvoices: { [key: string]: InvoiceData[] } = {
//       '11': [
//         {
//           DOC_NUM: '90000009', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'L2',
//           SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', TERMS: '0001', DOC_ITEM: '000010',
//           MATERIAL_NUM: '16', BILLING_QNTY: '2.000', NET_VALUE: '1190.00'
//         },
//         {
//           DOC_NUM: '90000114', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'G2',
//           SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', TERMS: '0001', DOC_ITEM: '000010',
//           MATERIAL_NUM: '9', BILLING_QNTY: '1.000', NET_VALUE: '33.00'
//         }
//       ],
//       '12': [
//         {
//           DOC_NUM: '90000200', SOLD_TO_PARTY: '12', BILLING_DATE: '05.06.2025', BILLING_TYPE: 'L2',
//           SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', TERMS: '0002', DOC_ITEM: '000010',
//           MATERIAL_NUM: 'MAT005', BILLING_QNTY: '1.000', NET_VALUE: '750.00'
//         }
//       ],
//       '1000': [
//         {
//           DOC_NUM: '90000800', SOLD_TO_PARTY: '1000', BILLING_DATE: '10.07.2025', BILLING_TYPE: 'L2',
//           SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', TERMS: '0001', DOC_ITEM: '000010',
//           MATERIAL_NUM: 'MAT010', BILLING_QNTY: '1.000', NET_VALUE: '2500.00'
//         }
//       ]
//     };

//     const invoices = mockInvoices[customerId] || [];
//     if (invoices.length > 0) {
//       return of(invoices).pipe(delay(1500)); // Simulate network delay
//     } else {
//       return throwError(() => new Error(`No invoice data found for customer ID ${customerId} (Mock Data).`));
//     }
//     // --- END MOCK DATA ---
//   }

//   /**
//    * Simulates downloading an invoice PDF.
//    * In a real scenario, this would call an SAP RFC Webservice that generates a PDF
//    * and returns it as a Blob.
//    * @param docNum The document number of the invoice to download.
//    * @returns An Observable of a Blob (PDF file).
//    */
//   downloadInvoice(docNum: string): Observable<Blob> {
//     console.log(`CustomerService: Attempting to download invoice for document number: ${docNum}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       DOC_NUM: docNum
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post(this.sapInvoiceDownloadApiUrl, payload, { responseType: 'blob' }).pipe(
//       tap(() => console.log(`Invoice ${docNum} download initiated.`)),
//       catchError(error => {
//         console.error(`Error downloading invoice ${docNum}:`, error);
//         return throwError(() => new Error(`Failed to download invoice ${docNum}.`));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     // Create a simple mock PDF content (very basic, not a real PDF)
//     const mockPdfContent = `Invoice ${docNum}\n\nThis is a mock PDF for invoice document number ${docNum}.\n\nDate: ${new Date().toLocaleDateString()}\n\nDetails: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
//     const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
//     return of(blob).pipe(delay(1000)); // Simulate network delay
//     // --- END MOCK DATA ---
//   }
// }













// src/app/customer.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, throwError } from 'rxjs';
// import { delay, tap, catchError } from 'rxjs/operators';

// // Existing CustomerProfile interface
// export interface CustomerProfile {
//   KUNNR: string;
//   NAME: string;
//   ADDRESS: string;
//   CITY: string;
//   STREET: string;
//   POSTAL_CODE: string;
// }

// // Existing InquiryData interface
// export interface InquiryData {
//   SALES_DOC_NO: string;
//   CREATION_DATE: string;
//   CUSTOMER_ID: string;
//   SALES_GRP: string;
//   DOC_ITEM: string;
//   MATERIAL_NO: string;
//   DESCRIPTION: string;
//   VRKME: string;
//   MEASUREMENT_UNIT: string;
// }

// // Existing SalesOrderData interface
// export interface SalesOrderData {
//   CUSTOMER_ID: string;
//   DOC_NUM: string;
//   SALES_DOC_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL: string;
//   ITEM_NUM: string;
//   SALES_ORDER_ITEM: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   ISSUE_DATE: string;
// }

// // Existing DeliveryData interface
// export interface DeliveryData {
//   DOC_NUM: string;
//   CREATION_DATE: string;
//   DELIVERY_TYPE: string;
//   DELIVERY_DATE: string;
//   GOODS_ISSUE_DATE: string;
//   RECEIVING_POINT: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   PLANT: string;
//   STORAGE_LOC: string;
//   MATERIAL_ENTERED: string;
// }

// // Existing OverallSalesData interface
// export interface OverallSalesData {
//   DOC_NUM: string;
//   DOC_TYPE: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   SALES_UNIT: string;
//   NET_PRICE: string;
//   NET_VALUE: string;
//   SD_DOC_CURRENCY: string;
//   COST: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   GOODS_ISSUED_DATE: string;
// }

// // Existing CreditDebitMemoData interface
// export interface CreditDebitMemoData {
//   DOC_NUM: string;
//   SOLD_TO_PARTY: string;
//   BILLING_DATE: string;
//   BILLING_TYPE: string;
//   DIVISION: string;
//   TERMS: string;
//   REF_DOC_NUM: string;
//   ASSIGNMENT_NUM: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   INVOICED_QNTY: string;
//   UNIT: string;
// }

// // New interface for Aging Data (based on ZSD_AGEING_RT_S)
// export interface AgingData {
//   FUNC_CODE: string;
//   DOC_NUM: string;
//   BILLING_DATE: string; // Assuming format like 'DD.MM.YYYY'
//   NET_AMT: string; // Net Value in Document Currency
//   SD_DOC_CURRENCY: string;
//   // If Due Date was available from SAP, you'd add it here:
//   // DUE_DATE: string;
//   // And then calculate aging days in the component or pipe
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CustomerService {
//   private sapProfileApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_PROFILE_ENDPOINT';
//   private sapInquiryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INQUIRY_ENDPOINT';
//   private sapSalesOrderApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_SALESORDER_ENDPOINT';
//   private sapDeliveryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_DELIVERY_ENDPOINT';
//   private sapOverallSalesApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_OVERALLSALES_ENDPOINT';
//   private sapCreditDebitMemoApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_CREDITDEBITMEMO_ENDPOINT';
//   // Placeholder for your actual SAP RFC Webservice endpoint for Aging Data
//   private sapAgingApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_AGING_ENDPOINT';

//   constructor(private http: HttpClient) { }

//   getCustomerProfile(customerId: string): Observable<CustomerProfile> {
//     console.log(`CustomerService: Fetching profile for customer ID: ${customerId}`);
//     const mockData: { [key: string]: CustomerProfile } = {
//       '11': { KUNNR: '11', NAME: 'NovaByte Corp.', ADDRESS: '688', CITY: 'Mumbai', STREET: '1st Ave', POSTAL_CODE: '400001' },
//       '12': { KUNNR: '12', NAME: 'Global Solutions', ADDRESS: '123', CITY: 'New York', STREET: 'Main St', POSTAL_CODE: '10001' },
//       '1000': { KUNNR: '1000', NAME: 'SAP Demo Customer', ADDRESS: '456', CITY: 'Walldorf', STREET: 'SAP Allee', POSTAL_CODE: '69190' }
//     };
//     const profile = mockData[customerId];
//     if (profile) {
//       return of(profile).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`Customer profile for ID ${customerId} not found (Mock Data).`));
//     }
//   }

//   getCustomerInquiries(customerId: string): Observable<InquiryData[]> {
//     console.log(`CustomerService: Fetching inquiry data for customer ID: ${customerId}`);
//     const mockInquiries: { [key: string]: InquiryData[] } = {
//       '11': [
//         { SALES_DOC_NO: '00000024', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000034', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT002', DESCRIPTION: 'Oreo', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000044', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG2', DOC_ITEM: '000010', MATERIAL_NO: 'MAT003', DESCRIPTION: 'Finished Goods', VRKME: 'IN', MEASUREMENT_UNIT: 'KG' },
//         { SALES_DOC_NO: '70000010', CREATION_DATE: '21.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '291', CREATION_DATE: '25.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG3', DOC_ITEM: '000020', MATERIAL_NO: 'MAT004', DESCRIPTION: 'Sandwich Non Veg', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' }
//       ],
//       '12': [
//         { SALES_DOC_NO: '00000100', CREATION_DATE: '15.04.2025', CUSTOMER_ID: '12', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT005', DESCRIPTION: 'Software License', VRKME: 'EA', MEASUREMENT_UNIT: 'LIC' }
//       ],
//       '1000': [
//         { SALES_DOC_NO: '00000500', CREATION_DATE: '01.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000010', MATERIAL_NO: 'MAT010', DESCRIPTION: 'Consulting Service', VRKME: 'HR', MEASUREMENT_UNIT: 'HR' },
//         { SALES_DOC_NO: '00000501', CREATION_DATE: '05.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000020', MATERIAL_NO: 'MAT011', DESCRIPTION: 'Hardware Purchase', VRKME: 'PC', MEASUREMENT_UNIT: 'PC' }
//       ]
//     };
//     const inquiries = mockInquiries[customerId] || [];
//     if (inquiries.length > 0) {
//       return of(inquiries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No inquiry data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerSalesOrders(customerId: string): Observable<SalesOrderData[]> {
//     console.log(`CustomerService: Fetching sales order data for customer ID: ${customerId}`);
//     const mockSalesOrders: { [key: string]: SalesOrderData[] } = {
//       '11': [
//         { CUSTOMER_ID: '11', DOC_NUM: '20000024', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000034', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Oreo', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000044', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Finished Goods', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '291', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Sandwich Non Veg', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', ISSUE_DATE: '26.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '293', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', ISSUE_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { CUSTOMER_ID: '12', DOC_NUM: '00000150', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Laptop', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', ISSUE_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { CUSTOMER_ID: '1000', DOC_NUM: '00000600', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Server Rack', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', ISSUE_DATE: '05.07.2025' }
//       ]
//     };
//     const salesOrders = mockSalesOrders[customerId] || [];
//     if (salesOrders.length > 0) {
//       return of(salesOrders).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No sales order data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerDeliveries(customerId: string): Observable<DeliveryData[]> {
//     console.log(`CustomerService: Fetching delivery data for customer ID: ${customerId}`);
//     const mockDeliveries: { [key: string]: DeliveryData[] } = {
//       '11': [
//         { DOC_NUM: '00000002', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' },
//         { DOC_NUM: '00000005', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000020', MATERIAL_NUM: 'MAT002', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Oreo' },
//         { DOC_NUM: '00000007', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT003', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Finished Goods' },
//         { DOC_NUM: '00000018', CREATION_DATE: '19.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '20.05.2025', GOODS_ISSUE_DATE: '20.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT004', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Sandwich Non Veg' },
//         { DOC_NUM: '00000023', CREATION_DATE: '20.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '21.05.2025', GOODS_ISSUE_DATE: '21.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' }
//       ],
//       '12': [
//         { DOC_NUM: '00000200', CREATION_DATE: '01.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '02.05.2025', GOODS_ISSUE_DATE: '02.05.2025', RECEIVING_POINT: 'Z002', SALES_ORG: '0002', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', PLANT: 'Z002', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Laptop' }
//       ],
//       '1000': [
//         { DOC_NUM: '00000700', CREATION_DATE: '05.07.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '06.07.2025', GOODS_ISSUE_DATE: '06.07.2025', RECEIVING_POINT: 'Z005', SALES_ORG: '0005', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', PLANT: 'Z005', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Server Rack' }
//       ]
//     };
//     const deliveries = mockDeliveries[customerId] || [];
//     if (deliveries.length > 0) {
//       return of(deliveries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No delivery data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getOverallSalesData(customerId: string): Observable<OverallSalesData[]> {
//     console.log(`CustomerService: Fetching overall sales data for customer ID: ${customerId}`);
//     const mockOverallSales: { [key: string]: OverallSalesData[] } = {
//       '11': [
//         { DOC_NUM: '20000024', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '10.00', NET_VALUE: '200.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { DOC_NUM: '20000034', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '28.00', NET_VALUE: '112.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { DOC_NUM: '20000044', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '44.90', NET_VALUE: '396.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { DOC_NUM: '291', DOC_TYPE: 'OR', SALES_ORG: 'Z001', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '9.77', NET_VALUE: '68.39', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', GOODS_ISSUED_DATE: '26.05.2025' },
//         { DOC_NUM: '293', DOC_TYPE: 'OR', SALES_ORG: 'Z001', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '3.45', NET_VALUE: '10.35', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', GOODS_ISSUED_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { DOC_NUM: '00000150', DOC_TYPE: 'OR', SALES_ORG: 'Z002', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '1200.00', NET_VALUE: '1200.00', SD_DOC_CURRENCY: 'USD', COST: '800.00', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', GOODS_ISSUED_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { DOC_NUM: '00000600', DOC_TYPE: 'OR', SALES_ORG: 'Z005', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '5000.00', NET_VALUE: '10000.00', SD_DOC_CURRENCY: 'USD', COST: '7000.00', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', GOODS_ISSUED_DATE: '05.07.2025' }
//       ]
//     };
//     const salesData = mockOverallSales[customerId] || [];
//     if (salesData.length > 0) {
//       return of(salesData).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No overall sales data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCreditDebitMemos(customerId: string): Observable<CreditDebitMemoData[]> {
//     console.log(`CustomerService: Fetching credit/debit memo data for customer ID: ${customerId}`);
//     const mockMemos: { [key: string]: CreditDebitMemoData[] } = {
//       '11': [
//         { DOC_NUM: '90000009', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'L2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000000999', ASSIGNMENT_NUM: '16', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', INVOICED_QNTY: '2.000', UNIT: 'EA' },
//         { DOC_NUM: '90000114', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'G2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '900000114', ASSIGNMENT_NUM: '3', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT002', INVOICED_QNTY: '1.000', UNIT: 'EA' }
//       ],
//       '12': [
//         { DOC_NUM: '90000200', SOLD_TO_PARTY: '12', BILLING_DATE: '05.06.2025', BILLING_TYPE: 'L2', DIVISION: '02', TERMS: '0002', REF_DOC_NUM: '9000020000', ASSIGNMENT_NUM: '1', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', INVOICED_QNTY: '1.000', UNIT: 'PC' }
//       ],
//       '1000': [
//         { DOC_NUM: '90000800', SOLD_TO_PARTY: '1000', BILLING_DATE: '10.07.2025', BILLING_TYPE: 'L2', DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000080000', ASSIGNMENT_NUM: '5', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', INVOICED_QNTY: '1.000', UNIT: 'PC' }
//       ]
//     };
//     const memos = mockMemos[customerId] || [];
//     if (memos.length > 0) {
//       return of(memos).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No credit/debit memo data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   /**
//    * Fetches aging data for a specific customer from SAP.
//    * @param customerId The ID of the customer to fetch aging data for.
//    * @returns An Observable of an array of AgingData.
//    */
//   getAgingData(customerId: string): Observable<AgingData[]> {
//     console.log(`CustomerService: Fetching aging data for customer ID: ${customerId}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       CUSTOMER_ID: customerId
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post<AgingData[]>(this.sapAgingApiUrl, payload).pipe(
//       tap(data => console.log('Customer aging data fetched:', data)),
//       catchError(error => {
//         console.error('Error fetching customer aging data:', error);
//         return throwError(() => new Error('Failed to fetch customer aging data from SAP.'));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     const mockAgingData: { [key: string]: AgingData[] } = {
//       '11': [
//         { FUNC_CODE: 'BP', DOC_NUM: '90000009', BILLING_DATE: '21.05.2025', NET_AMT: '1190.00', SD_DOC_CURRENCY: 'EUR' },
//         { FUNC_CODE: 'BP', DOC_NUM: '90000114', BILLING_DATE: '21.05.2025', NET_AMT: '33.00', SD_DOC_CURRENCY: 'EUR' },
//         { FUNC_CODE: 'BP', DOC_NUM: '90000115', BILLING_DATE: '15.04.2025', NET_AMT: '500.00', SD_DOC_CURRENCY: 'EUR' }
//       ],
//       '12': [
//         { FUNC_CODE: 'BP', DOC_NUM: '90000250', BILLING_DATE: '01.06.2025', NET_AMT: '750.00', SD_DOC_CURRENCY: 'USD' }
//       ],
//       '1000': [
//         { FUNC_CODE: 'BP', DOC_NUM: '90000900', BILLING_DATE: '01.07.2025', NET_AMT: '2500.00', SD_DOC_CURRENCY: 'USD' }
//       ]
//     };

//     const agingRecords = mockAgingData[customerId] || [];
//     if (agingRecords.length > 0) {
//       return of(agingRecords).pipe(delay(1500)); // Simulate network delay
//     } else {
//       return throwError(() => new Error(`No aging data found for customer ID ${customerId} (Mock Data).`));
//     }
//     // --- END MOCK DATA ---
//   }
// }











// src/app/customer.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, throwError } from 'rxjs';
// import { delay, tap, catchError } from 'rxjs/operators';

// // Existing CustomerProfile interface
// export interface CustomerProfile {
//   KUNNR: string;
//   NAME: string;
//   ADDRESS: string;
//   CITY: string;
//   STREET: string;
//   POSTAL_CODE: string;
// }

// // Existing InquiryData interface
// export interface InquiryData {
//   SALES_DOC_NO: string;
//   CREATION_DATE: string;
//   CUSTOMER_ID: string;
//   SALES_GRP: string;
//   DOC_ITEM: string;
//   MATERIAL_NO: string;
//   DESCRIPTION: string;
//   VRKME: string;
//   MEASUREMENT_UNIT: string;
// }

// // Existing SalesOrderData interface
// export interface SalesOrderData {
//   CUSTOMER_ID: string;
//   DOC_NUM: string;
//   SALES_DOC_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL: string;
//   ITEM_NUM: string;
//   SALES_ORDER_ITEM: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   ISSUE_DATE: string;
// }

// // Existing DeliveryData interface
// export interface DeliveryData {
//   DOC_NUM: string;
//   CREATION_DATE: string;
//   DELIVERY_TYPE: string;
//   DELIVERY_DATE: string;
//   GOODS_ISSUE_DATE: string;
//   RECEIVING_POINT: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   PLANT: string;
//   STORAGE_LOC: string;
//   MATERIAL_ENTERED: string;
// }

// // Existing OverallSalesData interface
// export interface OverallSalesData {
//   DOC_NUM: string;
//   DOC_TYPE: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   SALES_UNIT: string;
//   NET_PRICE: string;
//   NET_VALUE: string;
//   SD_DOC_CURRENCY: string;
//   COST: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   GOODS_ISSUED_DATE: string;
// }

// // New interface for Credit/Debit Memo Data (based on ZSD_CREDIT_MEMO_RT_S)
// export interface CreditDebitMemoData {
//   DOC_NUM: string;
//   SOLD_TO_PARTY: string;
//   BILLING_DATE: string; // Assuming format like 'DD.MM.YYYY'
//   BILLING_TYPE: string;
//   DIVISION: string;
//   TERMS: string;
//   REF_DOC_NUM: string;
//   ASSIGNMENT_NUM: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   INVOICED_QNTY: string; // Assuming string for quantity
//   UNIT: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CustomerService {
//   private sapProfileApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_PROFILE_ENDPOINT';
//   private sapInquiryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INQUIRY_ENDPOINT';
//   private sapSalesOrderApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_SALESORDER_ENDPOINT';
//   private sapDeliveryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_DELIVERY_ENDPOINT';
//   private sapOverallSalesApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_OVERALLSALES_ENDPOINT';
//   // Placeholder for your actual SAP RFC Webservice endpoint for Credit/Debit Memo
//   private sapCreditDebitMemoApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_CREDITDEBITMEMO_ENDPOINT';

//   constructor(private http: HttpClient) { }

//   getCustomerProfile(customerId: string): Observable<CustomerProfile> {
//     console.log(`CustomerService: Fetching profile for customer ID: ${customerId}`);
//     const mockData: { [key: string]: CustomerProfile } = {
//       '11': { KUNNR: '11', NAME: 'NovaByte Corp.', ADDRESS: '688', CITY: 'Mumbai', STREET: '1st Ave', POSTAL_CODE: '400001' },
//       '12': { KUNNR: '12', NAME: 'Global Solutions', ADDRESS: '123', CITY: 'New York', STREET: 'Main St', POSTAL_CODE: '10001' },
//       '1000': { KUNNR: '1000', NAME: 'SAP Demo Customer', ADDRESS: '456', CITY: 'Walldorf', STREET: 'SAP Allee', POSTAL_CODE: '69190' }
//     };
//     const profile = mockData[customerId];
//     if (profile) {
//       return of(profile).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`Customer profile for ID ${customerId} not found (Mock Data).`));
//     }
//   }

//   getCustomerInquiries(customerId: string): Observable<InquiryData[]> {
//     console.log(`CustomerService: Fetching inquiry data for customer ID: ${customerId}`);
//     const mockInquiries: { [key: string]: InquiryData[] } = {
//       '11': [
//         { SALES_DOC_NO: '00000024', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000034', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT002', DESCRIPTION: 'Oreo', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000044', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG2', DOC_ITEM: '000010', MATERIAL_NO: 'MAT003', DESCRIPTION: 'Finished Goods', VRKME: 'IN', MEASUREMENT_UNIT: 'KG' },
//         { SALES_DOC_NO: '70000010', CREATION_DATE: '21.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '291', CREATION_DATE: '25.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG3', DOC_ITEM: '000020', MATERIAL_NO: 'MAT004', DESCRIPTION: 'Sandwich Non Veg', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' }
//       ],
//       '12': [
//         { SALES_DOC_NO: '00000100', CREATION_DATE: '15.04.2025', CUSTOMER_ID: '12', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT005', DESCRIPTION: 'Software License', VRKME: 'EA', MEASUREMENT_UNIT: 'LIC' }
//       ],
//       '1000': [
//         { SALES_DOC_NO: '00000500', CREATION_DATE: '01.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000010', MATERIAL_NO: 'MAT010', DESCRIPTION: 'Consulting Service', VRKME: 'HR', MEASUREMENT_UNIT: 'HR' },
//         { SALES_DOC_NO: '00000501', CREATION_DATE: '05.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000020', MATERIAL_NO: 'MAT011', DESCRIPTION: 'Hardware Purchase', VRKME: 'PC', MEASUREMENT_UNIT: 'PC' }
//       ]
//     };
//     const inquiries = mockInquiries[customerId] || [];
//     if (inquiries.length > 0) {
//       return of(inquiries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No inquiry data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerSalesOrders(customerId: string): Observable<SalesOrderData[]> {
//     console.log(`CustomerService: Fetching sales order data for customer ID: ${customerId}`);
//     const mockSalesOrders: { [key: string]: SalesOrderData[] } = {
//       '11': [
//         { CUSTOMER_ID: '11', DOC_NUM: '20000024', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000034', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Oreo', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000044', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Finished Goods', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '291', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Sandwich Non Veg', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', ISSUE_DATE: '26.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '293', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', ISSUE_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { CUSTOMER_ID: '12', DOC_NUM: '00000150', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Laptop', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', ISSUE_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { CUSTOMER_ID: '1000', DOC_NUM: '00000600', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Server Rack', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', ISSUE_DATE: '05.07.2025' }
//       ]
//     };
//     const salesOrders = mockSalesOrders[customerId] || [];
//     if (salesOrders.length > 0) {
//       return of(salesOrders).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No sales order data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerDeliveries(customerId: string): Observable<DeliveryData[]> {
//     console.log(`CustomerService: Fetching delivery data for customer ID: ${customerId}`);
//     const mockDeliveries: { [key: string]: DeliveryData[] } = {
//       '11': [
//         { DOC_NUM: '00000002', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' },
//         { DOC_NUM: '00000005', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000020', MATERIAL_NUM: 'MAT002', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Oreo' },
//         { DOC_NUM: '00000007', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT003', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Finished Goods' },
//         { DOC_NUM: '00000018', CREATION_DATE: '19.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '20.05.2025', GOODS_ISSUE_DATE: '20.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT004', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Sandwich Non Veg' },
//         { DOC_NUM: '00000023', CREATION_DATE: '20.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '21.05.2025', GOODS_ISSUE_DATE: '21.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' }
//       ],
//       '12': [
//         { DOC_NUM: '00000200', CREATION_DATE: '01.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '02.05.2025', GOODS_ISSUE_DATE: '02.05.2025', RECEIVING_POINT: 'Z002', SALES_ORG: '0002', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', PLANT: 'Z002', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Laptop' }
//       ],
//       '1000': [
//         { DOC_NUM: '00000700', CREATION_DATE: '05.07.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '06.07.2025', GOODS_ISSUE_DATE: '06.07.2025', RECEIVING_POINT: 'Z005', SALES_ORG: '0005', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', PLANT: 'Z005', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Server Rack' }
//       ]
//     };
//     const deliveries = mockDeliveries[customerId] || [];
//     if (deliveries.length > 0) {
//       return of(deliveries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No delivery data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getOverallSalesData(customerId: string): Observable<OverallSalesData[]> {
//     console.log(`CustomerService: Fetching overall sales data for customer ID: ${customerId}`);
//     const mockOverallSales: { [key: string]: OverallSalesData[] } = {
//       '11': [
//         { DOC_NUM: '20000024', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '10.00', NET_VALUE: '200.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { DOC_NUM: '20000034', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '28.00', NET_VALUE: '112.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { DOC_NUM: '20000044', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA', NET_PRICE: '44.90', NET_VALUE: '396.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025' },
//         { DOC_NUM: '291', DOC_TYPE: 'OR', SALES_ORG: 'Z001', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '9.77', NET_VALUE: '68.39', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', GOODS_ISSUED_DATE: '26.05.2025' },
//         { DOC_NUM: '293', DOC_TYPE: 'OR', SALES_ORG: 'Z001', ITEM_NUM: '000020', SALES_UNIT: 'EA', NET_PRICE: '3.45', NET_VALUE: '10.35', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', GOODS_ISSUED_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { DOC_NUM: '00000150', DOC_TYPE: 'OR', SALES_ORG: 'Z002', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '1200.00', NET_VALUE: '1200.00', SD_DOC_CURRENCY: 'USD', COST: '800.00', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', GOODS_ISSUED_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { DOC_NUM: '00000600', DOC_TYPE: 'OR', SALES_ORG: 'Z005', ITEM_NUM: '000010', SALES_UNIT: 'PC', NET_PRICE: '5000.00', NET_VALUE: '10000.00', SD_DOC_CURRENCY: 'USD', COST: '7000.00', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', GOODS_ISSUED_DATE: '05.07.2025' }
//       ]
//     };
//     const salesData = mockOverallSales[customerId] || [];
//     if (salesData.length > 0) {
//       return of(salesData).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No overall sales data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   /**
//    * Fetches credit/debit memo data for a specific customer from SAP.
//    * @param customerId The ID of the customer to fetch memo data for.
//    * @returns An Observable of an array of CreditDebitMemoData.
//    */
//   getCreditDebitMemos(customerId: string): Observable<CreditDebitMemoData[]> {
//     console.log(`CustomerService: Fetching credit/debit memo data for customer ID: ${customerId}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       CUSTOMER_ID: customerId
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post<CreditDebitMemoData[]>(this.sapCreditDebitMemoApiUrl, payload).pipe(
//       tap(data => console.log('Customer credit/debit memos fetched:', data)),
//       catchError(error => {
//         console.error('Error fetching customer credit/debit memos:', error);
//         return throwError(() => new Error('Failed to fetch customer credit/debit memos from SAP.'));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     const mockMemos: { [key: string]: CreditDebitMemoData[] } = {
//       '11': [
//         {
//           DOC_NUM: '90000009', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'L2',
//           DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000000999', ASSIGNMENT_NUM: '16',
//           ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', INVOICED_QNTY: '2.000', UNIT: 'EA'
//         },
//         {
//           DOC_NUM: '90000114', SOLD_TO_PARTY: '11', BILLING_DATE: '21.05.2025', BILLING_TYPE: 'G2',
//           DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '900000114', ASSIGNMENT_NUM: '3',
//           ITEM_NUM: '000010', MATERIAL_NUM: 'MAT002', INVOICED_QNTY: '1.000', UNIT: 'EA'
//         }
//       ],
//       '12': [
//         {
//           DOC_NUM: '90000200', SOLD_TO_PARTY: '12', BILLING_DATE: '05.06.2025', BILLING_TYPE: 'L2',
//           DIVISION: '02', TERMS: '0002', REF_DOC_NUM: '9000020000', ASSIGNMENT_NUM: '1',
//           ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', INVOICED_QNTY: '1.000', UNIT: 'PC'
//         }
//       ],
//       '1000': [
//         {
//           DOC_NUM: '90000800', SOLD_TO_PARTY: '1000', BILLING_DATE: '10.07.2025', BILLING_TYPE: 'L2',
//           DIVISION: '01', TERMS: '0001', REF_DOC_NUM: '9000080000', ASSIGNMENT_NUM: '5',
//           ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', INVOICED_QNTY: '1.000', UNIT: 'PC'
//         }
//       ]
//     };

//     const memos = mockMemos[customerId] || [];
//     if (memos.length > 0) {
//       return of(memos).pipe(delay(1500)); // Simulate network delay
//     } else {
//       return throwError(() => new Error(`No credit/debit memo data found for customer ID ${customerId} (Mock Data).`));
//     }
//     // --- END MOCK DATA ---
//   }
// }







// // src/app/customer.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, throwError } from 'rxjs';
// import { delay, tap, catchError } from 'rxjs/operators';

// // Existing CustomerProfile interface
// export interface CustomerProfile {
//   KUNNR: string;
//   NAME: string;
//   ADDRESS: string;
//   CITY: string;
//   STREET: string;
//   POSTAL_CODE: string;
// }

// // Existing InquiryData interface
// export interface InquiryData {
//   SALES_DOC_NO: string;
//   CREATION_DATE: string;
//   CUSTOMER_ID: string;
//   SALES_GRP: string;
//   DOC_ITEM: string;
//   MATERIAL_NO: string;
//   DESCRIPTION: string;
//   VRKME: string;
//   MEASUREMENT_UNIT: string;
// }

// // Existing SalesOrderData interface
// export interface SalesOrderData {
//   CUSTOMER_ID: string;
//   DOC_NUM: string;
//   SALES_DOC_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL: string;
//   ITEM_NUM: string;
//   SALES_ORDER_ITEM: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   ISSUE_DATE: string;
// }

// // Existing DeliveryData interface
// export interface DeliveryData {
//   DOC_NUM: string;
//   CREATION_DATE: string;
//   DELIVERY_TYPE: string;
//   DELIVERY_DATE: string;
//   GOODS_ISSUE_DATE: string;
//   RECEIVING_POINT: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   PLANT: string;
//   STORAGE_LOC: string;
//   MATERIAL_ENTERED: string;
// }

// // New interface for Overall Sales Data (based on ZSD_SALESDATA_RT_S)
// export interface OverallSalesData {
//   DOC_NUM: string;
//   DOC_TYPE: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   SALES_UNIT: string;
//   NET_PRICE: string; // Assuming string for currency values
//   NET_VALUE: string; // Assuming string for currency values
//   SD_DOC_CURRENCY: string;
//   COST: string; // Assuming string for currency values
//   LINE_NUM: string;
//   DELIVERY_DATE: string; // Assuming format like 'DD.MM.YYYY'
//   QUANTITY: string;
//   GOODS_ISSUED_DATE: string; // Assuming format like 'DD.MM.YYYY'
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CustomerService {
//   private sapProfileApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_PROFILE_ENDPOINT';
//   private sapInquiryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INQUIRY_ENDPOINT';
//   private sapSalesOrderApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_SALESORDER_ENDPOINT';
//   private sapDeliveryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_DELIVERY_ENDPOINT';
//   // Placeholder for your actual SAP RFC Webservice endpoint for Overall Sales Data
//   private sapOverallSalesApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_OVERALLSALES_ENDPOINT';

//   constructor(private http: HttpClient) { }

//   getCustomerProfile(customerId: string): Observable<CustomerProfile> {
//     console.log(`CustomerService: Fetching profile for customer ID: ${customerId}`);
//     const mockData: { [key: string]: CustomerProfile } = {
//       '11': { KUNNR: '11', NAME: 'NovaByte Corp.', ADDRESS: '688', CITY: 'Mumbai', STREET: '1st Ave', POSTAL_CODE: '400001' },
//       '12': { KUNNR: '12', NAME: 'Global Solutions', ADDRESS: '123', CITY: 'New York', STREET: 'Main St', POSTAL_CODE: '10001' },
//       '1000': { KUNNR: '1000', NAME: 'SAP Demo Customer', ADDRESS: '456', CITY: 'Walldorf', STREET: 'SAP Allee', POSTAL_CODE: '69190' }
//     };
//     const profile = mockData[customerId];
//     if (profile) {
//       return of(profile).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`Customer profile for ID ${customerId} not found (Mock Data).`));
//     }
//   }

//   getCustomerInquiries(customerId: string): Observable<InquiryData[]> {
//     console.log(`CustomerService: Fetching inquiry data for customer ID: ${customerId}`);
//     const mockInquiries: { [key: string]: InquiryData[] } = {
//       '11': [
//         { SALES_DOC_NO: '00000024', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000034', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT002', DESCRIPTION: 'Oreo', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000044', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG2', DOC_ITEM: '000010', MATERIAL_NO: 'MAT003', DESCRIPTION: 'Finished Goods', VRKME: 'IN', MEASUREMENT_UNIT: 'KG' },
//         { SALES_DOC_NO: '70000010', CREATION_DATE: '21.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '291', CREATION_DATE: '25.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG3', DOC_ITEM: '000020', MATERIAL_NO: 'MAT004', DESCRIPTION: 'Sandwich Non Veg', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' }
//       ],
//       '12': [
//         { SALES_DOC_NO: '00000100', CREATION_DATE: '15.04.2025', CUSTOMER_ID: '12', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT005', DESCRIPTION: 'Software License', VRKME: 'EA', MEASUREMENT_UNIT: 'LIC' }
//       ],
//       '1000': [
//         { SALES_DOC_NO: '00000500', CREATION_DATE: '01.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000010', MATERIAL_NO: 'MAT010', DESCRIPTION: 'Consulting Service', VRKME: 'HR', MEASUREMENT_UNIT: 'HR' },
//         { SALES_DOC_NO: '00000501', CREATION_DATE: '05.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000020', MATERIAL_NO: 'MAT011', DESCRIPTION: 'Hardware Purchase', VRKME: 'PC', MEASUREMENT_UNIT: 'PC' }
//       ]
//     };
//     const inquiries = mockInquiries[customerId] || [];
//     if (inquiries.length > 0) {
//       return of(inquiries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No inquiry data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerSalesOrders(customerId: string): Observable<SalesOrderData[]> {
//     console.log(`CustomerService: Fetching sales order data for customer ID: ${customerId}`);
//     const mockSalesOrders: { [key: string]: SalesOrderData[] } = {
//       '11': [
//         { CUSTOMER_ID: '11', DOC_NUM: '20000024', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000034', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Oreo', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000044', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Finished Goods', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '291', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Sandwich Non Veg', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', ISSUE_DATE: '26.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '293', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', ISSUE_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { CUSTOMER_ID: '12', DOC_NUM: '00000150', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Laptop', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', ISSUE_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { CUSTOMER_ID: '1000', DOC_NUM: '00000600', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Server Rack', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', ISSUE_DATE: '05.07.2025' }
//       ]
//     };
//     const salesOrders = mockSalesOrders[customerId] || [];
//     if (salesOrders.length > 0) {
//       return of(salesOrders).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No sales order data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerDeliveries(customerId: string): Observable<DeliveryData[]> {
//     console.log(`CustomerService: Fetching delivery data for customer ID: ${customerId}`);
//     const mockDeliveries: { [key: string]: DeliveryData[] } = {
//       '11': [
//         { DOC_NUM: '00000002', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' },
//         { DOC_NUM: '00000005', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000020', MATERIAL_NUM: 'MAT002', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Oreo' },
//         { DOC_NUM: '00000007', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025', GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT003', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Finished Goods' },
//         { DOC_NUM: '00000018', CREATION_DATE: '19.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '20.05.2025', GOODS_ISSUE_DATE: '20.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT004', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Sandwich Non Veg' },
//         { DOC_NUM: '00000023', CREATION_DATE: '20.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '21.05.2025', GOODS_ISSUE_DATE: '21.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit' }
//       ],
//       '12': [
//         { DOC_NUM: '00000200', CREATION_DATE: '01.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '02.05.2025', GOODS_ISSUE_DATE: '02.05.2025', RECEIVING_POINT: 'Z002', SALES_ORG: '0002', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT005', PLANT: 'Z002', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Laptop' }
//       ],
//       '1000': [
//         { DOC_NUM: '00000700', CREATION_DATE: '05.07.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '06.07.2025', GOODS_ISSUE_DATE: '06.07.2025', RECEIVING_POINT: 'Z005', SALES_ORG: '0005', ITEM_NUM: '000010', MATERIAL_NUM: 'MAT010', PLANT: 'Z005', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Server Rack' }
//       ]
//     };
//     const deliveries = mockDeliveries[customerId] || [];
//     if (deliveries.length > 0) {
//       return of(deliveries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No delivery data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   /**
//    * Fetches overall sales data for a specific customer from SAP.
//    * @param customerId The ID of the customer to fetch sales data for.
//    * @returns An Observable of an array of OverallSalesData.
//    */
//   getOverallSalesData(customerId: string): Observable<OverallSalesData[]> {
//     console.log(`CustomerService: Fetching overall sales data for customer ID: ${customerId}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       CUSTOMER_ID: customerId
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post<OverallSalesData[]>(this.sapOverallSalesApiUrl, payload).pipe(
//       tap(data => console.log('Overall sales data fetched:', data)),
//       catchError(error => {
//         console.error('Error fetching overall sales data:', error);
//         return throwError(() => new Error('Failed to fetch overall sales data from SAP.'));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     const mockOverallSales: { [key: string]: OverallSalesData[] } = {
//       '11': [
//         {
//           DOC_NUM: '20000024', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA',
//           NET_PRICE: '10.00', NET_VALUE: '200.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0',
//           DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025'
//         },
//         {
//           DOC_NUM: '20000034', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA',
//           NET_PRICE: '28.00', NET_VALUE: '112.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0',
//           DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025'
//         },
//         {
//           DOC_NUM: '20000044', DOC_TYPE: 'QT', SALES_ORG: 'Z001', ITEM_NUM: '000010', SALES_UNIT: 'EA',
//           NET_PRICE: '44.90', NET_VALUE: '396.00', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0',
//           DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', GOODS_ISSUED_DATE: '21.05.2025'
//         },
//         {
//           DOC_NUM: '291', DOC_TYPE: 'OR', SALES_ORG: 'Z001', ITEM_NUM: '000020', SALES_UNIT: 'EA',
//           NET_PRICE: '9.77', NET_VALUE: '68.39', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0',
//           DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', GOODS_ISSUED_DATE: '26.05.2025'
//         },
//         {
//           DOC_NUM: '293', DOC_TYPE: 'OR', SALES_ORG: 'Z001', ITEM_NUM: '000020', SALES_UNIT: 'EA',
//           NET_PRICE: '3.45', NET_VALUE: '10.35', SD_DOC_CURRENCY: 'EUR', COST: '0.00', LINE_NUM: '0',
//           DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', GOODS_ISSUED_DATE: '26.05.2025'
//         }
//       ],
//       '12': [
//         {
//           DOC_NUM: '00000150', DOC_TYPE: 'OR', SALES_ORG: 'Z002', ITEM_NUM: '000010', SALES_UNIT: 'PC',
//           NET_PRICE: '1200.00', NET_VALUE: '1200.00', SD_DOC_CURRENCY: 'USD', COST: '800.00', LINE_NUM: '0',
//           DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', GOODS_ISSUED_DATE: '08.05.2025'
//         }
//       ],
//       '1000': [
//         {
//           DOC_NUM: '00000600', DOC_TYPE: 'OR', SALES_ORG: 'Z005', ITEM_NUM: '000010', SALES_UNIT: 'PC',
//           NET_PRICE: '5000.00', NET_VALUE: '10000.00', SD_DOC_CURRENCY: 'USD', COST: '7000.00', LINE_NUM: '0',
//           DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', GOODS_ISSUED_DATE: '05.07.2025'
//         }
//       ]
//     };

//     const salesData = mockOverallSales[customerId] || [];
//     if (salesData.length > 0) {
//       return of(salesData).pipe(delay(1500)); // Simulate network delay
//     } else {
//       return throwError(() => new Error(`No overall sales data found for customer ID ${customerId} (Mock Data).`));
//     }
//     // --- END MOCK DATA ---
//   }
// }







// // src/app/customer.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, throwError } from 'rxjs';
// import { delay, tap, catchError } from 'rxjs/operators';

// // Existing CustomerProfile interface
// export interface CustomerProfile {
//   KUNNR: string;
//   NAME: string;
//   ADDRESS: string;
//   CITY: string;
//   STREET: string;
//   POSTAL_CODE: string;
// }

// // Existing InquiryData interface
// export interface InquiryData {
//   SALES_DOC_NO: string;
//   CREATION_DATE: string;
//   CUSTOMER_ID: string;
//   SALES_GRP: string;
//   DOC_ITEM: string;
//   MATERIAL_NO: string;
//   DESCRIPTION: string;
//   VRKME: string;
//   MEASUREMENT_UNIT: string;
// }

// // Existing SalesOrderData interface
// export interface SalesOrderData {
//   CUSTOMER_ID: string;
//   DOC_NUM: string;
//   SALES_DOC_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL: string;
//   ITEM_NUM: string;
//   SALES_ORDER_ITEM: string;
//   LINE_NUM: string;
//   DELIVERY_DATE: string;
//   QUANTITY: string;
//   ISSUE_DATE: string;
// }

// // New interface for Delivery Data (based on ZSD_DELIVERY_RT_S)
// export interface DeliveryData {
//   DOC_NUM: string;
//   CREATION_DATE: string;
//   DELIVERY_TYPE: string;
//   DELIVERY_DATE: string;
//   GOODS_ISSUE_DATE: string;
//   RECEIVING_POINT: string;
//   SALES_ORG: string;
//   ITEM_NUM: string;
//   MATERIAL_NUM: string;
//   PLANT: string;
//   STORAGE_LOC: string;
//   MATERIAL_ENTERED: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CustomerService {
//   private sapProfileApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_PROFILE_ENDPOINT';
//   private sapInquiryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INQUIRY_ENDPOINT';
//   private sapSalesOrderApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_SALESORDER_ENDPOINT';
//   // Placeholder for your actual SAP RFC Webservice endpoint for Delivery
//   private sapDeliveryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_DELIVERY_ENDPOINT';

//   constructor(private http: HttpClient) { }

//   getCustomerProfile(customerId: string): Observable<CustomerProfile> {
//     console.log(`CustomerService: Fetching profile for customer ID: ${customerId}`);
//     const mockData: { [key: string]: CustomerProfile } = {
//       '11': { KUNNR: '11', NAME: 'NovaByte Corp.', ADDRESS: '688', CITY: 'Mumbai', STREET: '1st Ave', POSTAL_CODE: '400001' },
//       '12': { KUNNR: '12', NAME: 'Global Solutions', ADDRESS: '123', CITY: 'New York', STREET: 'Main St', POSTAL_CODE: '10001' },
//       '1000': { KUNNR: '1000', NAME: 'SAP Demo Customer', ADDRESS: '456', CITY: 'Walldorf', STREET: 'SAP Allee', POSTAL_CODE: '69190' }
//     };
//     const profile = mockData[customerId];
//     if (profile) {
//       return of(profile).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`Customer profile for ID ${customerId} not found (Mock Data).`));
//     }
//   }

//   getCustomerInquiries(customerId: string): Observable<InquiryData[]> {
//     console.log(`CustomerService: Fetching inquiry data for customer ID: ${customerId}`);
//     const mockInquiries: { [key: string]: InquiryData[] } = {
//       '11': [
//         { SALES_DOC_NO: '00000024', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000034', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT002', DESCRIPTION: 'Oreo', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000044', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG2', DOC_ITEM: '000010', MATERIAL_NO: 'MAT003', DESCRIPTION: 'Finished Goods', VRKME: 'IN', MEASUREMENT_UNIT: 'KG' },
//         { SALES_DOC_NO: '70000010', CREATION_DATE: '21.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '291', CREATION_DATE: '25.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG3', DOC_ITEM: '000020', MATERIAL_NO: 'MAT004', DESCRIPTION: 'Sandwich Non Veg', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' }
//       ],
//       '12': [
//         { SALES_DOC_NO: '00000100', CREATION_DATE: '15.04.2025', CUSTOMER_ID: '12', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT005', DESCRIPTION: 'Software License', VRKME: 'EA', MEASUREMENT_UNIT: 'LIC' }
//       ],
//       '1000': [
//         { SALES_DOC_NO: '00000500', CREATION_DATE: '01.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000010', MATERIAL_NO: 'MAT010', DESCRIPTION: 'Consulting Service', VRKME: 'HR', MEASUREMENT_UNIT: 'HR' },
//         { SALES_DOC_NO: '00000501', CREATION_DATE: '05.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000020', MATERIAL_NO: 'MAT011', DESCRIPTION: 'Hardware Purchase', VRKME: 'PC', MEASUREMENT_UNIT: 'PC' }
//       ]
//     };
//     const inquiries = mockInquiries[customerId] || [];
//     if (inquiries.length > 0) {
//       return of(inquiries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No inquiry data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   getCustomerSalesOrders(customerId: string): Observable<SalesOrderData[]> {
//     console.log(`CustomerService: Fetching sales order data for customer ID: ${customerId}`);
//     const mockSalesOrders: { [key: string]: SalesOrderData[] } = {
//       '11': [
//         { CUSTOMER_ID: '11', DOC_NUM: '20000024', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000034', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Oreo', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '20000044', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Finished Goods', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025', QUANTITY: '0.000', ISSUE_DATE: '21.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '291', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Sandwich Non Veg', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '7.000', ISSUE_DATE: '26.05.2025' },
//         { CUSTOMER_ID: '11', DOC_NUM: '293', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025', QUANTITY: '3.000', ISSUE_DATE: '26.05.2025' }
//       ],
//       '12': [
//         { CUSTOMER_ID: '12', DOC_NUM: '00000150', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Laptop', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025', QUANTITY: '1.000', ISSUE_DATE: '08.05.2025' }
//       ],
//       '1000': [
//         { CUSTOMER_ID: '1000', DOC_NUM: '00000600', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01', ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Server Rack', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025', QUANTITY: '2.000', ISSUE_DATE: '05.07.2025' }
//       ]
//     };
//     const salesOrders = mockSalesOrders[customerId] || [];
//     if (salesOrders.length > 0) {
//       return of(salesOrders).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No sales order data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   /**
//    * Fetches delivery data for a specific customer from SAP.
//    * @param customerId The ID of the customer to fetch delivery data for.
//    * @returns An Observable of an array of DeliveryData.
//    */
//   getCustomerDeliveries(customerId: string): Observable<DeliveryData[]> {
//     console.log(`CustomerService: Fetching delivery data for customer ID: ${customerId}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       CUSTOMER_ID: customerId
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post<DeliveryData[]>(this.sapDeliveryApiUrl, payload).pipe(
//       tap(data => console.log('Customer deliveries fetched:', data)),
//       catchError(error => {
//         console.error('Error fetching customer deliveries:', error);
//         return throwError(() => new Error('Failed to fetch customer deliveries from SAP.'));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     const mockDeliveries: { [key: string]: DeliveryData[] } = {
//       '11': [
//         {
//           DOC_NUM: '00000002', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025',
//           GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010',
//           MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit'
//         },
//         {
//           DOC_NUM: '00000005', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025',
//           GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000020',
//           MATERIAL_NUM: 'MAT002', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Oreo'
//         },
//         {
//           DOC_NUM: '00000007', CREATION_DATE: '15.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '16.05.2025',
//           GOODS_ISSUE_DATE: '16.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010',
//           MATERIAL_NUM: 'MAT003', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Finished Goods'
//         },
//         {
//           DOC_NUM: '00000018', CREATION_DATE: '19.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '20.05.2025',
//           GOODS_ISSUE_DATE: '20.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010',
//           MATERIAL_NUM: 'MAT004', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Sandwich Non Veg'
//         },
//         {
//           DOC_NUM: '00000023', CREATION_DATE: '20.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '21.05.2025',
//           GOODS_ISSUE_DATE: '21.05.2025', RECEIVING_POINT: 'Z001', SALES_ORG: '0001', ITEM_NUM: '000010',
//           MATERIAL_NUM: 'MAT001', PLANT: 'Z001', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Biscuit'
//         }
//       ],
//       '12': [
//         {
//           DOC_NUM: '00000200', CREATION_DATE: '01.05.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '02.05.2025',
//           GOODS_ISSUE_DATE: '02.05.2025', RECEIVING_POINT: 'Z002', SALES_ORG: '0002', ITEM_NUM: '000010',
//           MATERIAL_NUM: 'MAT005', PLANT: 'Z002', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Laptop'
//         }
//       ],
//       '1000': [
//         {
//           DOC_NUM: '00000700', CREATION_DATE: '05.07.2025', DELIVERY_TYPE: 'LF', DELIVERY_DATE: '06.07.2025',
//           GOODS_ISSUE_DATE: '06.07.2025', RECEIVING_POINT: 'Z005', SALES_ORG: '0005', ITEM_NUM: '000010',
//           MATERIAL_NUM: 'MAT010', PLANT: 'Z005', STORAGE_LOC: '0001', MATERIAL_ENTERED: 'Server Rack'
//         }
//       ]
//     };

//     const deliveries = mockDeliveries[customerId] || [];
//     if (deliveries.length > 0) {
//       return of(deliveries).pipe(delay(1500)); // Simulate network delay
//     } else {
//       return throwError(() => new Error(`No delivery data found for customer ID ${customerId} (Mock Data).`));
//     }
//     // --- END MOCK DATA ---
//   }
// }









// // src/app/customer.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of, throwError } from 'rxjs';
// import { delay, tap, catchError } from 'rxjs/operators';

// // Existing CustomerProfile interface
// export interface CustomerProfile {
//   KUNNR: string;
//   NAME: string;
//   ADDRESS: string;
//   CITY: string;
//   STREET: string;
//   POSTAL_CODE: string;
// }

// // Existing InquiryData interface
// export interface InquiryData {
//   SALES_DOC_NO: string;
//   CREATION_DATE: string;
//   CUSTOMER_ID: string;
//   SALES_GRP: string;
//   DOC_ITEM: string;
//   MATERIAL_NO: string;
//   DESCRIPTION: string;
//   VRKME: string;
//   MEASUREMENT_UNIT: string;
// }

// // New interface for Sales Order Data (based on ZSD_SALESORDER_RT_S)
// export interface SalesOrderData {
//   CUSTOMER_ID: string;
//   DOC_NUM: string;
//   SALES_DOC_TYPE: string;
//   SALES_ORG: string;
//   DISTRIBUTION_CHANNEL: string;
//   ITEM_NUM: string;
//   SALES_ORDER_ITEM: string; // Short text for sales order item
//   LINE_NUM: string;
//   DELIVERY_DATE: string; // Assuming format like 'DD.MM.YYYY'
//   QUANTITY: string; // Assuming it comes as a string, can parse to number if needed
//   ISSUE_DATE: string; // Assuming format like 'DD.MM.YYYY'
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CustomerService {
//   private sapProfileApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_PROFILE_ENDPOINT';
//   private sapInquiryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INQUIRY_ENDPOINT';
//   // Placeholder for your actual SAP RFC Webservice endpoint for Sales Order
//   private sapSalesOrderApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_SALESORDER_ENDPOINT';

//   constructor(private http: HttpClient) { }

//   getCustomerProfile(customerId: string): Observable<CustomerProfile> {
//     console.log(`CustomerService: Fetching profile for customer ID: ${customerId}`);
//     const mockData: { [key: string]: CustomerProfile } = {
//       '11': { KUNNR: '11', NAME: 'NovaByte Corp.', ADDRESS: '688', CITY: 'Mumbai', STREET: '1st Ave', POSTAL_CODE: '400001' },
//       '12': { KUNNR: '12', NAME: 'Global Solutions', ADDRESS: '123', CITY: 'New York', STREET: 'Main St', POSTAL_CODE: '10001' },
//       '1000': { KUNNR: '1000', NAME: 'SAP Demo Customer', ADDRESS: '456', CITY: 'Walldorf', STREET: 'SAP Allee', POSTAL_CODE: '69190' }
//     };
//     const profile = mockData[customerId];
//     if (profile) {
//       return of(profile).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`Customer profile for ID ${customerId} not found (Mock Data).`));
//     }
//   }

//   getCustomerInquiries(customerId: string): Observable<InquiryData[]> {
//     console.log(`CustomerService: Fetching inquiry data for customer ID: ${customerId}`);
//     const mockInquiries: { [key: string]: InquiryData[] } = {
//       '11': [
//         { SALES_DOC_NO: '00000024', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000034', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT002', DESCRIPTION: 'Oreo', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '00000044', CREATION_DATE: '20.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG2', DOC_ITEM: '000010', MATERIAL_NO: 'MAT003', DESCRIPTION: 'Finished Goods', VRKME: 'IN', MEASUREMENT_UNIT: 'KG' },
//         { SALES_DOC_NO: '70000010', CREATION_DATE: '21.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT001', DESCRIPTION: 'Biscuit', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' },
//         { SALES_DOC_NO: '291', CREATION_DATE: '25.05.2025', CUSTOMER_ID: '11', SALES_GRP: 'SG3', DOC_ITEM: '000020', MATERIAL_NO: 'MAT004', DESCRIPTION: 'Sandwich Non Veg', VRKME: 'EA', MEASUREMENT_UNIT: 'PC' }
//       ],
//       '12': [
//         { SALES_DOC_NO: '00000100', CREATION_DATE: '15.04.2025', CUSTOMER_ID: '12', SALES_GRP: 'SG1', DOC_ITEM: '000010', MATERIAL_NO: 'MAT005', DESCRIPTION: 'Software License', VRKME: 'EA', MEASUREMENT_UNIT: 'LIC' }
//       ],
//       '1000': [
//         { SALES_DOC_NO: '00000500', CREATION_DATE: '01.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000010', MATERIAL_NO: 'MAT010', DESCRIPTION: 'Consulting Service', VRKME: 'HR', MEASUREMENT_UNIT: 'HR' },
//         { SALES_DOC_NO: '00000501', CREATION_DATE: '05.06.2025', CUSTOMER_ID: '1000', SALES_GRP: 'SG5', DOC_ITEM: '000020', MATERIAL_NO: 'MAT011', DESCRIPTION: 'Hardware Purchase', VRKME: 'PC', MEASUREMENT_UNIT: 'PC' }
//       ]
//     };
//     const inquiries = mockInquiries[customerId] || [];
//     if (inquiries.length > 0) {
//       return of(inquiries).pipe(delay(1500));
//     } else {
//       return throwError(() => new Error(`No inquiry data found for customer ID ${customerId} (Mock Data).`));
//     }
//   }

//   /**
//    * Fetches sales order data for a specific customer from SAP.
//    * @param customerId The ID of the customer to fetch sales order data for.
//    * @returns An Observable of an array of SalesOrderData.
//    */
//   getCustomerSalesOrders(customerId: string): Observable<SalesOrderData[]> {
//     console.log(`CustomerService: Fetching sales order data for customer ID: ${customerId}`);

//     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
//     /*
//     const payload = {
//       CUSTOMER_ID: customerId
//       // Add any other required parameters for your RFC Webservice call
//     };
//     return this.http.post<SalesOrderData[]>(this.sapSalesOrderApiUrl, payload).pipe(
//       tap(data => console.log('Customer sales orders fetched:', data)),
//       catchError(error => {
//         console.error('Error fetching customer sales orders:', error);
//         return throwError(() => new Error('Failed to fetch customer sales orders from SAP.'));
//       })
//     );
//     */

//     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
//     const mockSalesOrders: { [key: string]: SalesOrderData[] } = {
//       '11': [
//         {
//           CUSTOMER_ID: '11', DOC_NUM: '20000024', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01',
//           ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025',
//           QUANTITY: '0.000', ISSUE_DATE: '21.05.2025'
//         },
//         {
//           CUSTOMER_ID: '11', DOC_NUM: '20000034', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01',
//           ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Oreo', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025',
//           QUANTITY: '0.000', ISSUE_DATE: '21.05.2025'
//         },
//         {
//           CUSTOMER_ID: '11', DOC_NUM: '20000044', SALES_DOC_TYPE: 'QT', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01',
//           ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Finished Goods', LINE_NUM: '0', DELIVERY_DATE: '20.05.2025',
//           QUANTITY: '0.000', ISSUE_DATE: '21.05.2025'
//         },
//         {
//           CUSTOMER_ID: '11', DOC_NUM: '291', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01',
//           ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Sandwich Non Veg', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025',
//           QUANTITY: '7.000', ISSUE_DATE: '26.05.2025'
//         },
//         {
//           CUSTOMER_ID: '11', DOC_NUM: '293', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z001', DISTRIBUTION_CHANNEL: '01',
//           ITEM_NUM: '000020', SALES_ORDER_ITEM: 'Biscuit', LINE_NUM: '0', DELIVERY_DATE: '26.05.2025',
//           QUANTITY: '3.000', ISSUE_DATE: '26.05.2025'
//         }
//       ],
//       '12': [
//         {
//           CUSTOMER_ID: '12', DOC_NUM: '00000150', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z002', DISTRIBUTION_CHANNEL: '02',
//           ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Laptop', LINE_NUM: '0', DELIVERY_DATE: '10.05.2025',
//           QUANTITY: '1.000', ISSUE_DATE: '08.05.2025'
//         }
//       ],
//       '1000': [
//         {
//           CUSTOMER_ID: '1000', DOC_NUM: '00000600', SALES_DOC_TYPE: 'OR', SALES_ORG: 'Z005', DISTRIBUTION_CHANNEL: '01',
//           ITEM_NUM: '000010', SALES_ORDER_ITEM: 'Server Rack', LINE_NUM: '0', DELIVERY_DATE: '10.07.2025',
//           QUANTITY: '2.000', ISSUE_DATE: '05.07.2025'
//         }
//       ]
//     };

//     const salesOrders = mockSalesOrders[customerId] || [];
//     if (salesOrders.length > 0) {
//       return of(salesOrders).pipe(delay(1500)); // Simulate network delay
//     } else {
//       return throwError(() => new Error(`No sales order data found for customer ID ${customerId} (Mock Data).`));
//     }
//     // --- END MOCK DATA ---
//   }
// }







// // import { Injectable } from '@angular/core';
// // import { HttpClient } from '@angular/common/http';
// // import { Observable, of, throwError } from 'rxjs';
// // import { delay, tap, catchError } from 'rxjs/operators';

// // // Existing CustomerProfile interface
// // export interface CustomerProfile {
// //   KUNNR: string;
// //   NAME: string;
// //   ADDRESS: string;
// //   CITY: string;
// //   STREET: string;
// //   POSTAL_CODE: string;
// // }

// // // New interface for Inquiry Data (based on ZSD_INQUIRY_RT_S)
// // export interface InquiryData {
// //   SALES_DOC_NO: string;
// //   CREATION_DATE: string; // Assuming format like 'DD.MM.YYYY'
// //   CUSTOMER_ID: string;
// //   SALES_GRP: string;
// //   DOC_ITEM: string;
// //   MATERIAL_NO: string;
// //   DESCRIPTION: string;
// //   VRKME: string;
// //   MEASUREMENT_UNIT: string;
// // }

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class CustomerService {
// //   private sapProfileApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_PROFILE_ENDPOINT';
// //   // Placeholder for your actual SAP RFC Webservice endpoint for Inquiry
// //   private sapInquiryApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_INQUIRY_ENDPOINT';

// //   constructor(private http: HttpClient) { }

// //   getCustomerProfile(customerId: string): Observable<CustomerProfile> {
// //     console.log(`CustomerService: Fetching profile for customer ID: ${customerId}`);
// //     // ... (existing mock data or real API call for profile) ...
// //     const mockData: { [key: string]: CustomerProfile } = {
// //       '11': {
// //         KUNNR: '11',
// //         NAME: 'NovaByte Corp.',
// //         ADDRESS: '688',
// //         CITY: 'Mumbai',
// //         STREET: '1st Ave',
// //         POSTAL_CODE: '400001'
// //       },
// //       '12': {
// //         KUNNR: '12',
// //         NAME: 'Global Solutions',
// //         ADDRESS: '123',
// //         CITY: 'New York',
// //         STREET: 'Main St',
// //         POSTAL_CODE: '10001'
// //       },
// //       '1000': {
// //         KUNNR: '1000',
// //         NAME: 'SAP Demo Customer',
// //         ADDRESS: '456',
// //         CITY: 'Walldorf',
// //         STREET: 'SAP Allee',
// //         POSTAL_CODE: '69190'
// //       }
// //     };

// //     const profile = mockData[customerId];
// //     if (profile) {
// //       return of(profile).pipe(delay(1500));
// //     } else {
// //       return throwError(() => new Error(`Customer profile for ID ${customerId} not found (Mock Data).`));
// //     }
// //   }

// //   /**
// //    * Fetches inquiry data for a specific customer from SAP.
// //    * @param customerId The ID of the customer to fetch inquiry data for.
// //    * @returns An Observable of an array of InquiryData.
// //    */
// //   getCustomerInquiries(customerId: string): Observable<InquiryData[]> {
// //     console.log(`CustomerService: Fetching inquiry data for customer ID: ${customerId}`);

// //     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
// //     /*
// //     const payload = {
// //       CUSTOMER_ID: customerId
// //       // Add any other required parameters for your RFC Webservice call
// //     };
// //     return this.http.post<InquiryData[]>(this.sapInquiryApiUrl, payload).pipe(
// //       tap(data => console.log('Customer inquiries fetched:', data)),
// //       catchError(error => {
// //         console.error('Error fetching customer inquiries:', error);
// //         return throwError(() => new Error('Failed to fetch customer inquiries from SAP.'));
// //       })
// //     );
// //     */

// //     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
// //     // This simulates an API call returning inquiry data.
// //     const mockInquiries: { [key: string]: InquiryData[] } = {
// //       '11': [
// //         {
// //           SALES_DOC_NO: '00000024',
// //           CREATION_DATE: '20.05.2025',
// //           CUSTOMER_ID: '11',
// //           SALES_GRP: 'SG1',
// //           DOC_ITEM: '000010',
// //           MATERIAL_NO: 'MAT001',
// //           DESCRIPTION: 'Biscuit',
// //           VRKME: 'EA',
// //           MEASUREMENT_UNIT: 'PC'
// //         },
// //         {
// //           SALES_DOC_NO: '00000034',
// //           CREATION_DATE: '20.05.2025',
// //           CUSTOMER_ID: '11',
// //           SALES_GRP: 'SG1',
// //           DOC_ITEM: '000010',
// //           MATERIAL_NO: 'MAT002',
// //           DESCRIPTION: 'Oreo',
// //           VRKME: 'EA',
// //           MEASUREMENT_UNIT: 'PC'
// //         },
// //         {
// //           SALES_DOC_NO: '00000044',
// //           CREATION_DATE: '20.05.2025',
// //           CUSTOMER_ID: '11',
// //           SALES_GRP: 'SG2',
// //           DOC_ITEM: '000010',
// //           MATERIAL_NO: 'MAT003',
// //           DESCRIPTION: 'Finished Goods',
// //           VRKME: 'IN',
// //           MEASUREMENT_UNIT: 'KG'
// //         },
// //         {
// //           SALES_DOC_NO: '70000010',
// //           CREATION_DATE: '21.05.2025',
// //           CUSTOMER_ID: '11',
// //           SALES_GRP: 'SG1',
// //           DOC_ITEM: '000010',
// //           MATERIAL_NO: 'MAT001',
// //           DESCRIPTION: 'Biscuit',
// //           VRKME: 'EA',
// //           MEASUREMENT_UNIT: 'PC'
// //         },
// //         {
// //           SALES_DOC_NO: '291',
// //           CREATION_DATE: '25.05.2025',
// //           CUSTOMER_ID: '11',
// //           SALES_GRP: 'SG3',
// //           DOC_ITEM: '000020',
// //           MATERIAL_NO: 'MAT004',
// //           DESCRIPTION: 'Sandwich Non Veg',
// //           VRKME: 'EA',
// //           MEASUREMENT_UNIT: 'PC'
// //         }
// //       ],
// //       '12': [
// //         {
// //           SALES_DOC_NO: '00000100',
// //           CREATION_DATE: '15.04.2025',
// //           CUSTOMER_ID: '12',
// //           SALES_GRP: 'SG1',
// //           DOC_ITEM: '000010',
// //           MATERIAL_NO: 'MAT005',
// //           DESCRIPTION: 'Software License',
// //           VRKME: 'EA',
// //           MEASUREMENT_UNIT: 'LIC'
// //         }
// //       ],
// //       '1000': [
// //         {
// //           SALES_DOC_NO: '00000500',
// //           CREATION_DATE: '01.06.2025',
// //           CUSTOMER_ID: '1000',
// //           SALES_GRP: 'SG5',
// //           DOC_ITEM: '000010',
// //           MATERIAL_NO: 'MAT010',
// //           DESCRIPTION: 'Consulting Service',
// //           VRKME: 'HR',
// //           MEASUREMENT_UNIT: 'HR'
// //         },
// //         {
// //           SALES_DOC_NO: '00000501',
// //           CREATION_DATE: '05.06.2025',
// //           CUSTOMER_ID: '1000',
// //           SALES_GRP: 'SG5',
// //           DOC_ITEM: '000020',
// //           MATERIAL_NO: 'MAT011',
// //           DESCRIPTION: 'Hardware Purchase',
// //           VRKME: 'PC',
// //           MEASUREMENT_UNIT: 'PC'
// //         }
// //       ]
// //     };

// //     const inquiries = mockInquiries[customerId] || [];
// //     if (inquiries.length > 0) {
// //       return of(inquiries).pipe(delay(1500)); // Simulate network delay
// //     } else {
// //       return throwError(() => new Error(`No inquiry data found for customer ID ${customerId} (Mock Data).`));
// //     }
// //     // --- END MOCK DATA ---
// //   }
// // }





// // // import { Injectable } from '@angular/core';
// // // import { HttpClient } from '@angular/common/http';
// // // import { Observable, of, throwError } from 'rxjs';
// // // import { delay, tap, catchError } from 'rxjs/operators';

// // // // Define the interface for your customer profile data based on ZSD_PROFILE_RT_S
// // // export interface CustomerProfile {
// // //   KUNNR: string;        // Customer Number
// // //   NAME: string;         // Name 1
// // //   ADDRESS: string;      // Address (as per your SAP structure, though often longer)
// // //   CITY: string;         // City
// // //   STREET: string;       // Street and House Number
// // //   POSTAL_CODE: string;  // Postal Code
// // // }

// // // @Injectable({
// // //   providedIn: 'root'
// // // })
// // // export class CustomerService {
// // //   // Placeholder for your actual SAP RFC Webservice endpoint
// // //   // Replace with your actual endpoint that exposes the customer profile FM
// // //   private sapProfileApiUrl = 'YOUR_SAP_RFC_WEBSERVICE_PROFILE_ENDPOINT';

// // //   constructor(private http: HttpClient) { }

// // //   /**
// // //    * Fetches customer profile details from SAP.
// // //    * @param customerId The ID of the customer to fetch details for.
// // //    * @returns An Observable of CustomerProfile data.
// // //    */
// // //   getCustomerProfile(customerId: string): Observable<CustomerProfile> {
// // //     console.log(`CustomerService: Fetching profile for customer ID: ${customerId}`);

// // //     // --- REAL API CALL (Uncomment and replace with your actual logic) ---
// // //     /*
// // //     const payload = {
// // //       CUSTOMER_ID: customerId
// // //       // Add any other required parameters for your RFC Webservice call
// // //     };
// // //     return this.http.post<CustomerProfile>(this.sapProfileApiUrl, payload).pipe(
// // //       tap(data => console.log('Customer profile fetched:', data)),
// // //       catchError(error => {
// // //         console.error('Error fetching customer profile:', error);
// // //         return throwError(() => new Error('Failed to fetch customer profile from SAP.'));
// // //       })
// // //     );
// // //     */

// // //     // --- MOCK DATA FOR DEMONSTRATION (REMOVE IN PRODUCTION) ---
// // //     // This simulates an API call returning data based on the customerId.
// // //     const mockData: { [key: string]: CustomerProfile } = {
// // //       '11': {
// // //         KUNNR: '11',
// // //         NAME: 'NovaByte Corp.',
// // //         ADDRESS: '688', // As per your screenshot, this is short, likely an internal ID
// // //         CITY: 'Mumbai',
// // //         STREET: '1st Ave',
// // //         POSTAL_CODE: '400001'
// // //       },
// // //       '12': {
// // //         KUNNR: '12',
// // //         NAME: 'Global Solutions',
// // //         ADDRESS: '123',
// // //         CITY: 'New York',
// // //         STREET: 'Main St',
// // //         POSTAL_CODE: '10001'
// // //       },
// // //       '1000': { // Example for a common SAP customer ID
// // //         KUNNR: '1000',
// // //         NAME: 'SAP Demo Customer',
// // //         ADDRESS: '456',
// // //         CITY: 'Walldorf',
// // //         STREET: 'SAP Allee',
// // //         POSTAL_CODE: '69190'
// // //       }
// // //     };

// // //     const profile = mockData[customerId];
// // //     if (profile) {
// // //       return of(profile).pipe(delay(1500)); // Simulate network delay
// // //     } else {
// // //       return throwError(() => new Error(`Customer profile for ID ${customerId} not found (Mock Data).`));
// // //     }
// // //     // --- END MOCK DATA ---
// // //   }
// // // }

