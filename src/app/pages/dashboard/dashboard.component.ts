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
import {EditProductComponent} from "../../components/edit-product/edit-product.component";
import {AddProductComponent} from "../../components/add-product/add-product.component";
import {AuthService} from "../../services/auth/auth-service.service";
import {BehaviorSubject, combineLatest, Observable, of, startWith, switchMap, takeUntil} from "rxjs";
import {ProductService} from "../../services/product/product.service";
import {DeleteProductComponent} from "../../components/delete-product/delete-product.component";
import {MediaLayoutComponent} from "../../components/media-layout/media-layout.component";
import {catchError, finalize, map} from "rxjs/operators";
import {ToastModule} from "primeng/toast";
import {Router} from "@angular/router";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [AvatarModule, CommonModule, FormsModule,
        TableModule, ButtonModule, TagModule, InputIconModule, InputTextModule, MultiSelectModule,
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
        private messageService: MessageService,
        private router: Router
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
                        this.router.navigate(['/error', {
                            message: error?.error?.message || "Failed to load the product",
                            status: error?.error?.status || 500
                        }])
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