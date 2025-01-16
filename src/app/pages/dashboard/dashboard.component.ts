import { Component, ElementRef, ViewChild } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import {ACTION, PaginatedResponse, Product, ProductMedia, ToastMessage, UserPayload} from '../../types';
import {TableModule, TablePageEvent} from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import {MenuItem, MessageService} from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import {ProductManagementComponent} from "../../components/product-management/product-management.component";
import {EditProductComponent} from "../../components/edit-product/edit-product.component";
import {AddProductComponent} from "../../components/add-product/add-product.component";
import {AuthService} from "../../services/auth/auth-service.service";
import {BehaviorSubject, combineLatest, Observable, of, startWith, switchMap, takeUntil} from "rxjs";
import {ProductService} from "../../services/product/product.service";
import {DeleteProductComponent} from "../../components/delete-product/delete-product.component";
import {MediaLayoutComponent} from "../../components/media-layout/media-layout.component";
import {catchError, finalize, map} from "rxjs/operators";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-dashboard',
  standalone: true,
    imports: [AvatarModule, CommonModule, FormsModule,
        ProductManagementComponent, TableModule, ButtonModule, TagModule, InputIconModule, InputTextModule, MultiSelectModule,
        IconFieldModule,
        DropdownModule,
        MenuModule, AddProductComponent, EditProductComponent, DeleteProductComponent, MediaLayoutComponent, ToastModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
    providers: [MessageService] // Ensure MessageService is provided here
})
export class DashboardComponent {
    readonly ACTION = ACTION;
    user$: Observable<UserPayload>;

    private pageSubject = new BehaviorSubject<{ page: number; size: number }>({
        page: 0,
        size: 10
    });

    productMedias$: Observable<PaginatedResponse<ProductMedia> | null>;
    loading = new BehaviorSubject<boolean>(false);
    loading$ = this.loading.asObservable();

    constructor(
        private authService: AuthService,
        private productService: ProductService,
        private messageService: MessageService
    ) {
        this.user$ = this.authService.userState$;

        this.productMedias$ = combineLatest([this.user$, this.pageSubject]).pipe(
            switchMap(([user, pagination]) => {
                this.loading.next(true);
                return this.productService.getProductsWithMediaByUserId(
                    user.id,
                    pagination.page,
                    pagination.size
                ).pipe(
                    map(response => response.data),
                    catchError(error => {
                        this.messageService.add({severity: "error", summary: "Failed to fetch product.", detail: error?.error?.message || "Failed to fetch product"});
                        return of();
                    }),
                    finalize(() => this.loading.next(false))
                )
            }),
            startWith(null)
        )

    }

    onNextPage(currentPage: number, totalPages: number): void {
        if (currentPage < totalPages - 1) {
            this.pageSubject.next({
                page: currentPage + 1,
                size: this.pageSubject.value.size
            });
        }
    }

    onPreviousPage(currentPage: number): void {
        if (currentPage > 0) {
            this.pageSubject.next({
                page: currentPage - 1,
                size: this.pageSubject.value.size
            });
        }
    }

    isFirstPage(page: number): boolean {
        return page === 0;
    }

    isLastPage(currentPage: number, totalPages: number): boolean {
        return currentPage === totalPages - 1;
    }

    reset(): void {
        this.pageSubject.next({ page: 0, size: 10 });
    }

    onPageChange(event: TablePageEvent): void {
        this.pageSubject.next({
            page: event.first / event.rows,
            size: event.rows
        });
    }

    onActionProduct(event: ToastMessage) {
        this.messageService.add(event);

        // Trigger a refresh by resubmitting the current page and size
        const currentPageData = this.pageSubject.value;
        this.pageSubject.next({ ...currentPageData });
    }
}


// ngOnInit(): void {
//     this.loadProductsWithMedia();
// }

// loadProductsWithMedia(): void {
//     this.user$
//         .pipe(
//             switchMap(user =>
//                 this.productService.getProductsWithMediaByUserId(user.id, this.currentPage, this.pageSize)
//             )
//         )
//         .subscribe({
//             next: (response) => {
//                 this.productMedias = response.data;
//                 console.log(response)
//             },
//             error: (err) => {
//                 console.error('Error loading products:', err);
//                 this.alertService.error('Error', 'Failed to load products.');
//             }
//         });
// }

// onNextPage(): void {
//     if (this.productMedias && this.currentPage < this.productMedias.page.totalPages - 1) {
//         this.currentPage++;
//         this.loadProductsWithMedia();
//     }
// }
//
// onPreviousPage(): void {
//     if (this.currentPage > 0) {
//         this.currentPage--;
//         this.loadProductsWithMedia();
//     }
// }

// trackByProductId(index: number, product: Product): string {
//   return product.id;
// }
