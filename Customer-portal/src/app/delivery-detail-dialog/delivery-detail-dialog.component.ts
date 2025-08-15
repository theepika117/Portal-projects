// src/app/delivery-detail-dialog/delivery-detail-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { DeliveryData } from '../customer.service'; // Import the DeliveryData interface

@Component({
  selector: 'app-delivery-detail-dialog',
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
        <mat-card-title>Delivery Details</mat-card-title>
        <button mat-icon-button (click)="onClose()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content class="dialog-content">
        <div class="detail-grid">
          <div class="label">Document Number:</div><div class="value">{{ data.DocNum }}</div>
          <div class="label">Creation Date:</div><div class="value">{{ data.CreationDate }}</div>
          <div class="label">Delivery Type:</div><div class="value">{{ data.DeliveryType }}</div>
          <div class="label">Delivery Date:</div><div class="value">{{ data.DeliveryDate }}</div>
          <div class="label">Goods Issue Date:</div><div class="value">{{ data.GoodsIssueDate }}</div>
          <div class="label">Receiving Point:</div><div class="value">{{ data.ReceivingPoint }}</div>
          <div class="label">Sales Organization:</div><div class="value">{{ data.SalesOrg }}</div>
          <div class="label">Item Number:</div><div class="value">{{ data.ItemNum }}</div>
          <div class="label">Material Number:</div><div class="value">{{ data.MaterialNum }}</div>
          <div class="label">Plant:</div><div class="value">{{ data.Plant }}</div>
          <div class="label">Storage Location:</div><div class="value">{{ data.StorageLoc }}</div>
          <div class="label">Material Entered:</div><div class="value">{{ data.MaterialEntered }}</div>
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
export class DeliveryDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeliveryDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeliveryData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
