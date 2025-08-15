import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './layout/layout.component';
import { ProfileComponent } from './profile/profile.component';
import { RequestForQuotationComponent } from './request-for-quotation/request-for-quotation.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { GoodsReceiptComponent } from './goods-receipt/goods-receipt.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { PaymentsAndAgeingComponent } from './payments-and-ageing/payments-and-ageing.component';
import { CreditDebitMemoComponent } from './credit-debit-memo/credit-debit-memo.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent }
    ]
  },
  {
    path: 'profile',
    component: LayoutComponent,
    children: [
      { path: '', component: ProfileComponent }
    ]
  },
  {
    path: 'request-for-quotation',
    component: LayoutComponent,
    children: [
      { path: '', component: RequestForQuotationComponent }
    ]
  },
  {
    path: 'purchase-order',
    component: LayoutComponent,
    children: [
      { path: '', component: PurchaseOrderComponent }
    ]
  },
  {
    path: 'goods-receipt',
    component: LayoutComponent,
    children: [
      { path: '', component: GoodsReceiptComponent }
    ]
  },
  {
    path: 'invoice-details',
    component: LayoutComponent,
    children: [
      { path: '', component: InvoiceDetailsComponent }
    ]
  },
  {
    path: 'payments-and-ageing',
    component: LayoutComponent,
    children: [
      { path: '', component: PaymentsAndAgeingComponent }
    ]
  },
  {
    path: 'credit-debit-memo',
    component: LayoutComponent,
    children: [
      { path: '', component: CreditDebitMemoComponent }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];















// import { Routes } from '@angular/router';

// export const routes: Routes = [];
