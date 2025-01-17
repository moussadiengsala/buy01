import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {FullProduct, Product, ProductMedia} from "../../types";
import {CartService} from "../../services/utils/cart.service";
import {CardModule} from "primeng/card";
import {MediaService} from "../../services/media/media.service";
import {TooltipModule} from "primeng/tooltip";
import {TextPreviewComponent} from "../text-preview/text-preview.component";

@Component({
    selector: 'app-product',
    imports: [CommonModule, ButtonModule, CardModule, TooltipModule, TextPreviewComponent],
    standalone: true,
    templateUrl: './product.component.html',
    styleUrl: './product.component.css'
})
export class ProductComponent {
  @Input({required: true}) product!: ProductMedia;
  isInCart = false;
  isHovered = false;

  constructor(private cartService: CartService, private mediaService: MediaService) {}

  ngOnInit(): void {
    // this.isInCart = this.cartService.isInCart(this.product.id);
  }

  getMedia(productId: string, imagePath: string): string | null {
    return this.mediaService.getMedia(productId, imagePath)
  }

  // Toggle add/remove product from the cart
  toggleCart(): void {
  //   if (this.isInCart) {
  //     this.cartService.removeFromCart(this.product.id);
  //   } else {
  //     this.cartService.addToCart(this.product);
  //   }
  //
  //   // Update the isInCart state after the action
  //   this.isInCart = this.cartService.isInCart(this.product.id);
  }
}
