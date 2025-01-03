import {Component, inject, Input} from '@angular/core';
import {NgIf} from "@angular/common";
// import {ProductService} from "../../../services/product.service";
import {Router} from "@angular/router";
import {HlmButtonDirective} from "../../ui/ui-button-helm/src";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [HlmButtonDirective, NgIf],
  templateUrl: './card.component.html',
})
export class CardComponent {
  // productService = inject(ProductService);
  // router = inject(Router);
  // @Input() currentUserId!: string;
  // @Input() imageSrc!: string;
  // @Input() imageAlt!: string;
  // @Input() productName!: string;
  // @Input() productOwnerId!: string;
  // @Input() productDescription!: string;
  // @Input() productPrice!: string;
  // @Input() productRemaining!: object;
  // @Input() productQuantity!: string;
  // @Input() productId!: string;
  //
  // public deleteProduct(id: string) {
  //   this.productService.deleteProduct(id).subscribe(
  //     () => {
  //       this.productService.notifyProductChanged("delete");
  //     },
  //     (error) => console.error('Error deleting product', error)
  //   );
  // }
  //
  // public updateProduct(id: string) {
  //   console.log(id);
  // }
}
