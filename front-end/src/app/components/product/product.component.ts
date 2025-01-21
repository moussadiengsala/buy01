import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProductMedia} from "../../types";
import {CartService} from "../../services/utils/cart.service";
import {CardModule} from "primeng/card";
import {MediaService} from "../../services/media/media.service";
import {TooltipModule} from "primeng/tooltip";
import {TextPreviewComponent} from "../text-preview/text-preview.component";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
    selector: 'app-product',
    imports: [CommonModule, ButtonModule, CardModule, TooltipModule, TextPreviewComponent, RouterLink, RouterLinkActive],
    standalone: true,
    templateUrl: './product.component.html',
})
export class ProductComponent {
  @Input({required: true}) product!: ProductMedia;
  isInCart = false;

  constructor(private cartService: CartService, private mediaService: MediaService) {}

  ngOnInit(): void {
    this.isInCart = this.cartService.isInCart(this.product.product.id);
  }

  getMedia(productId: string, imagePath: string): string | null {
    return this.mediaService.getMedia(productId, imagePath)
  }

  // Toggle add/remove product from the cart
  toggleCart(): void {
    if (this.isInCart) {
      this.cartService.removeFromCart(this.product.product.id);
    } else {
      this.cartService.addToCart(this.product.product);
    }

    // Update the isInCart state after the action
    this.isInCart = this.cartService.isInCart(this.product.product.id);
  }
}
