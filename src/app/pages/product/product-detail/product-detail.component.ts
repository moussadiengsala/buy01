import { Component } from '@angular/core';
import {ActivatedRoute, Route} from "@angular/router";
import {switchMap} from "rxjs";
import {ACTION, FullProduct} from "../../../types";
import {ProductService} from "../../../services/product/product.service";
import {MessageService, PrimeTemplate} from "primeng/api";
import {CarouselModule} from "primeng/carousel";
import {MediaLayoutComponent} from "../../../components/media-layout/media-layout.component";
import {AccordionModule} from "primeng/accordion";
import {CommonModule} from "@angular/common";
import {TagModule} from "primeng/tag";

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CarouselModule,
    MediaLayoutComponent,
    PrimeTemplate,
    AccordionModule,
    CommonModule,
    TagModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  providers: [MessageService]
})
export class ProductDetailComponent {
  product: FullProduct | null = null;
  responsiveOptions: any[] | undefined;

  constructor(
      private route: ActivatedRoute,
      private productService: ProductService,
      private messageService: MessageService
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

      this.productService.getSingleFullProducts(productId).subscribe({
        next: (response) => {
          this.product = response.data;
          console.log(this.product)
        },
        error: (e) => {
          console.log(e)
        }
      })
    });
  }

  getMedia(productId: string, imagePath: string) {
    if (!productId || !imagePath) return null;
    return `https://localhost:8082/api/v1/media/${productId}/${imagePath}`
  }
}
