import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {ProductMedia, UserPayload} from "../../types";
import {CartService} from "../../services/cart/cart.service";
import {CardModule} from "primeng/card";
import {MediaService} from "../../services/media/media.service";
import {TooltipModule} from "primeng/tooltip";
import {TextPreviewComponent} from "../text-preview/text-preview.component";
import {RouterLink, RouterLinkActive} from "@angular/router";
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import {AuthService} from "../../services/auth/auth.service";

@Component({
    selector: 'app-product',
    imports: [
        CommonModule,
        ButtonModule,
        CardModule,
        TooltipModule,
        TextPreviewComponent,
        RouterLink,
        RouterLinkActive,
        BadgeModule,
        RippleModule
    ],
    standalone: true,
    templateUrl: './product.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent implements OnInit, OnDestroy {
    @Input({required: true}) product!: ProductMedia;
    @Input() showQuickActions: boolean = true;
    @Input() imageHeight: string = 'h-72';
    @Input() enableHover: boolean = true;

    private destroy$ = new Subject<void>();
    private addToCartSubject = new Subject<Event>();

    // Signals for reactive state management
    isLoading = signal(false);
    imageError = signal(false);

    // Computed values
    stockStatus = computed(() => {
        const quantity = this.product?.product?.quantity || 0;
        if (quantity === 0) return { label: 'Out of Stock', class: 'bg-red-600' };
        if (quantity <= 5) return { label: 'Low Stock', class: 'bg-orange-500' };
        return { label: 'In Stock', class: 'bg-green-600' };
    });

    isInCart = computed(() => {
        return this.cartService.isProductInCart(this.product?.product?.id);
    });

    formattedPrice = computed(() => {
        const price = this.product?.product?.price || 0;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    });

    primaryImage = computed(() => {
        if (!this.product?.media?.length) return null;
        return this.getMedia(this.product.product.id, this.product.media[0].imagePath);
    });

    user: UserPayload | null = null;

    constructor(
        public cartService: CartService,
        private mediaService: MediaService,
        private authService: AuthService
    ) {}

    ngOnInit() {

        this.authService.userState$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.user = user;
            })

        // Debounce add to cart clicks to prevent spam
        this.addToCartSubject.pipe(
            debounceTime(300),
            takeUntil(this.destroy$)
        ).subscribe(event => this.handleAddToCart(event));
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getMedia(productId: string, imagePath: string): string | null {
        return this.mediaService.getMedia(productId, imagePath);
    }

    addCart(event: Event) {
        event.stopPropagation();
        this.addToCartSubject.next(event);
    }

    private handleAddToCart(event: Event) {
        if (this.product.product.quantity === 0) {
            return; // Prevent adding out-of-stock items
        }

        this.isLoading.set(true);

        try {
            if (this.isInCart()) {
                this.cartService.removeFromCart(this.product.product.id);
            } else {
                this.cartService.addToCart(this.product);
            }
            this.cartService.toggleCart(event);
        } catch (error) {
            console.error('Error managing cart:', error);
        } finally {
            this.isLoading.set(false);
        }
    }

    canShowCart(): boolean {
        return !!(this.user?.isAuthenticated && this.user.role === 'CLIENT')
    }

    onImageError() {
        this.imageError.set(true);
    }

    onImageLoad() {
        this.imageError.set(false);
    }

    isProductInCart(): boolean {
        return this.cartService.isProductInCart(this.product?.product?.id);
    }

    trackByImageId(index: number, media: any): string {
        return media.id || index;
    }
}




















// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ButtonModule } from 'primeng/button';
// import { ProductMedia} from "../../types";
// import {CartService} from "../../services/cart/cart.service";
// import {CardModule} from "primeng/card";
// import {MediaService} from "../../services/media/media.service";
// import {TooltipModule} from "primeng/tooltip";
// import {TextPreviewComponent} from "../text-preview/text-preview.component";
// import {RouterLink, RouterLinkActive} from "@angular/router";
//
// @Component({
//     selector: 'app-product',
//     imports: [CommonModule, ButtonModule, CardModule, TooltipModule, TextPreviewComponent, RouterLink, RouterLinkActive],
//     standalone: true,
//     templateUrl: './product.component.html',
// })
// export class ProductComponent {
//   @Input({required: true}) product!: ProductMedia;
//
//   constructor(public cartService: CartService, private mediaService: MediaService) {}
//
//   getMedia(productId: string, imagePath: string): string | null {
//     return this.mediaService.getMedia(productId, imagePath)
//   }
//
//   addCart(event: Event) {
//       event.stopPropagation()
//       this.cartService.addToCart(this.product)
//       this.cartService.toggleCart(event);
//   }
//
//   isProductInCart(): boolean {
//       // return this.cartService.isProductInCart(this.product.product.id);
//       return false;
//   }
// }
