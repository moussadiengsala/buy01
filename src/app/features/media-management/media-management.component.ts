import { ChangeDetectorRef, Component } from '@angular/core';
import { Product } from '../../types';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { CommonModule } from '@angular/common';
import { ProductComponent } from "../../sheared/components/product/product.component";
import { GalleriaModule } from 'primeng/galleria';
import { FileSelectEvent, FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ActivatedRoute } from '@angular/router';
import { TextPreviewComponent } from "../../sheared/components/text-preview/text-preview.component";


@Component({
  selector: 'app-media-management',
  standalone: true,
  imports: [CommonModule, ProductComponent, GalleriaModule, FileUploadModule, ToastModule, BadgeModule, TextPreviewComponent],
  templateUrl: './media-management.component.html',
  styleUrl: './media-management.component.css',
  providers: [MessageService]
})
export class MediaManagementComponent {
    products: Product[] = [
      {
        id: '1',
        name: 'Product 1',
        description: 'This is a great product.',
        price: 99.99,
        quantity: 10,
        media: [
          { id: '1', imagePath: 'https://framerusercontent.com/images/H2lD1wbQgNQJOFWzv6bKAY6ng.png', productId: '1' },
          { id: '2', imagePath: 'https://framerusercontent.com/images/6isPgVJrEoLEhJsfo0Ij8ldZaZg.png', productId: '1' },
          { id: '3', imagePath: 'https://framerusercontent.com/images/H2lD1wbQgNQJOFWzv6bKAY6ng.png', productId: '1' },
          { id: '4', imagePath: 'https://framerusercontent.com/images/6isPgVJrEoLEhJsfo0Ij8ldZaZg.png', productId: '1' },
          { id: '5', imagePath: 'https://framerusercontent.com/images/H2lD1wbQgNQJOFWzv6bKAY6ng.png', productId: '1' },
          { id: '6', imagePath: 'https://framerusercontent.com/images/6isPgVJrEoLEhJsfo0Ij8ldZaZg.png', productId: '1' },
          { id: '7', imagePath: 'https://framerusercontent.com/images/H2lD1wbQgNQJOFWzv6bKAY6ng.png', productId: '1' },
          { id: '8', imagePath: 'https://framerusercontent.com/images/6isPgVJrEoLEhJsfo0Ij8ldZaZg.png', productId: '1' },
          { id: '9', imagePath: 'https://framerusercontent.com/images/H2lD1wbQgNQJOFWzv6bKAY6ng.png', productId: '1' },
          { id: '10', imagePath: 'https://framerusercontent.com/images/6isPgVJrEoLEhJsfo0Ij8ldZaZg.png', productId: '1' }
        ]
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'This is another awesome product.',
        price: 149.99,
        quantity: 5,
        media: [   
          { id: '2', imagePath: 'https://framerusercontent.com/images/H2lD1wbQgNQJOFWzv6bKAY6ng.png', productId: '2' }
        ]
      }
    ];

    selectedProduct: Product | null = null;
    isUploadImageVisible: boolean = false;
    files: File[] = [];
    totalSize : number = 0;
    totalSizePercent : number = 0;
    showGallery: boolean = false;

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

    constructor(private config: PrimeNGConfig, private route: ActivatedRoute, private messageService: MessageService) {}

    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        const productId = params['product_id'];
        if (productId) {
          // Find the product in the products array based on the product_id from the URL
          const product = this.products.find(p => p.id === productId);
          
          if (product) {
            this.selectedProduct = product;
            console.log('Default selectedProduct:', this.selectedProduct);
          } else {
            console.log('Product not found with ID:', productId);
          }
        } else {
          console.log('No product ID in URL');
        }
      });
    }

    choose(event: Event, callback: () => void) {
      callback();
    }

    onRemoveTemplatingFile(event: Event, file: any, removeFileCallback: (arg0: Event, arg1: number) => void, index: number) {
      removeFileCallback(event, index);
      this.totalSize -= parseInt(this.formatSize(file.size));
      this.totalSizePercent = this.totalSize / 10;
    }

    onClearTemplatingUpload(clear: () => void) {
        clear();
        this.totalSize = 0;
        this.totalSizePercent = 0;
    }

    onTemplatedUpload() {
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    }

    onSelectedFiles(event: FileSelectEvent) {
        this.files = event.currentFiles;
        this.files.forEach((file) => {
            this.totalSize += parseInt(this.formatSize(file.size));
        });
        this.totalSizePercent = this.totalSize / 10;
    }

    uploadEvent(callback: () => void) {
        callback();
    }

    formatSize(bytes: number) {
        const k = 1024;
        const dm = 3;
        const sizes = this.config.translation.fileSizeTypes || ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) {
            return `0 ${sizes[0]}`;
        }

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

        return `${formattedSize} ${sizes[i]}`;
    }
      

    handleUpladImagesToggle() {
      if (this.selectedProduct) this.isUploadImageVisible = !this.isUploadImageVisible;
    }

    onBasicUploadAuto(event: FileUploadEvent) {
      this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Auto Mode' });

      if (this.selectedProduct) {
        event.files.forEach((file: any) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const imageUrl = e.target.result;
            // console.log("hhhhhhhhhhhhhhhhhh", imageUrl);
            this.selectedProduct?.media.push({
              id: (Math.random() * 10000).toString(),  // Random ID for simplicity
              imagePath: imageUrl,
              productId: this.selectedProduct?.id || ''
            });
          };
          reader.readAsDataURL(file);
        });
      }
    }

    trackByProductId(index: number, product: Product): string {
      return product.id;
    }

    handleSelectProduct(product: Product) {
      this.selectedProduct = product;
      this.showGallery = false; // Reset to false to remove the UI
      setTimeout(() => {
          this.showGallery = true; // Set to true to re-add the UI
      }, 0);
    }
}
