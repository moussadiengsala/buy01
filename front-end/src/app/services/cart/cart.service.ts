import {Inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {CartItem, Cart, ProductMedia} from "../../types";
import {isPlatformBrowser} from "@angular/common";

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'shopping_cart';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  private cartCountSubject = new BehaviorSubject<number>(0);
  public showCart = signal(false);

  public cart$ = this.cartSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadCartFromStorage();
  }

  public toggleCart(event: Event) {
    event.stopPropagation();
    this.showCart.update(value => !value)

    // Handle body scrolling
    if (this.showCart()) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }

  // Load cart from localStorage
  private loadCartFromStorage(): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
        if (storedCart) {
          const cart: Cart = JSON.parse(storedCart);
          // Convert date strings back to Date objects
          cart.createdAt = new Date(cart.createdAt);
          cart.updatedAt = new Date(cart.updatedAt);
          cart.items.forEach(item => {
            item.addedAt = new Date(item.addedAt);
          });
          this.cartSubject.next(cart);
          this.cartCountSubject.next(cart.totalItems);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.clearCartFromStorage();
    }
  }

  // Save cart to localStorage
  private saveCartToStorage(cart: Cart): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  // Clear cart from localStorage
  private clearCartFromStorage(): void {
    try {
      localStorage.removeItem(this.CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  }

  // Get current cart
  getCart(): Cart | null {
    return this.cartSubject.value;
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Create new cart
  private createNewCart(): Cart {
    const now = new Date();
    return {
      items: [],
      totalItems: 0,
      totalAmount: 0,
      createdAt: now,
      updatedAt: now
    };
  }

  // Calculate cart totals
  private calculateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();
  }

  // Add item to cart
  addToCart(product: ProductMedia, quantity: number = 1): Observable<Cart> {
    let cart = this.getCart();

    if (!cart) {
      cart = this.createNewCart();
    }

    const existingItemIndex = cart.items.findIndex(item => item.item.product.id === product.product.id);

    if (existingItemIndex >= 0) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity <= product.product.quantity) {
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        cart.items[existingItemIndex].quantity = product.product.quantity;
      }
    } else {
      // Add new item
      const cartItem: CartItem = {
        id: this.generateId(),
        item: product,
        quantity: Math.min(quantity, product.product.quantity),
        price: product.product.price,
        addedAt: new Date()
      };
      cart.items.push(cartItem);
    }

    this.calculateCartTotals(cart);
    this.saveCartToStorage(cart);
    this.cartSubject.next(cart);
    this.cartCountSubject.next(cart.totalItems);

    return of(cart);
  }

  // Update cart item quantity
  updateCartItem(cartItemId: string, quantity: number): Observable<Cart> {
    const cart = this.getCart();
    if (!cart) return of(this.createNewCart());

    const itemIndex = cart.items.findIndex(item => item.id === cartItemId);
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = Math.min(quantity, cart.items[itemIndex].item.product.quantity);
      }

      this.calculateCartTotals(cart);
      this.saveCartToStorage(cart);
      this.cartSubject.next(cart);
      this.cartCountSubject.next(cart.totalItems);
    }

    return of(cart);
  }

  // Remove item from cart
  removeFromCart(cartItemId: string): Observable<Cart> {
    const cart = this.getCart();
    if (!cart) return of(this.createNewCart());

    cart.items = cart.items.filter(item => item.id !== cartItemId);
    this.calculateCartTotals(cart);
    this.saveCartToStorage(cart);
    this.cartSubject.next(cart);
    this.cartCountSubject.next(cart.totalItems);

    return of(cart);
  }

  // Clear entire cart
  clearCart(): Observable<void> {
    this.clearCartFromStorage();
    this.cartSubject.next(null);
    this.cartCountSubject.next(0);
    return of(void 0);
  }

  // Check if product is in cart
  isProductInCart(productId: string): boolean {
    const cart = this.getCart();
    return cart ? cart.items.some(item => item.item.product.id === productId) : false;
  }

  // Get cart item by product ID
  getCartItemByProductId(productId: string): CartItem | undefined {
    const cart = this.getCart();
    return cart ? cart.items.find(item => item.item.product.id === productId) : undefined;
  }

  // Get cart item count for a specific product
  getProductQuantityInCart(productId: string): number {
    const cartItem = this.getCartItemByProductId(productId);
    return cartItem ? cartItem.quantity : 0;
  }
}
