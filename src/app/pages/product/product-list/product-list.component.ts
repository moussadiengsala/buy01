import { Component } from '@angular/core';
import {FullProduct, PaginatedResponse, ProductMedia, ToastMessage, UserPayload} from "../../../types";
import {Observable, switchMap} from "rxjs";
import {MessageService, PrimeNGConfig} from "primeng/api";
import {ActivatedRoute, RouterLink, RouterLinkActive} from "@angular/router";
import {AuthService} from "../../../services/auth/auth-service.service";
import {ProductService} from "../../../services/product/product.service";
import {AlertService} from "../../../services/alert/alert.service";
import {MediaService} from "../../../services/media/media.service";
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {ProductComponent} from "../../../components/product/product.component";
import {AddProductComponent} from "../../../components/add-product/add-product.component";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    ProductComponent,
    AddProductComponent,
    AsyncPipe,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  providers: [MessageService]
})
export class ProductListComponent {
  products: PaginatedResponse<ProductMedia> | null = null;
  currentPage: number = 0;
  pageSize: number = 10;

  constructor(
              private productService: ProductService,
              private alertService: AlertService,
              private mediaService: MediaService
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
            console.error('Error loading products:', err);
            this.alertService.error('Error', 'Failed to load products.');
          }
        });
  }

  trackByProductId(index: number, products: ProductMedia): string {
    return products.product.id;
  }

}
