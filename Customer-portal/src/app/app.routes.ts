// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component'; 
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { CustomerFinancialSheetComponent } from './customer-financial-sheet/customer-financial-sheet.component'; 
import { InquiryDataComponent } from './inquiry-data/inquiry-data.component'; 
import { SalesOrderDataComponent } from './sales-order-data/sales-order-data.component'; 
import { ListOfDeliveryComponent } from './list-of-delivery/list-of-delivery.component'; 
import { InvoiceDetailsPageComponent } from './invoice-details-page/invoice-details-page.component'; // New
import { PaymentsAgingPageComponent } from './payments-aging-page/payments-aging-page.component'; // New
import { CreditDebitMemoPageComponent } from './credit-debit-memo-page/credit-debit-memo-page.component'; // New
import { OverallSalesDataPageComponent } from './overall-sales-data-page/overall-sales-data-page.component'; // New

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent }, 
  { path: 'customer-dashboard', component: CustomerDashboardComponent }, 
  { path: 'customer-financial-sheets', component: CustomerFinancialSheetComponent }, 
  { path: 'inquiry-data', component: InquiryDataComponent }, 
  { path: 'sales-order-data', component: SalesOrderDataComponent }, 
  { path: 'list-of-delivery', component: ListOfDeliveryComponent }, 
  { path: 'invoice-details', component: InvoiceDetailsPageComponent }, // New route
  { path: 'payments-aging', component: PaymentsAgingPageComponent }, // New route
  { path: 'credit-debit-memo', component: CreditDebitMemoPageComponent }, // New route
  { path: 'overall-sales-data', component: OverallSalesDataPageComponent }, // New route
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
