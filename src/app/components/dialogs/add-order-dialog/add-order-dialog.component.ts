import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Product, ProductService } from '../../../services/product/product.service';
import { OrderItem } from '../../../services/order/order.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-add-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatTableModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-order-dialog.component.html',
  styleUrl: './add-order-dialog.component.scss'
})
export class AddOrderDialogComponent implements OnInit {
  orderForm: FormGroup;
  availableProducts: Product[] = [];
  selectedProducts: OrderItem[] = [];
  displayedColumns: string[] = ['product', 'quantity', 'unitPrice', 'total', 'actions'];
  orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];
  totalOrderValue = 0;

  constructor(
    private dialogRef: MatDialogRef<AddOrderDialogComponent>,
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required]],
      customerEmail: ['', [Validators.required, Validators.email]],
      status: ['pending', [Validators.required]],
      productId: [''],
      quantity: ['1', [Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      // Filter out products that are not available
      this.availableProducts = products.filter(p => p.status === 'available' && p.stock > 0);
    });
  }

  addItemToOrder(): void {
    const productId = Number(this.orderForm.get('productId')?.value);
    const quantity = Number(this.orderForm.get('quantity')?.value);
    
    if (!productId || quantity <= 0) return;
    
    const product = this.availableProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Check if the product is already in the order
    const existingItemIndex = this.selectedProducts.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if already in order
      this.selectedProducts[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      this.selectedProducts.push({
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.price
      });
    }
    
    // Reset form fields
    this.orderForm.patchValue({
      productId: '',
      quantity: '1'
    });
    
    this.updateTotalOrderValue();
  }

  removeItem(item: OrderItem): void {
    this.selectedProducts = this.selectedProducts.filter(
      p => p.productId !== item.productId
    );
    this.updateTotalOrderValue();
  }

  updateTotalOrderValue(): void {
    this.totalOrderValue = this.selectedProducts.reduce(
      (total, item) => total + (item.quantity * item.unitPrice), 
      0
    );
  }

  translateStatus(status: string): string {
    const statusMap: {[key: string]: string} = {
      'pending': 'Pendente',
      'processing': 'Em processamento',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    
    return statusMap[status] || status;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  onSubmit(): void {
    if (this.orderForm.valid && this.selectedProducts.length > 0) {
      const now = new Date().toISOString();
      
      const newOrder = {
        customerName: this.orderForm.get('customerName')?.value,
        customerEmail: this.orderForm.get('customerEmail')?.value,
        items: this.selectedProducts,
        total: this.totalOrderValue,
        status: this.orderForm.get('status')?.value,
        createdAt: now,
        updatedAt: now
      };
      
      this.dialogRef.close(newOrder);
    } else {
      this.orderForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
