import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Product, ProductMedia} from "../../types";
import {ProductService} from "../../services/product/product.service";
import {AlertService} from "../../services/alert/alert.service";
import {AlertComponent} from "../alert/alert.component";
import {NgIf} from "@angular/common";
import {MessageService} from "primeng/api";
import {catchError, finalize} from "rxjs/operators";
import {of} from "rxjs";

@Component({
  selector: 'app-delete-product',
  standalone: true,
  imports: [AlertComponent, NgIf],
  templateUrl: './delete-product.component.html',
  styleUrl: './delete-product.component.css'
})
export class DeleteProductComponent {
  @Input() productMedia!: ProductMedia;

  isVisible: boolean = false;
  isLoading: boolean = false;

  constructor(private productService: ProductService, private messageService: MessageService) {
    console.log(this.productMedia)
  }


  deleteProduct(): void {
    this.productService.deleteProduct(this.productMedia.product.id).pipe(
        catchError((error) => {
          console.error('Upload failed:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Upload Failed',
            detail: error
          });
          return of(error);
        }),
        finalize(() => {
          this.isLoading = false;
        })
    ).subscribe((response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Files successfully uploaded!'
      });

    });
  }

  /**
   * Formats error messages for display or logging.
   * @param error - Error object returned from the API
   * @returns A user-friendly error message
   */
  private formatError(error: any): string {
    if (error?.error?.data) {
      return Object.entries(error.error.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
    }
    return error?.error?.message || 'Failed to delete product';
  }

  toggle() {
    if (this.isLoading) return;
    this.isVisible = !this.isVisible;
  }
}
