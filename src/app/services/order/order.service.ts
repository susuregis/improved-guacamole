import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Product } from '../product/product.service';

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private initialOrders: Order[] = [
    {
      id: 1,
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      items: [
        { productId: 1, productName: 'Smartphone XYZ', quantity: 1, unitPrice: 999.99 },
        { productId: 3, productName: 'Wireless Earbuds', quantity: 2, unitPrice: 149.99 }
      ],
      total: 1299.97,
      status: 'delivered',
      createdAt: '2023-05-10T10:30:00',
      updatedAt: '2023-05-15T14:20:00'
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      items: [
        { productId: 2, productName: 'Laptop Pro', quantity: 1, unitPrice: 1299.99 }
      ],
      total: 1299.99,
      status: 'shipped',
      createdAt: '2023-05-12T14:45:00',
      updatedAt: '2023-05-14T09:15:00'
    },
    {
      id: 3,
      customerName: 'Mike Johnson',
      customerEmail: 'mike.johnson@example.com',
      items: [
        { productId: 5, productName: 'Digital Camera', quantity: 1, unitPrice: 799.99 },
        { productId: 3, productName: 'Wireless Earbuds', quantity: 1, unitPrice: 149.99 }
      ],
      total: 949.98,
      status: 'processing',
      createdAt: '2023-05-18T16:20:00',
      updatedAt: '2023-05-19T08:45:00'
    },
    {
      id: 4,
      customerName: 'Sarah Williams',
      customerEmail: 'sarah.williams@example.com',
      items: [
        { productId: 4, productName: 'Smart Watch', quantity: 2, unitPrice: 199.99 }
      ],
      total: 399.98,
      status: 'pending',
      createdAt: '2023-05-20T09:10:00',
      updatedAt: '2023-05-20T09:10:00'
    },
    {
      id: 5,
      customerName: 'Robert Brown',
      customerEmail: 'robert.brown@example.com',
      items: [
        { productId: 1, productName: 'Smartphone XYZ', quantity: 1, unitPrice: 999.99 },
        { productId: 4, productName: 'Smart Watch', quantity: 1, unitPrice: 199.99 }
      ],
      total: 1199.98,
      status: 'delivered',
      createdAt: '2023-05-05T11:25:00',
      updatedAt: '2023-05-10T15:30:00'
    },
    {
      id: 6,
      customerName: 'Emily Davis',
      customerEmail: 'emily.davis@example.com',
      items: [
        { productId: 6, productName: 'Gaming Console', quantity: 1, unitPrice: 499.99 }
      ],
      total: 499.99,
      status: 'cancelled',
      createdAt: '2023-05-08T13:40:00',
      updatedAt: '2023-05-09T10:15:00'
    }
  ];

  private orders: Order[] = [];
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private readonly STORAGE_KEY = 'admin_dashboard_orders';

  constructor() {
    this.loadOrdersFromStorage();
  }

  private loadOrdersFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedOrders = localStorage.getItem(this.STORAGE_KEY);
        if (storedOrders) {
          this.orders = JSON.parse(storedOrders);
        } else {
          this.orders = [...this.initialOrders];
          this.saveOrdersToStorage();
        }
        this.ordersSubject.next(this.orders);
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
        this.orders = [...this.initialOrders];
        this.ordersSubject.next(this.orders);
      }
    } else {
      // SSR environment
      this.orders = [...this.initialOrders];
      this.ordersSubject.next(this.orders);
    }
  }

  private saveOrdersToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.orders));
      } catch (error) {
        console.error('Error saving orders to localStorage:', error);
      }
    }
  }
  getOrders(): Observable<Order[]> {
    // Simulate API delay
    return this.ordersSubject.asObservable().pipe(delay(500));
  }

  getOrder(id: number): Observable<Order> {
    const order = this.orders.find(o => o.id === id);
    
    if (order) {
      return of(order).pipe(delay(300));
    }
    
    return throwError(() => new Error('Order not found'));
  }

  createOrder(order: Omit<Order, 'id'>): Observable<Order> {
    // Create new order with generated ID
    const newOrder: Order = {
      ...order,
      id: this.getNextId()
    };

    // Add to orders array
    this.orders = [...this.orders, newOrder];
    this.ordersSubject.next(this.orders);
    this.saveOrdersToStorage();
    
    return of(newOrder).pipe(delay(500));
  }

  updateOrder(id: number, orderData: Partial<Order>): Observable<Order> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return throwError(() => new Error('Order not found'));
    }

    // Update order
    const updatedOrder = {
      ...this.orders[orderIndex],
      ...orderData,
      updatedAt: new Date().toISOString()
    };

    this.orders = [
      ...this.orders.slice(0, orderIndex),
      updatedOrder,
      ...this.orders.slice(orderIndex + 1)
    ];

    this.ordersSubject.next(this.orders);
    this.saveOrdersToStorage();
    
    return of(updatedOrder).pipe(delay(500));
  }

  deleteOrder(id: number): Observable<void> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return throwError(() => new Error('Order not found'));
    }

    this.orders = [
      ...this.orders.slice(0, orderIndex),
      ...this.orders.slice(orderIndex + 1)
    ];

    this.ordersSubject.next(this.orders);
    this.saveOrdersToStorage();
    
    return of(undefined).pipe(delay(500));
  }
  
  getOrdersByStatus(): Observable<{ status: string, count: number }[]> {
    const statusCounts = this.orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const result = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
    
    return of(result).pipe(delay(300));
  }

  getRecentOrders(limit: number = 5): Observable<Order[]> {
    const recentOrders = [...this.orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
      
    return of(recentOrders).pipe(delay(300));
  }
  
  getOrdersTimeline(): Observable<{ date: string, count: number, total: number }[]> {
    // Group orders by date and calculate counts and totals
    const ordersByDate = this.orders.reduce((acc, order) => {
      // Just use the date part
      const date = order.createdAt.split('T')[0];
      
      if (!acc[date]) {
        acc[date] = { count: 0, total: 0 };
      }
      
      acc[date].count++;
      acc[date].total += order.total;
      
      return acc;
    }, {} as Record<string, { count: number, total: number }>);
    
    // Convert to array format for charts
    const result = Object.entries(ordersByDate)
      .map(([date, data]) => ({
        date,
        count: data.count,
        total: parseFloat(data.total.toFixed(2))
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return of(result).pipe(delay(500));
  }
  
  private getNextId(): number {
    return Math.max(...this.orders.map(o => o.id), 0) + 1;
  }
}
