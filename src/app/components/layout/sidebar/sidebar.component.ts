import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: ('admin' | 'user')[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Produtos',
      icon: 'inventory_2',
      route: '/products'
    },
    {
      label: 'Pedidos',
      icon: 'shopping_cart',
      route: '/orders'
    }
  ];

  constructor(public authService: AuthService) {}

  canShowMenuItem(item: MenuItem): boolean {
    // If no roles are specified, anyone can see this item
    if (!item.roles) {
      return true;
    }

    // Otherwise, check if the user's role is included in the allowed roles
    return this.authService.currentUser 
      ? item.roles.includes(this.authService.currentUser.role)
      : false;
  }
}
