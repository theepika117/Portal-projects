// src/app/payments-aging-detail-dialog/payments-aging-detail-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { AgingData } from '../customer.service'; // Import the AgingData interface

@Component({
  selector: 'app-payments-aging-detail-dialog',
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
        <mat-card-title>Aging Details</mat-card-title>
        <button mat-icon-button (click)="onClose()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content class="dialog-content">
        <div class="detail-grid">
          <div class="label">Partner Function:</div><div class="value">{{ data.FUNC_CODE }}</div>
          <div class="label">Document Number:</div><div class="value">{{ data.DOC_NUM }}</div>
          <div class="label">Billing Date:</div><div class="value">{{ data.BILLING_DATE }}</div>
          <div class="label">Net Amount:</div><div class="value">{{ data.NET_AMT }} {{ data.SD_DOC_CURRENCY }}</div>
          <!-- If Due Date was available, you'd calculate and display aging here -->
          <!-- <div class="label">Due Date:</div><div class="value">{{ data.DUE_DATE }}</div> -->
          <!-- <div class="label">Aging Days:</div><div class="value">{{ calculateAgingDays(data.BILLING_DATE, data.DUE_DATE) }}</div> -->
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
export class PaymentsAgingDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentsAgingDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AgingData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  // Example function to calculate aging days if Due Date was available
  // calculateAgingDays(billingDateStr: string, dueDateStr: string): number | string {
  //   const billingDate = new Date(billingDateStr.split('.').reverse().join('-'));
  //   const dueDate = new Date(dueDateStr.split('.').reverse().join('-'));
  //   if (isNaN(billingDate.getTime()) || isNaN(dueDate.getTime())) {
  //     return 'N/A';
  //   }
  //   const diffTime = Math.abs(billingDate.getTime() - dueDate.getTime());
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   return diffDays;
  // }
}












// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-payments-aging-detail-dialog',
//   imports: [],
//   templateUrl: './payments-aging-detail-dialog.component.html',
//   styleUrl: './payments-aging-detail-dialog.component.scss'
// })
// export class PaymentsAgingDetailDialogComponent {

// }
