import { Component, EventEmitter, Input, Output } from '@angular/core';
import {ProductMedia, ToastMessage} from "../../types";
import { ProductService } from "../../services/product/product.service";
import { NgIf } from "@angular/common";
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";

@Component({
    selector: 'app-delete-product',
    imports: [NgIf],
    standalone: true,
    templateUrl: './delete-product.component.html'
})
export class DeleteProductComponent {
  @Input() productMedia!: ProductMedia;
  @Output() productDeleted = new EventEmitter<ToastMessage>(); // Emits product ID after deletion

  isVisible: boolean = false;
  isLoading: boolean = false;

  constructor(private productService: ProductService) {}

  deleteProduct(): void {
    this.isLoading = true;
    this.productService.deleteProduct(this.productMedia.product.id).pipe(
        catchError((error) => {
          console.error('Upload failed:', error);
          this.productDeleted.emit({
            severity: 'error',
            summary: 'Error deleting the product.',
            detail: error?.error?.message || "Failed to delete the product.",
            status: "FAILED"
          });
          return of(error);
        }),
        finalize(() => {
          this.isLoading = false;
          this.isVisible = false;
        })
    ).subscribe((response) => {
      this.productDeleted.emit({
        severity: 'success',
        summary: 'Success',
        detail: response?.message || "The product is deleted successfully.",
        status: "OK"
      });
    });
    this.toggle()
  }

  toggle(): void {
    if (this.isLoading) return;
    this.isVisible = !this.isVisible;
  }
}
