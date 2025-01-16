import {ChangeDetectorRef, Component, TrackByFunction} from '@angular/core';
import {ACTION, Media, PaginatedResponse, Product, ProductMedia, Role, ToastMessage, UserPayload} from '../../types';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { FileSelectEvent, FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ActivatedRoute } from '@angular/router';
import {ProductComponent} from "../../components/product/product.component";
import {TextPreviewComponent} from "../../components/text-preview/text-preview.component";
import {ProductService} from "../../services/product/product.service";
import {AlertService} from "../../services/alert/alert.service";
import {forkJoin, Observable, switchMap} from "rxjs";
import {MediaService} from "../../services/media/media.service";
import {AuthService} from "../../services/auth/auth-service.service";
import {UploadImagesComponent} from "../../components/upload-images/upload-images.component";
import {MediaLayoutComponent} from "../../components/media-layout/media-layout.component";
import {CarouselModule} from "primeng/carousel";
import {TagModule} from "primeng/tag";


@Component({
  selector: 'app-media-management',
  standalone: true,
    imports: [
        CommonModule,
        ProductComponent,
        GalleriaModule,
        FileUploadModule,
        ToastModule,
        BadgeModule,
        TextPreviewComponent,
        NgOptimizedImage,
        UploadImagesComponent,
        MediaLayoutComponent,
        CarouselModule,
        TagModule
    ],
  templateUrl: './media-management.component.html',
  styleUrl: './media-management.component.css',
  providers: [MessageService]
})
export class MediaManagementComponent {
    protected readonly ACTION = ACTION
    products: PaginatedResponse<ProductMedia> | null = null;
    selectedProduct: ProductMedia | null = null;
    currentPage: number = 0;
    pageSize: number = 10;

    files: File[] = [];
    showGallery: boolean = false;
    loading: boolean = false;
    user$: Observable<UserPayload>;

    responsiveOptions: any[] | undefined;

    constructor(
                private messageService: MessageService,
                private authService: AuthService,
                private productService: ProductService,
                private mediaService: MediaService
                ) {
        this.user$ = this.authService.userState$;
    }

    ngOnInit(): void {
        this.loadProductsWithMedia();
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
    }

    getMedia(productId: string, imagePath: string): string | null {
        return this.mediaService.getMedia(productId, imagePath)
    }

    loadProductsWithMedia(): void {
        this.user$
            .pipe(
                switchMap(user =>
                    this.productService.getProductsWithMediaByUserId(user.id, this.currentPage, this.pageSize)
                )
            )
            .subscribe({
                next: (response) => {
                    this.products = response.data;

                    if (this.selectedProduct) {
                        this.selectedProduct = this.products?.content?.find(
                            product => product.product.id === this.selectedProduct?.product.id
                        ) || null;
                    }
                },
                error: (err) => {
                    console.error('Error loading products:', err);
                    this.messageService.add({severity: "error", summary: "Error getting products", detail: err?.error?.message || 'Failed to load products.'});
                }
            });
    }

    trackByProductId(index: number, productMedia: ProductMedia): string {
        return productMedia.product.id; // Use the product's unique identifier
    }

    handleSelectProduct(product: ProductMedia) {
      this.selectedProduct = product;
      this.showGallery = false;
      setTimeout(() => {
          this.showGallery = true;
      }, 0);
    }

    handleMediaAction(event: ToastMessage) {
        this.messageService.add(event)
        this.loadProductsWithMedia()
    }


}
