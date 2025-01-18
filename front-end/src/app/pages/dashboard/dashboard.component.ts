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
    products: PaginatedResponse<ProductMedia> | null = null;
    currentPage: number = 0;
    pageSize: number = 10;
    loading: boolean = false

    constructor(
        private authService: AuthService,
        private productService: ProductService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.user$ = this.authService.userState$;
    }

    ngOnInit() {
        this.loadProducts()
    }

    loadProducts(): void {
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
                    this.router.navigate(['/error', {
                        message: err?.error?.message || "Failed to load products",
                        status: err?.error?.status || 500
                    }])
                }
            });
    }

    // Handle the "Next Page" action
    onNextPage(currentPage: number, totalPages: number): void {
        if (currentPage < totalPages - 1) {
            this.currentPage = currentPage + 1;
            this.loadProducts();
        }
    }

    // Handle the "Previous Page" action
    onPreviousPage(currentPage: number): void {
        if (currentPage > 0) {
            this.currentPage = currentPage - 1;
            this.loadProducts();
        }
    }

    // Check if the current page is the first page
    isFirstPage(page: number): boolean {
        return page === 0;
    }

    // Check if the current page is the last page
    isLastPage(currentPage: number, totalPages: number): boolean {
        return currentPage === totalPages - 1;
    }

    // Reset pagination to the first page
    reset(): void {
        this.currentPage = 0;
        this.pageSize = 10;
        this.loadProducts();
    }

    // Handle table pagination events
    onPageChange(event: TablePageEvent): void {
        this.currentPage = event.first / event.rows;
        this.pageSize = event.rows;
        this.loadProducts();
    }

    onActionProduct(event: ToastMessage) {
        this.messageService.add(event);
        this.loadProducts()
    }
}