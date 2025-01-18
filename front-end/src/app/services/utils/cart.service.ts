import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Product} from "../../types";

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: Product[] = [];
  private cartSubject = new BehaviorSubject<Product[]>([]);

  cart$ = this.cartSubject.asObservable(); // Observable for the cart

  constructor() {}

  addToCart(product: Product): void {
    // Add product to cart
    this.cart.push(product);
    this.cartSubject.next(this.cart); // Update the observable with the new cart
  }

  getCart(): Product[] {
    // Return current cart
    return this.cart;
  }

  isInCart(id: string): boolean {
    // Check if product is in cart by ID
    return this.cart.some(product => product.id === id);
  }

  removeFromCart(productId: string): void {
    // Remove product from cart by ID
    this.cart = this.cart.filter(product => product.id !== productId);
    this.cartSubject.next(this.cart); // Update the observable with the new cart
  }

  getCartCount(): number {
    return this.cart.length; // Return the length of the cart array
  }

  clearCart(): void {
    // Clear the cart
    this.cart = [];
    this.cartSubject.next(this.cart); // Update the observable with the new cart
  }
}
