import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../auth/auth.service';

export interface UserData extends User {
  createdAt: string;
  status: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: UserData[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      name: 'Administrator',
      createdAt: '2023-01-01',
      status: 'active'
    },
    {
      id: 5,
      username: 'tech_admin',
      email: 'tech.admin@example.com',
      role: 'admin',
      name: 'Tech Admin',
      createdAt: '2023-05-20',
      status: 'active'
    }
  ];

  private usersSubject = new BehaviorSubject<UserData[]>(this.users);

  constructor() { }

  getUsers(): Observable<UserData[]> {
    // Simulate API delay
    return this.usersSubject.asObservable().pipe(delay(500));
  }

  getUser(id: number): Observable<UserData> {
    const user = this.users.find(u => u.id === id);
    
    if (user) {
      return of(user).pipe(delay(300));
    }
    
    return throwError(() => new Error('User not found'));
  }

  createUser(user: Omit<UserData, 'id'>): Observable<UserData> {
    // Simulate server-side validation
    const existingUser = this.users.find(
      u => u.username === user.username || u.email === user.email
    );

    if (existingUser) {
      return throwError(() => 
        new Error('Username or email already exists')
      );
    }

    // Create new user with generated ID
    const newUser: UserData = {
      ...user,
      id: this.getNextId()
    };

    // Add to users array
    this.users = [...this.users, newUser];
    this.usersSubject.next(this.users);
    
    return of(newUser).pipe(delay(500));
  }

  updateUser(id: number, userData: Partial<UserData>): Observable<UserData> {
    const userIndex = this.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }

    // Check if username or email is already taken by another user
    if (userData.username || userData.email) {
      const conflictUser = this.users.find(
        u => u.id !== id && 
        ((userData.username && u.username === userData.username) || 
         (userData.email && u.email === userData.email))
      );

      if (conflictUser) {
        return throwError(() => 
          new Error('Username or email already exists')
        );
      }
    }

    // Update user
    const updatedUser = {
      ...this.users[userIndex],
      ...userData
    };

    this.users = [
      ...this.users.slice(0, userIndex),
      updatedUser,
      ...this.users.slice(userIndex + 1)
    ];

    this.usersSubject.next(this.users);
    
    return of(updatedUser).pipe(delay(500));
  }

  deleteUser(id: number): Observable<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }

    this.users = [
      ...this.users.slice(0, userIndex),
      ...this.users.slice(userIndex + 1)
    ];

    this.usersSubject.next(this.users);
    
    return of(undefined).pipe(delay(500));
  }

  private getNextId(): number {
    return Math.max(...this.users.map(u => u.id), 0) + 1;
  }
}
