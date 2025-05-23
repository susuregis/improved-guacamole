import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product, ProductService } from '../../services/product/product.service';
import { AddProductDialogComponent } from '../../components/dialogs/add-product-dialog/add-product-dialog.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    ReactiveFormsModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['id', 'name', 'category', 'price', 'stock', 'status', 'actions'];
  isLoading = true;
  searchTerm = '';
  
  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.isLoading = false;
    });
  }

  applyFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  getStatusClass(status: string): string {
    const classMap: {[key: string]: string} = {
      'available': 'status-available',
      'out_of_stock': 'status-out-of-stock',
      'discontinued': 'status-discontinued'
    };
    
    return classMap[status] || '';
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  translateStatus(status: string): string {
    const statusMap: {[key: string]: string} = {
      'available': 'Disponível',
      'out_of_stock': 'Sem estoque',
      'discontinued': 'Descontinuado'
    };
    
    return statusMap[status] || status;
  }

  openAddProductDialog(): void {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.createProduct(result).subscribe({
          next: (product) => {
            this.snackBar.open('Produto adicionado com sucesso!', 'Fechar', { duration: 3000 });
            this.loadProducts();
          },
          error: (error) => {
            this.snackBar.open(`Erro ao adicionar produto: ${error.message}`, 'Fechar', { duration: 3000 });
          }
        });
      }
    });
  }

  editProduct(product: Product): void {
    // Instead of just showing a message, we'll implement a basic edit functionality
    const updatedStatus = product.status === 'available' ? 'out_of_stock' : 'available';
    
    this.productService.updateProduct(product.id, { 
      status: updatedStatus 
    }).subscribe({
      next: (updatedProduct) => {
        this.snackBar.open(`Status do produto alterado para ${this.translateStatus(updatedProduct.status)}`, 'Fechar', {
          duration: 3000
        });
        this.loadProducts();
      },
      error: (error) => {
        this.snackBar.open(`Erro ao atualizar produto: ${error.message}`, 'Fechar', {
          duration: 3000
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Produto excluído com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.loadProducts();
        },
        error: (error) => {
          this.snackBar.open(`Erro ao excluir produto: ${error.message}`, 'Fechar', {
            duration: 3000
          });
        }
      });
    }
  }
}
