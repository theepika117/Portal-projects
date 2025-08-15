// src/app/credit-debit-memo-detail-dialog/credit-debit-memo-detail-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { CreditDebitMemoData } from '../customer.service'; // Import the CreditDebitMemoData interface

@Component({
  selector: 'app-credit-debit-memo-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <mat-card class="dialog-card">
      <mat-card-header class="dialog-header">
        <mat-card-title>Credit/Debit Memo Details</mat-card-title>
        <button mat-icon-button (click)="onClose()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content class="dialog-content">
        <div class="detail-grid">
          <div class="label">Document Number:</div><div class="value">{{ data.DocNum }}</div>
          <div class="label">Sold-to Party:</div><div class="value">{{ data.SoldToParty }}</div>
          <div class="label">Billing Date:</div><div class="value">{{ data.BillingDate }}</div>
          <div class="label">Billing Type:</div><div class="value">{{ data.BillingType }}</div>
          <div class="label">Division:</div><div class="value">{{ data.Division }}</div>
          <div class="label">Terms of Payment:</div><div class="value">{{ data.Terms }}</div>
          <div class="label">Reference Doc No:</div><div class="value">{{ data.RefDocNum }}</div>
          <div class="label">Assignment No:</div><div class="value">{{ data.AssignmentNum }}</div>
          <div class="label">Item Number:</div><div class="value">{{ data.ItemNum }}</div>
          <div class="label">Material Number:</div><div class="value">{{ data.MaterialNum }}</div>
          <div class="label">Invoiced Quantity:</div><div class="value">{{ data.InvoicedQnty }} {{ data.Unit }}</div>
        </div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-raised-button color="primary" (click)="onClose()">Close</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .dialog-card {
      padding: 20px;
      border-radius: 10px;
      box-shadow: none;
      background-color: white;
      min-width: 300px;
      max-width: 600px;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .dialog-header mat-card-title {
      font-size: 1.5em;
      color: #00796b;
    }
    .dialog-content {
      padding: 0;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 10px 15px;
      text-align: left;
    }
    .label {
      font-weight: 600;
      color: #3f51b5;
    }
    .value {
      color: #555;
      word-wrap: break-word;
    }
    mat-card-actions {
      padding-top: 20px;
      border-top: 1px solid #eee;
      margin-top: 20px;
    }
  `]
})
export class CreditDebitMemoDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CreditDebitMemoDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreditDebitMemoData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}














// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-credit-debit-memo-detail-dialog',
//   imports: [],
//   templateUrl: './credit-debit-memo-detail-dialog.component.html',
//   styleUrl: './credit-debit-memo-detail-dialog.component.scss'
// })
// export class CreditDebitMemoDetailDialogComponent {

// }
