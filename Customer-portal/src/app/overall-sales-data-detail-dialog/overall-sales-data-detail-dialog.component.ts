// src/app/overall-sales-data-detail-dialog/overall-sales-data-detail-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { OverallSalesData } from '../customer.service'; // Import the OverallSalesData interface

@Component({
  selector: 'app-overall-sales-data-detail-dialog',
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
        <mat-card-title>Overall Sales Details</mat-card-title>
        <button mat-icon-button (click)="onClose()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content class="dialog-content">
        <div class="detail-grid">
          <div class="label">Sales Document No:</div><div class="value">{{ data.DOC_NUM }}</div>
          <div class="label">Document Type:</div><div class="value">{{ data.DOC_TYPE }}</div>
          <div class="label">Sales Organization:</div><div class="value">{{ data.SALES_ORG }}</div>
          <div class="label">Item Number:</div><div class="value">{{ data.ITEM_NUM }}</div>
          <div class="label">Sales Unit:</div><div class="value">{{ data.SALES_UNIT }}</div>
          <div class="label">Net Price:</div><div class="value">{{ data.NET_PRICE }}</div>
          <div class="label">Net Value:</div><div class="value">{{ data.NET_VALUE }}</div>
          <div class="label">Document Currency:</div><div class="value">{{ data.SD_DOC_CURRENCY }}</div>
          <div class="label">Cost:</div><div class="value">{{ data.COST }}</div>
          <div class="label">Line Number:</div><div class="value">{{ data.LINE_NUM }}</div>
          <div class="label">Delivery Date:</div><div class="value">{{ data.DELIVERY_DATE }}</div>
          <div class="label">Quantity:</div><div class="value">{{ data.QUANTITY }}</div>
          <div class="label">Goods Issued Date:</div><div class="value">{{ data.GOODS_ISSUED_DATE }}</div>
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
export class OverallSalesDataDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OverallSalesDataDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OverallSalesData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}












// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-overall-sales-data-detail-dialog',
//   imports: [],
//   templateUrl: './overall-sales-data-detail-dialog.component.html',
//   styleUrl: './overall-sales-data-detail-dialog.component.scss'
// })
// export class OverallSalesDataDetailDialogComponent {

// }
