import { Component } from '@angular/core';
import {ActivatedRoute, Route, Router} from "@angular/router";
import {ACTION, FullProduct, ProductMedia} from "../../../types";
import {ProductService} from "../../../services/product/product.service";
import {MessageService, PrimeTemplate} from "primeng/api";
import {CarouselModule} from "primeng/carousel";
import {AccordionModule} from "primeng/accordion";
import {CommonModule} from "@angular/common";
import {TagModule} from "primeng/tag";

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [
        CarouselModule,
        PrimeTemplate,
        AccordionModule,
        CommonModule,
        TagModule
    ],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent {
  product: ProductMedia | null = null;
  responsiveOptions: any[] | undefined;

  constructor(
      private route: ActivatedRoute,
      private productService: ProductService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '1199px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
      }
    ]

    this.route.paramMap.subscribe(params => {
      let productId: string | null = params.get('productId');
      if (!productId) return;

      this.productService.getSingleProductsMedia(productId).subscribe({
        next: (response) => {
          this.product = response.data;
        },
        error: (err) => {
            console.log(err)
            this.router.navigate(['/error', {
                message: err?.error?.message || "Failed to load the product",
                status: err?.error?.status || 500
            }])
        }
      })
    });
  }

  getMedia(productId: string, imagePath: string) {
    if (!productId || !imagePath) return null;
    return `https://localhost:8082/api/v1/media/${productId}/${imagePath}`
  }
}
