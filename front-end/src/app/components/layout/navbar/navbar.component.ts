import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { UserPayload } from '../../../types';
import {CartService} from "../../../services/utils/cart.service";
import {AuthService} from "../../../services/auth/auth-service.service";

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
    this.cartService.cart$.subscribe((cartItems) => {
      this.cartCount = cartItems.length;
    });
    
    this.authService.userState$.subscribe((user) => {
      this.user = user;
    });
  }

  toggleMenu(event: Event) {
    event.stopPropagation()
    this.isMenuOpen = !this.isMenuOpen;
  }

  logOut(event: Event) {
    this.authService.logout()
    this.toggleMenu(event)
  }
}
