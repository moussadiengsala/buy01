import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProductMedia} from "../../types";
import {CartService} from "../../services/cart/cart.service";
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

  constructor(public cartService: CartService, private mediaService: MediaService) {}

  getMedia(productId: string, imagePath: string): string | null {
    return this.mediaService.getMedia(productId, imagePath)
  }

  addCart(event: Event) {
      event.stopPropagation()
      this.cartService.addToCart(this.product)
      this.cartService.toggleCart(event);
  }

  isProductInCart(): boolean {
      // return this.cartService.isProductInCart(this.product.product.id);
      return false;
  }
}
