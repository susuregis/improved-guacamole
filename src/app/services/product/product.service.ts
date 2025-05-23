import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  createdAt: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private initialProducts: Product[] = [
    {
      id: 1,
      name: 'Smartphone XYZ',
      description: 'Latest model with high-end features',
      price: 999.99,
      category: 'Electronics',
      imageUrl: 'https://via.placeholder.com/150',
      stock: 50,
      createdAt: '2023-01-10',
      status: 'available'
    },
    {
      id: 2,
      name: 'Laptop Pro',
      description: 'High performance laptop for professionals',
      price: 1299.99,
      category: 'Electronics',
      imageUrl: 'https://via.placeholder.com/150',
      stock: 20,
      createdAt: '2023-02-05',
      status: 'available'
    },
    {
      id: 3,
      name: 'Wireless Earbuds',
      description: 'Premium sound quality with noise cancellation',
      price: 149.99,
      category: 'Audio',
      imageUrl: 'https://via.placeholder.com/150',
      stock: 100,
      createdAt: '2023-03-15',
      status: 'available'
    },
    {
      id: 4,
      name: 'Smart Watch',
      description: 'Health and fitness tracking features',
      price: 199.99,
      category: 'Wearables',
      imageUrl: 'https://via.placeholder.com/150',
      stock: 0,
      createdAt: '2023-04-20',
      status: 'out_of_stock'
    },
    {
      id: 5,
      name: 'Digital Camera',
      description: 'Professional grade DSLR camera',
      price: 799.99,
      category: 'Photography',
      imageUrl: 'https://via.placeholder.com/150',
      stock: 15,
      createdAt: '2023-05-25',
      status: 'available'
    },
    {
      id: 6,
      name: 'Gaming Console',
      description: 'Next-gen gaming experience',
      price: 499.99,
      category: 'Gaming',
      imageUrl: 'https://via.placeholder.com/150',
      stock: 0,
      createdAt: '2023-06-10',
      status: 'discontinued'
    }
  ];

  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private readonly STORAGE_KEY = 'admin_dashboard_products';

  constructor() {
    this.loadProductsFromStorage();
  }

  private loadProductsFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedProducts = localStorage.getItem(this.STORAGE_KEY);
        if (storedProducts) {
          this.products = JSON.parse(storedProducts);
        } else {
          this.products = [...this.initialProducts];
          this.saveProductsToStorage();
        }
        this.productsSubject.next(this.products);
      } catch (error) {
        console.error('Error loading products from localStorage:', error);
        this.products = [...this.initialProducts];
        this.productsSubject.next(this.products);
      }
    } else {
      // SSR environment
      this.products = [...this.initialProducts];
      this.productsSubject.next(this.products);
    }
  }

  private saveProductsToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
      } catch (error) {
        console.error('Error saving products to localStorage:', error);
      }
    }
  }
  getProducts(): Observable<Product[]> {
    // Simulate API delay
    return this.productsSubject.asObservable().pipe(delay(500));
  }

  getProduct(id: number): Observable<Product> {
    const product = this.products.find(p => p.id === id);
    
    if (product) {
      return of(product).pipe(delay(300));
    }
    
    return throwError(() => new Error('Product not found'));
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    // Create new product with generated ID
    const newProduct: Product = {
      ...product,
      id: this.getNextId()
    };

    // Add to products array
    this.products = [...this.products, newProduct];
    this.productsSubject.next(this.products);
    this.saveProductsToStorage();
    
    return of(newProduct).pipe(delay(500));
  }

  updateProduct(id: number, productData: Partial<Product>): Observable<Product> {
    const productIndex = this.products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return throwError(() => new Error('Product not found'));
    }

    // Update product
    const updatedProduct = {
      ...this.products[productIndex],
      ...productData
    };

    this.products = [
      ...this.products.slice(0, productIndex),
      updatedProduct,
      ...this.products.slice(productIndex + 1)
    ];

    this.productsSubject.next(this.products);
    this.saveProductsToStorage();
    
    return of(updatedProduct).pipe(delay(500));
  }

  deleteProduct(id: number): Observable<void> {
    const productIndex = this.products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return throwError(() => new Error('Product not found'));
    }

    this.products = [
      ...this.products.slice(0, productIndex),
      ...this.products.slice(productIndex + 1)
    ];

    this.productsSubject.next(this.products);
    this.saveProductsToStorage();
    
    return of(undefined).pipe(delay(500));
  }
  
  getProductsByCategory(): Observable<{category: string, count: number}[]> {
    const categories = this.products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = 0;
      }
      acc[product.category]++;
      return acc;
    }, {} as Record<string, number>);
    
    const result = Object.entries(categories).map(([category, count]) => ({ category, count }));
    
    return of(result).pipe(delay(500));
  }

  getProductsCountByStatus(): Observable<{status: string, count: number}[]> {
    const statuses = this.products.reduce((acc, product) => {
      if (!acc[product.status]) {
        acc[product.status] = 0;
      }
      acc[product.status]++;
      return acc;
    }, {} as Record<string, number>);
    
    const result = Object.entries(statuses).map(([status, count]) => ({ status, count }));
    
    return of(result).pipe(delay(500));
  }
  
  private getNextId(): number {
    return Math.max(...this.products.map(p => p.id), 0) + 1;
  }
}
