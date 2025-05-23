import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-product-dialog.component.html',
  styleUrl: './add-product-dialog.component.scss'
})
export class AddProductDialogComponent {
  productForm: FormGroup;
  categories = [
    'Electronics', 
    'Audio', 
    'Wearables', 
    'Photography',
    'Gaming',
    'Computers',
    'Accessories',
    'Mobile'
  ];

  constructor(
    private dialogRef: MatDialogRef<AddProductDialogComponent>,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      imageUrl: ['https://via.placeholder.com/150', [Validators.required]],
      status: ['available', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct = {
        ...this.productForm.value,
        price: Number(this.productForm.value.price),
        stock: Number(this.productForm.value.stock),
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      this.dialogRef.close(newProduct);
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
