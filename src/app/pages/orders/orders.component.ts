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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Order, OrderService } from '../../services/order/order.service';
import { AddOrderDialogComponent } from '../../components/dialogs/add-order-dialog/add-order-dialog.component';

@Component({
  selector: 'app-orders',
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
    MatExpansionModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0', minHeight: '0' })),
      state('expanded', style({ height: '*', minHeight: '48px' })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrderId: number | null = null;
  displayedColumns: string[] = ['id', 'customerName', 'date', 'total', 'status', 'actions'];
  isLoading = true;
  searchTerm = '';
  statusFilter = 'all';

  // Add the isExpanded method required by the template
  isExpanded = (order: any) => this.selectedOrderId === order.id;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  applyFilters(): void {
    let result = this.orders;
    
    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toString().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      result = result.filter(order => order.status === this.statusFilter);
    }
    
    this.filteredOrders = result;
  }

  applySearchFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  openAddOrderDialog(): void {
    const dialogRef = this.dialog.open(AddOrderDialogComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.createOrder(result).subscribe({
          next: (order) => {
            this.snackBar.open('Pedido adicionado com sucesso!', 'Fechar', { duration: 3000 });
            this.loadOrders();
          },
          error: (error) => {
            this.snackBar.open(`Erro ao adicionar pedido: ${error.message}`, 'Fechar', { duration: 3000 });
          }
        });
      }
    });
  }

  viewOrderDetails(orderId: number): void {
    this.selectedOrderId = this.selectedOrderId === orderId ? null : orderId;
  }
  
  updateOrderStatus(order: Order, newStatus: string): void {
    if (order.status === newStatus) {
      this.snackBar.open('O pedido já está com este status!', 'Fechar', {
        duration: 3000
      });
      return;
    }
    
    this.orderService.updateOrder(order.id, { 
      status: newStatus as any
    }).subscribe({
      next: (updatedOrder) => {
        this.snackBar.open(`Status do pedido atualizado para ${this.translateStatus(updatedOrder.status)}`, 'Fechar', {
          duration: 3000
        });
        this.loadOrders();
      },
      error: (error) => {
        this.snackBar.open(`Erro ao atualizar status: ${error.message}`, 'Fechar', {
          duration: 3000
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const classMap: {[key: string]: string} = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    
    return classMap[status] || '';
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
}
