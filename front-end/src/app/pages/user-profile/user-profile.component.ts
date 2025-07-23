import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, takeUntil, BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { TimelineModule } from 'primeng/timeline';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

import {
    UserPayload,
    Order,
    OrderStatus,
    PaymentStatus,
    Role,
    PaginatedResponse,
    UserStatisticsDTO, SellerStatisticsDTO, ApiResponse
} from '../../types';
import { OrderService } from "../../services/order/order.service";
import { AuthService } from "../../services/auth/auth.service";
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { OrderSearchParams } from "../../services/order/order.service";
import { environment } from "../../environment";
import { UserService } from '../../services/user/user.service';
import {FileData, FileService} from "../../services/file-service/file-service.service";

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        TabViewModule,
        TableModule,
        TagModule,
        ProgressBarModule,
        ChartModule,
        AvatarModule,
        FileUploadModule,
        ToastModule,
        ConfirmDialogModule,
        DialogModule,
        DropdownModule,
        CalendarModule,
        PaginatorModule,
        SkeletonModule,
        ChipModule,
        DividerModule,
        InputSwitchModule,
        ProgressSpinnerModule,
        BadgeModule,
        TimelineModule,
        RippleModule,
        TooltipModule,
        RouterLink,
        RouterLinkActive
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './user-profile.component.html',
    styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private searchSubject = new BehaviorSubject<string>('');

    user$: Observable<UserPayload>;
    user: UserPayload | null = null;
    editProfileForm: FormGroup;
    searchForm: FormGroup;
    passwordForm: FormGroup;
    Role = Role;

    showAvatarDialog = false;
    selectedAvatar: string | null = null;

    orders: Order[] = [];
    filteredOrders: Order[] = [];
    loading = false;
    statsLoading = false;
    ordersLoading = false;

    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalOrders = 0;
    totalPages = 0;

    userStats: UserStatisticsDTO | SellerStatisticsDTO | null = null;

    currentFile: FileData | null = null;

    // Filter options
    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Pending', value: OrderStatus.PENDING },
        { label: 'Delivered', value: OrderStatus.DELIVERED },
        { label: 'Cancelled', value: OrderStatus.CANCELLED }
    ];

    paymentStatusOptions = [
        { label: 'All Payment Status', value: null },
        { label: 'Pending', value: PaymentStatus.PENDING },
        { label: 'Completed', value: PaymentStatus.COMPLETED },
        { label: 'Failed', value: PaymentStatus.FAILED },
        { label: 'Refunded', value: PaymentStatus.REFUNDED }
    ];


    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private orderService: OrderService,
        private authService: AuthService,
        public router: Router,
        private userService: UserService,
        private fileService: FileService,
    ) {
        this.user$ = this.authService.userState$;
        this.editProfileForm = this.createEditProfileForm();
        this.searchForm = this.createSearchForm();
        this.passwordForm = this.createPasswordForm();
        this.fileService.fileData$.subscribe(fileData => {
            this.currentFile = fileData;
        });
    }

    ngOnInit(): void {
        this.loadUserData();
        this.setupSearch();
        this.loadStatistics();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createEditProfileForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
        });
    }

    async onFileChange(event: Event) {
        const result = await this.fileService.onFileSelected(event, {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png']
        });

        if (!result.isValid) {
            console.error('File validation failed:', result.errors);
        }
    }

    removeFile() {
        this.fileService.removeFile();
        this.fileService.resetFileInput('avatar');
    }

    private createSearchForm(): FormGroup {
        return this.fb.group({
            keyword: [''],
            status: [null],
            paymentStatus: [null],
            startDate: [null],
            endDate: [null]
        });
    }

    private createPasswordForm(): FormGroup {
        return this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    private passwordMatchValidator(form: FormGroup) {
        const newPassword = form.get('newPassword');
        const confirmPassword = form.get('confirmPassword');

        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
            confirmPassword.setErrors({ mismatch: true });
            return { mismatch: true };
        }

        return null;
    }

    private setupSearch(): void {
        combineLatest([
            this.searchForm.valueChanges,
            this.searchSubject.asObservable()
        ]).pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(([formValue, searchTerm]) => {
            this.currentPage = 0;
            this.searchOrders();
        });

        this.searchOrders();
    }

    private loadUserData(): void {
        this.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.user = user;
                if (user) {
                    this.editProfileForm.patchValue({
                        name: user.name || '',
                        email: user.email || '',
                    });

                    this.searchOrders();
                }
            });
    }

    private loadStatistics(): void {
        if (!this.user) return;

        this.statsLoading = true;
        if (this.user.role == Role.SELLER) {
            this.loadSellerStatistics();
        } else {
            this.loadUserStatistics();
        }
    }

    private loadSellerStatistics(): void {
        this.orderService.getSellerOrderStats()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.statsLoading = false)
            )
            .subscribe({
                next: (stats) => {
                    this.userStats = stats;
                },
                error: (error) => {
                    console.error('Error loading seller statistics:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Statistics Error',
                        detail: 'Unable to load order statistics'
                    });
                }
            });
    }

    private loadUserStatistics(): void {
        this.orderService.getUserOrderStats()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.statsLoading = false)
            )
            .subscribe({
                next: (stats) => {
                    this.userStats = stats;
                    console.log("stats", this.userStats)
                },
                error: (error) => {
                    console.error('Error loading user statistics:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Statistics Error',
                        detail: 'Unable to load order statistics'
                    });
                }
            });
    }

    public searchOrders(): void {
        if (!this.user) return;

        this.ordersLoading = true;
        const formValue = this.searchForm.value;
        const searchTerm = this.searchSubject.value;

        const searchParams: OrderSearchParams = {
            userId: this.user.id,
            keyword: searchTerm || formValue.keyword || undefined,
            status: formValue.status || undefined,
            paymentStatus: formValue.paymentStatus || undefined,
            startDate: formValue.startDate || undefined,
            endDate: formValue.endDate || undefined,
            page: this.currentPage,
            size: this.pageSize
        };

        this.orderService.searchOrders(searchParams)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.ordersLoading = false)
            )
            .subscribe({
                next: (response: ApiResponse<PaginatedResponse<Order>>) => {
                    this.orders = response.data.content;
                    this.filteredOrders = response.data.content;
                    this.totalOrders = response.data.page.totalElements;
                    this.totalPages = response.data.page.totalPages;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Search Error',
                        detail: 'Unable to load orders'
                    });
                    this.orders = [];
                    this.filteredOrders = [];
                    this.totalOrders = 0;
                }
            });
    }

    onSearchInput(event: Event): void {
        const searchTerm = (event.target as HTMLInputElement).value;
        this.searchSubject.next(searchTerm);
    }

    onPageChange(event: any): void {
        this.currentPage = event.page;
        this.pageSize = event.rows;
        this.searchOrders();
    }

    clearFilters(): void {
        this.searchForm.reset();
        this.searchSubject.next('');
    }

    getOrderStatusSeverity(status: OrderStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const severities: { [key: string]: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' } = {
            [OrderStatus.DELIVERED]: 'success',
            [OrderStatus.PENDING]: 'secondary',
            [OrderStatus.CANCELLED]: 'danger'
        };

        return severities[status] || 'secondary';
    }

    getPaymentStatusSeverity(status: PaymentStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const severities: { [key: string]: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' } = {
            [PaymentStatus.COMPLETED]: 'success',
            [PaymentStatus.PENDING]: 'warn',
            [PaymentStatus.FAILED]: 'danger',
            [PaymentStatus.REFUNDED]: 'info'
        };

        return severities[status] || 'secondary';
    }

    reorderOrder(order: Order): void {
        this.confirmationService.confirm({
            message: `Do you want to reorder items from order #${order.id}?`,
            header: 'Confirm Reorder',
            icon: 'pi pi-shopping-cart',
            accept: () => {
                this.orderService.reorderFromOrder(order.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (response) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Reorder Successful',
                                detail: 'Items have been added to your cart. Redirecting to checkout...'
                            });
                            setTimeout(() => this.router.navigate(['/checkout']), 1500);
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Reorder Failed',
                                detail: 'Unable to reorder at this time. Please try again.'
                            });
                        }
                    });
            }
        });
    }

    cancelOrder(order: Order): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to cancel order #${order.id}?`,
            header: 'Confirm Cancellation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const cancelRequest = {
                    orderId: order.id,
                    reason: 'Customer requested cancellation'
                };

                this.orderService.cancelOrder(cancelRequest)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (updatedOrder) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Order Cancelled',
                                detail: `Order #${order.id} has been cancelled successfully.`
                            });
                            this.searchOrders();
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Cancellation Failed',
                                detail: 'Unable to cancel order. Please contact support.'
                            });
                        }
                    });
            }
        });
    }

    deleteOrder(order: Order): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete order #${order.id}? This action cannot be undone.`,
            header: 'Confirm Deletion',
            icon: 'pi pi-trash',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.orderService.deleteOrder(order.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Order Deleted',
                                detail: `Order #${order.id} has been deleted successfully.`
                            });
                            this.searchOrders();
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Deletion Failed',
                                detail: 'Unable to delete order. Please try again.'
                            });
                        }
                    });
            }
        });
    }

    downloadReceipt(order: Order): void {
        this.orderService.getOrderReceipt(order.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `receipt-${order.id}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Download Failed',
                        detail: 'Unable to download receipt. Please try again.'
                    });
                }
            });
    }

    saveEditProfile(): void {
        if (!this.user) return;
        if (this.editProfileForm.valid) {
            const formData = this.editProfileForm.value;
            let updatePayload: FormData = new FormData();
            updatePayload.append('name', formData.name);
            updatePayload.append('email', formData.email);

            this.userService.updateUser(this.user.id, updatePayload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (updatedUser) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Profile Updated',
                            detail: 'Your profile has been updated successfully.'
                        });
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Update Failed',
                            detail: 'Unable to update profile. Please try again.'
                        });
                    }
                });
        } else {
            this.markFormGroupTouched(this.editProfileForm);
            this.messageService.add({
                severity: 'warn',
                summary: 'Form Invalid',
                detail: 'Please fill in all required fields correctly.'
            });
        }
    }

    changePassword(): void {
        if (this.passwordForm.valid) {
            const formData = this.passwordForm.value;

            let passwordChangeRequest: FormData = new FormData();
            passwordChangeRequest.append('prev_password', formData.currentPassword);
            passwordChangeRequest.append('new_password', formData.newPassword);

            if (!this.user) return
            this.userService.updateUser(this.user.id, passwordChangeRequest)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Password Changed',
                            detail: 'Your password has been changed successfully.'
                        });
                        // this.showPasswordDialog = false;
                        this.passwordForm.reset();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Password Change Failed',
                            detail: error.error?.message || 'Unable to change password. Please try again.'
                        });
                    }
                });
        } else {
            this.markFormGroupTouched(this.passwordForm);
            this.messageService.add({
                severity: 'warn',
                summary: 'Form Invalid',
                detail: 'Please fill in all required fields correctly.'
            });
        }
    }

    uploadAvatar(): void {
        if (!this.user) return;

        const formData = new FormData();
        if (this.currentFile && this.currentFile.file
            && this.currentFile.fileName) formData.append('avatar', this.currentFile.file, this.currentFile.fileName);

        this.userService.updateUser(this.user.id, formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Avatar Updated',
                        detail: 'Your profile picture has been updated successfully.'
                    });
                    // this.loadUserData(); // Refresh user data
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Upload Failed',
                        detail: 'Unable to upload avatar. Please try again.'
                    });
                }
            });

    }

    deleteAccount(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
            header: 'Delete Account',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                if (!this.user) return;
                this.userService.deleteUser(this.user.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Account Deleted',
                                detail: 'Your account has been deleted successfully.'
                            });

                            // Logout and redirect to home
                            setTimeout(() => {
                                this.authService.logout();
                                this.router.navigate(['/']);
                            }, 2000);
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Deletion Failed',
                                detail: 'Unable to delete account. Please contact support.'
                            });
                        }
                    });
            }
        });
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    isFieldInvalid(form: FormGroup, fieldName: string): boolean {
        const field = form.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(form: FormGroup, fieldName: string): string {
        const field = form.get(fieldName);
        if (field && field.errors && (field.dirty || field.touched)) {
            if (field.errors['required']) {
                return `${fieldName} is required`;
            }
            if (field.errors['email']) {
                return 'Please enter a valid email address';
            }
            if (field.errors['minlength']) {
                return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
            }
            if (field.errors['pattern']) {
                return `${fieldName} format is invalid`;
            }
            if (field.errors['mismatch']) {
                return 'Passwords do not match';
            }
        }
        return '';
    }

    canCancelOrder(order: Order): boolean {
        const cancellableStatuses = [OrderStatus.PENDING];
        return cancellableStatuses.includes(order.status);
    }

    canReorder(order: Order): boolean {
        return order.status !== OrderStatus.CANCELLED;
    }

    // Format helpers
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    closeAvatarDialog(): void {
        this.showAvatarDialog = false;
        this.selectedAvatar = null;
    }

    isUserStats(): boolean {
        return !!(this.userStats && 'totalSpent' in this.userStats);
    }

    isSellerStats(): boolean {
        return !!(this.userStats && 'totalRevenue' in this.userStats);
    }

    getUserStats(): UserStatisticsDTO {
        return this.userStats as UserStatisticsDTO;
    }

    getSellerStats(): SellerStatisticsDTO {
        return this.userStats as SellerStatisticsDTO;
    }

    protected readonly environment = environment;
}