import { Component, ElementRef, ViewChild } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import {ACTION, PaginatedResponse, Product, ProductMedia, User, UserPayload} from '../../types';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import {MenuItem, MessageService} from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import {ProductManagementComponent} from "../../components/product-management/product-management.component";
import {EditProductComponent} from "../../components/edit-product/edit-product.component";
import {AddProductComponent} from "../../components/add-product/add-product.component";
import {AuthService} from "../../services/auth/auth-service.service";
import {Observable, of, switchMap} from "rxjs";
import {ProductService} from "../../services/product/product.service";
import {AlertService} from "../../services/alert/alert.service";
import {DeleteProductComponent} from "../../components/delete-product/delete-product.component";
import {MediaLayoutComponent} from "../../components/media-layout/media-layout.component";
import {catchError, finalize} from "rxjs/operators";

@Component({
  selector: 'app-dashboard',
  standalone: true,
    imports: [AvatarModule, CommonModule, FormsModule,
        ProductManagementComponent, TableModule, ButtonModule, TagModule, InputIconModule, InputTextModule, MultiSelectModule,
        IconFieldModule,
        DropdownModule,
        MenuModule, AddProductComponent, EditProductComponent, DeleteProductComponent, MediaLayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
    providers: [MessageService] // Ensure MessageService is provided here
})
export class DashboardComponent {
    productMedias: PaginatedResponse<ProductMedia> | null = null;
    currentPage: number = 0;
    pageSize: number = 10;

    isDisplayMenu: { [key: string]: boolean } = {};
    user$: Observable<UserPayload>;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private productService: ProductService,
        private alertService: AlertService,
        private messageService: MessageService
    ) {
        this.user$ = this.authService.userState$;
    }

    ngOnInit(): void {
        this.loadProductsWithMedia();
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
                    this.productMedias = response.data;
                },
                error: (err) => {
                    console.error('Error loading products:', err);
                    this.alertService.error('Error', 'Failed to load products.');
                }
            });
    }

    onNextPage(): void {
        if (this.productMedias && this.currentPage < this.productMedias.page.totalPages - 1) {
            this.currentPage++;
            this.loadProductsWithMedia();
        }
    }

    onPreviousPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.loadProductsWithMedia();
        }
    }

    // trackByProductId(index: number, product: Product): string {
    //   return product.id;
    // }

    toggleMenu(event: MouseEvent, productId: string) {
      this.isDisplayMenu[productId] = !this.isDisplayMenu[productId];
    }

    protected readonly ACTION = ACTION;
}
