// src/app/inquiry-detail-dialog/inquiry-detail-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'; // For dialog functionality
import { MatButtonModule } from '@angular/material/button'; // For the close button
import { MatIconModule } from '@angular/material/icon'; // For icons in dialog
import { MatCardModule } from '@angular/material/card'; // Optional: for better styling within dialog

import { InquiryData } from '../customer.service'; // Import the InquiryData interface

@Component({
  selector: 'app-inquiry-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule // Use MatCard for a structured look inside the dialog
  ],
  template: `
    <mat-card class="dialog-card">
      <mat-card-header class="dialog-header">
        <mat-card-title>Inquiry Details</mat-card-title>
        <button mat-icon-button (click)="onClose()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content class="dialog-content">
        <div class="detail-grid">
          <div class="label">Sales Document No:</div><div class="value">{{ data.SALES_DOC_NO }}</div>
          <div class="label">Creation Date:</div><div class="value">{{ data.CREATION_DATE }}</div>
          <div class="label">Customer ID:</div><div class="value">{{ data.CUSTOMER_ID }}</div>
          <div class="label">Sales Group:</div><div class="value">{{ data.SALES_GRP }}</div>
          <div class="label">Document Item:</div><div class="value">{{ data.DOC_ITEM }}</div>
          <div class="label">Material No:</div><div class="value">{{ data.MATERIAL_NO }}</div>
          <div class="label">Description:</div><div class="value">{{ data.DESCRIPTION }}</div>
          <div class="label">Sales Unit:</div><div class="value">{{ data.VRKME }}</div>
          <div class="label">Measurement Unit:</div><div class="value">{{ data.MEASUREMENT_UNIT }}</div>
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
      box-shadow: none; /* Dialogs usually don't need extra shadow */
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
      grid-template-columns: auto 1fr; /* Label takes content width, value takes rest */
      gap: 10px 15px;
      text-align: left;
    }
    .label {
      font-weight: 600;
      color: #3f51b5; /* A strong color for labels */
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
export class InquiryDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InquiryDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InquiryData // Inject the data passed to the dialog
  ) {}

  onClose(): void {
    this.dialogRef.close(); // Close the dialog
  }
}











// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-inquiry-detail-dialog',
//   imports: [],
//   templateUrl: './inquiry-detail-dialog.component.html',
//   styleUrl: './inquiry-detail-dialog.component.scss'
// })
// export class InquiryDetailDialogComponent {

// }
