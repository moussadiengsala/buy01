import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { CartService } from '../../services/utils/cart.service';
import { BadgeModule } from 'primeng/badge';
import { AuthService } from '../../services/auth/auth-service.service';
import { UserPayload } from '../../../types';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink, RouterLinkActive, AvatarModule, BadgeModule],
  templateUrl: './navbar.component.html'
})

export class NavbarComponent {
  isMenuOpen = false
  user: UserPayload = { id: '',  name: '', email: '', avatar: null, role: null, isAuthenticated: false}
  cartCount = 0;

  constructor( private cartService: CartService, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to the cart changes
    this.cartService.cart$.subscribe((cartItems) => {
      this.cartCount = cartItems.length; // Update cart count
    });
    
    this.authService.userState$.subscribe((user) => {
      this.user = user;
    });
  }

  toggleMenu() {
    console.log('toggleMenu');
    this.isMenuOpen = !this.isMenuOpen;
  }

  logOut() {
    this.authService.logout()
    this.toggleMenu()
  }
}
