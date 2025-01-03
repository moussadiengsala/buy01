import {ChangeDetectorRef, Component, TrackByFunction} from '@angular/core';
import {ACTION, Media, PaginatedResponse, Product, ProductMedia, Role, UserPayload} from '../../types';
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
        MediaLayoutComponent
    ],
  templateUrl: './media-management.component.html',
  styleUrl: './media-management.component.css',
  providers: [MessageService]
})
export class MediaManagementComponent {
    products: PaginatedResponse<ProductMedia> | null = null;
    selectedProduct: ProductMedia | null = null;
    currentPage: number = 0;
    pageSize: number = 10;

    isUploadImageVisible: boolean = false;
    files: File[] = [];
    totalSize : number = 0;
    totalSizePercent : number = 0;
    showGallery: boolean = false;
    loading: boolean = false;
    user$: Observable<UserPayload>;

    responsiveOptions: any[] = [
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];

    constructor(private config: PrimeNGConfig,
                private route: ActivatedRoute,
                private messageService: MessageService,
                private authService: AuthService,
                private productService: ProductService,
                private alertService: AlertService,
                private mediaService: MediaService
                ) {
        this.user$ = this.authService.userState$;
    }

    ngOnInit(): void {
        this.loadProductsWithMedia();
        this.selectedProduct = this.products?.content?.[
            Math.floor(Math.random() * (this.products?.content.length || 0))
            ] || null;
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
                },
                error: (err) => {
                    console.error('Error loading products:', err);
                    this.alertService.error('Error', 'Failed to load products.');
                }
            });
    }

    handleUpladImagesToggle() {
      if (this.selectedProduct) this.isUploadImageVisible = !this.isUploadImageVisible;
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

    deleteImage(media: Media) {
        // Confirmation before deletion
        // if (confirm('Are you sure you want to delete this image?')) {
        //     this.mediaService.deleteMedia(media.id).subscribe({
        //         next: () => {
        //             this.selectedProduct!.media = this.selectedProduct!.media.filter(m => m.id !== media.id);
        //             this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Image deleted successfully!' });
        //         },
        //         error: () => this.alertService.error('Error', 'Failed to delete the image.')
        //     });
        // }
    }

    protected readonly ACTION = ACTION;
}
