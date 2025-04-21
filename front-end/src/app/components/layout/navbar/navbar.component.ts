import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { UserPayload } from '../../../types';
import { CartService } from "../../../services/utils/cart.service";
import { AuthService } from "../../../services/auth/auth-service.service";
import {filter} from "rxjs/operators";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink, RouterLinkActive, AvatarModule, BadgeModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent {
  isMenuOpen = false;
  user: UserPayload = { id: '', name: '', email: '', avatar: null, role: null, isAuthenticated: false };
  cartCount = 0;
  isAuthPage: boolean = false;

  constructor(
      private router: Router,
      private cartService: CartService,
      private authService: AuthService) {
    this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          const currentUrl = event.urlAfterRedirects;
          this.isAuthPage = currentUrl.includes('/sign-in') || currentUrl.includes('/sign-up');
        });
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cartItems) => {
      this.cartCount = cartItems.length;
    });

    this.authService.userState$.subscribe((user) => {
      this.user = user;
    });
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;

    // Handle body scrolling
    if (this.isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }

  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const navElement = document.querySelector('nav');
    const menuButton = document.querySelector('button');

    if (this.isMenuOpen &&
        navElement &&
        !navElement.contains(target) &&
        menuButton &&
        !menuButton.contains(target)) {
      this.isMenuOpen = false;
      document.body.classList.remove('overflow-hidden');
    }
  }

  logOut(event: Event) {
    this.authService.logout();
    this.toggleMenu(event);
  }
}