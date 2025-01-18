import { Component } from '@angular/core';
import { PaginatedResponse, ProductMedia } from "../../../types";
import { Router, RouterLink, RouterLinkActive} from "@angular/router";
import {ProductService} from "../../../services/product/product.service";
import {MediaService} from "../../../services/media/media.service";
import { NgForOf, NgIf} from "@angular/common";
import {ProductComponent} from "../../../components/product/product.component";

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [
        NgIf,
        NgForOf,
        ProductComponent,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './product-list.component.html',
    styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  products: PaginatedResponse<ProductMedia> | null = null;
  currentPage: number = 0;
  pageSize: number = 10;

  constructor(
              private productService: ProductService,
              private mediaService: MediaService,
              private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProductsWithMedia();
  }

  getMedia(productId: string, imagePath: string): string | null {
    return this.mediaService.getMedia(productId, imagePath)
  }

  loadProductsWithMedia(): void {
    this.productService.getAllProductsMedia(this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.products = response.data;
          },
          error: (err) => {
            this.router.navigate(['/error', {
                message: err?.error?.message || "Failed to load products",
                status: err?.error?.status || 500
            }])
          }
        });
  }

  trackByProductId(index: number, products: ProductMedia): string {
    return products.product.id;
  }

}
