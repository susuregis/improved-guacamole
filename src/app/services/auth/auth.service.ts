import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin'; // Changed from 'admin' | 'user'
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly API_URL = 'api'; // Simulated API - in production, use your actual API URL
  
  private jwtHelper = new JwtHelperService();
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private loadUserFromToken(): void {
    if (!this.isBrowser()) {
      return; // Não execute no lado do servidor
    }
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      try {
        const decodedToken = this.jwtHelper.decodeToken(token);
        const user: User = {
          id: decodedToken.id,
          username: decodedToken.username,
          email: decodedToken.email,
          role: decodedToken.role,
          name: decodedToken.name
        };
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error decoding token', error);
        this.logout();
      }
    }
  }
  login(loginRequest: LoginRequest): Observable<User> {
    // In a real application, you would send a request to your API
    // For demo purposes, we'll simulate a successful login with mock data
    return this.simulateLogin(loginRequest).pipe(
      tap((response: AuthResponse) => {
        if (this.isBrowser()) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
        this.currentUserSubject.next(response.user);
      }),
      map(response => response.user),
      catchError(error => {
        console.error('Login failed', error);
        return throwError(() => new Error('Invalid username or password'));
      })
    );
  }
  
  // Simulate API call for demo purposes
  private simulateLogin(credentials: LoginRequest): Observable<AuthResponse> {
    // Demo users
    const adminUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      name: 'Administrator'
    };
    
    // Simulate authentication check
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      // Generate a mock JWT token for admin
      const token = this.generateMockToken(adminUser);
      return of({ user: adminUser, token });
    } else {
      return throwError(() => new Error('Invalid credentials'));
    }
  }
  
  private generateMockToken(user: User): string {
    // This is a simplified mock token generation. In a real app, you'd use a proper JWT library
    // or get the token from your backend auth service
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      exp: new Date().getTime() + 3600 * 1000 // Token expires in 1 hour
    }));
    const signature = btoa('mock_signature'); // In a real app, this would be cryptographically signed
    
    return `${header}.${payload}.${signature}`;
  }
    logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  isLoggedIn(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }
  
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
  
  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
