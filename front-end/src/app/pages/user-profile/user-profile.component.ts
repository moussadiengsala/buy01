import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, takeUntil, BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged } from 'rxjs';

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

import { User, UserPayload, Order, OrderStatus, PaymentStatus  } from '../../types';
import { InputSwitch } from "primeng/inputswitch";
import { OrderService } from "../../services/order/order.service";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from '@angular/router';
import {OrderSearchParams, OrderStats} from "../../services/order/order.service"

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
        InputSwitch
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
    profileForm: FormGroup;
    editProfileForm: FormGroup;
    searchForm: FormGroup;

    // Dialog states
    showEditDialog = false;
    showAvatarDialog = false;
    showOrderDialog = false;
    showStatsDialog = false;
    selectedOrder: Order | null = null;
    selectedAvatar: string | null = null;

    // Orders and filtering
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    loading = false;

    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalOrders = 0;

    // Statistics
    userStats: OrderStats | null = null;
    chartData: any = {};
    chartOptions: any = {};

    // Filter options
    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Pending', value: OrderStatus.PENDING },
        { label: 'Processing', value: OrderStatus.PROCESSING },
        { label: 'Shipped', value: OrderStatus.SHIPPED },
        { label: 'Delivered', value: OrderStatus.DELIVERED },
        { label: 'Cancelled', value: OrderStatus.CANCELLED }
    ];

    paymentStatusOptions = [
        { label: 'All Payment Status', value: null },
        { label: 'Pending', value: PaymentStatus.PENDING },
        { label: 'Paid', value: PaymentStatus.COMPLETED },
        { label: 'Failed', value: PaymentStatus.FAILED },
        { label: 'Refunded', value: PaymentStatus.REFUNDED }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private orderService: OrderService,
        private authService: AuthService,
        private router: Router
    ) {
        this.user$ = this.authService.userState$;
        this.profileForm = this.createProfileForm();
        this.editProfileForm = this.createEditProfileForm();
        this.searchForm = this.createSearchForm();
        this.initializeChartData();
    }

    ngOnInit(): void {
        this.loadUserData();
        this.setupSearch();
        this.loadUserStatistics();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createProfileForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            emailNotifications: [true],
            marketingEmails: [false],
            smsNotifications: [false]
        });
    }

    private createEditProfileForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]]
        });
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

    private setupSearch(): void {
        // Combine search form changes with search subject
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

        // Initial search
        this.searchOrders();
    }

    private loadUserData(): void {
        this.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.user = user;
                this.profileForm.patchValue({
                    name: user.name,
                    email: user.email
                });

                this.editProfileForm.patchValue({
                    name: user.name,
                    email: user.email
                });

                // Load orders when user is available
                this.searchOrders();
            });
    }

    private loadUserStatistics(): void {
        if (!this.user) return;

        this.orderService.getUserOrderStats(this.user.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(stats => {
                this.userStats = stats;
                this.updateChartData(stats);
            });
    }

    private updateChartData(stats: OrderStats): void {
        // Monthly spending chart
        this.chartData = {
            labels: "",// stats.monthlyStats.map(stat => stat.month),
            datasets: [{
                label: 'Monthly Spending',
                data: null,//stats.monthlyStats.map(stat => stat.revenue),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value: any) => '$' + value.toFixed(2)
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        };
    }

    private initializeChartData(): void {
        this.chartData = {
            labels: [],
            datasets: [{
                label: 'Monthly Spending',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
    }

    public searchOrders(): void {
        if (!this.user) return;

        this.loading = true;
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
                finalize(() => this.loading = false)
            )
            .subscribe(orders => {
                this.orders = orders;
                this.filteredOrders = orders;
                this.totalOrders = orders.length;
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
            [OrderStatus.SHIPPED]: 'info',
            [OrderStatus.PROCESSING]: 'warn',
            [OrderStatus.PENDING]: 'secondary',
            [OrderStatus.CANCELLED]: 'danger'
        };

        return severities[status] || 'secondary';
    }

    getPaymentStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const severities: { [key: string]: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' } = {
            [PaymentStatus.COMPLETED]: 'success',
            [PaymentStatus.PENDING]: 'warn',
            [PaymentStatus.FAILED]: 'danger',
            [PaymentStatus.REFUNDED]: 'info'
        };

        return severities[status] || 'secondary';
    }

    viewOrder(order: Order): void {
        this.selectedOrder = order;
        this.showOrderDialog = true;
    }

    reorderOrder(order: Order): void {
        this.confirmationService.confirm({
            message: `Do you want to reorder ${order.id}?`,
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
                            // Redirect to checkout
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
            message: `Are you sure you want to cancel order ${order.id}?`,
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
                                detail: `Order ${order.id} has been cancelled successfully.`
                            });
                            // Refresh orders
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
            message: `Are you sure you want to delete order ${order.id}? This action cannot be undone.`,
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
                                detail: `Order ${order.id} has been deleted successfully.`
                            });
                            // Refresh orders
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

    trackOrder(order: Order): void {
        this.orderService.trackOrder(order.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (trackingInfo) => {
                    // Show tracking information in a dialog or navigate to tracking page
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Tracking Information',
                        detail: `Tracking ID: ${trackingInfo.trackingId || 'Not available yet'}`
                    });
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Tracking Unavailable',
                        detail: 'Tracking information is not available for this order yet.'
                    });
                }
            });
    }

    requestRefund(order: Order): void {
        this.confirmationService.confirm({
            message: `Request a refund for order ${order.id}?`,
            header: 'Request Refund',
            icon: 'pi pi-money-bill',
            accept: () => {
                this.orderService.requestRefund(order.id, 'Customer requested refund')
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (updatedOrder) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Refund Requested',
                                detail: 'Your refund request has been submitted and will be processed within 3-5 business days.'
                            });
                            this.searchOrders();
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Refund Request Failed',
                                detail: 'Unable to process refund request. Please contact support.'
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

    showStatistics(): void {
        this.showStatsDialog = true;
    }

    updateProfile(): void {
        if (this.profileForm.valid) {
            const formData = this.profileForm.value;
            // Implement profile update logic
            this.messageService.add({
                severity: 'success',
                summary: 'Profile Updated',
                detail: 'Your profile has been updated successfully.'
            });
        }
    }

    saveProfile(): void {
        if (this.editProfileForm.valid) {
            const formData = this.editProfileForm.value;
            // Implement profile save logic
            this.messageService.add({
                severity: 'success',
                summary: 'Profile Saved',
                detail: 'Your profile changes have been saved.'
            });
            this.showEditDialog = false;
        }
    }

    onAvatarSelect(event: any): void {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.selectedAvatar = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    uploadAvatar(): void {
        if (this.selectedAvatar) {
            // Implement avatar upload logic
            this.messageService.add({
                severity: 'success',
                summary: 'Avatar Updated',
                detail: 'Your avatar has been updated successfully.'
            });
            this.showAvatarDialog = false;
            this.selectedAvatar = null;
        }
    }

    deleteAccount(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete your account? This action cannot be undone.',
            header: 'Confirm Account Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                // Implement account deletion logic
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Account Deletion',
                    detail: 'Your account deletion request has been submitted.'
                });
            }
        });
    }

    // Utility methods
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    canCancelOrder(order: Order): boolean {
        return order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.PROCESSING;
    }

    canRequestRefund(order: Order): boolean {
        return order.orderStatus === OrderStatus.DELIVERED && order.paymentStatus === PaymentStatus.COMPLETED;
    }

    canTrackOrder(order: Order): boolean {
        return order.orderStatus === OrderStatus.SHIPPED || order.orderStatus === OrderStatus.DELIVERED;
    }
}

// Add this to handle finalize import
import { finalize } from 'rxjs/operators';






















// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import {Observable, Subject, takeUntil} from 'rxjs';
//
// import { CardModule } from 'primeng/card';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { TabViewModule } from 'primeng/tabview';
// import { TableModule } from 'primeng/table';
// import { TagModule } from 'primeng/tag';
// import { ProgressBarModule } from 'primeng/progressbar';
// import { ChartModule } from 'primeng/chart';
// import { AvatarModule } from 'primeng/avatar';
// import { FileUploadModule } from 'primeng/fileupload';
// import { ToastModule } from 'primeng/toast';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { DialogModule } from 'primeng/dialog';
// import { MessageService, ConfirmationService } from 'primeng/api';
//
// import { User, UserPayload } from '../../types';
// import {InputSwitch} from "primeng/inputswitch";
// import {OrderService} from "../../services/order/order.service";
// import {AuthService} from "../../services/auth/auth.service";
//
// @Component({
//     selector: 'app-profile',
//     standalone: true,
//     imports: [
//         CommonModule,
//         FormsModule,
//         ReactiveFormsModule,
//         CardModule,
//         ButtonModule,
//         InputTextModule,
//         TabViewModule,
//         TableModule,
//         TagModule,
//         ProgressBarModule,
//         ChartModule,
//         AvatarModule,
//         FileUploadModule,
//         ToastModule,
//         ConfirmDialogModule,
//         DialogModule,
//         InputSwitch
//     ],
//     providers: [MessageService, ConfirmationService],
//     templateUrl: './user-profile.component.html',
//     styleUrl: './user-profile.component.css'
// })
// export class UserProfileComponent implements OnInit, OnDestroy {
//     private destroy$ = new Subject<void>();
//
//     user$: Observable<UserPayload>;
//     profileForm: FormGroup;
//     editProfileForm: FormGroup;
//
//     showEditDialog = false;
//     showAvatarDialog = false;
//     showOrderDialog = false;
//     selectedOrder: Order | null = null;
//     selectedAvatar: string | null = null;
//
//     orders: Order[] = [];
//
//     constructor(
//         private fb: FormBuilder,
//         private messageService: MessageService,
//         private confirmationService: ConfirmationService,
//         private orderService: OrderService,
//         private authService: AuthService,
//     ) {
//         this.user$ = this.authService.userState$;
//         this.profileForm = this.createProfileForm();
//         this.editProfileForm = this.createEditProfileForm();
//         this.initializeChartData();
//     }
//
//     ngOnInit(): void {
//         this.loadUserData();
//         this.loadOrders();
//         this.loadStatistics();
//     }
//
//     ngOnDestroy(): void {
//         this.destroy$.next();
//         this.destroy$.complete();
//     }
//
//     private createProfileForm(): FormGroup {
//         return this.fb.group({
//             name: ['', [Validators.required, Validators.minLength(2)]],
//             email: ['', [Validators.required, Validators.email]],
//             emailNotifications: [true],
//             marketingEmails: [false],
//             smsNotifications: [false]
//         });
//     }
//
//     private createEditProfileForm(): FormGroup {
//         return this.fb.group({
//             name: ['', [Validators.required, Validators.minLength(2)]],
//             email: ['', [Validators.required, Validators.email]]
//         });
//     }
//
//     private loadUserData(): void {
//         this.user$
//             .pipe(takeUntil(this.destroy$))
//             .subscribe(user => {
//                 this.profileForm.patchValue({
//                     name: user.name,
//                     email: user.email
//                 });
//
//                 this.editProfileForm.patchValue({
//                     name: user.name,
//                     email: user.email
//                 });
//             })
//     }
//
//     public loadOrders(): void {
//         this.user$.pipe(takeUntil(this.destroy$))
//             .subscribe(user => {
//                 this.orderService.getOrders(user.id).subscribe(orders => this.orders = orders)
//             })
//     }
//
//     getOrderStatusSeverity(
//         status: string
//     ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
//         const severities: { [key: string]: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' } = {
//             delivered: 'success',
//             shipped: 'info',
//             processing: 'warn',       // use 'warn' instead of 'warning' to match allowed type
//             pending: 'secondary',
//             cancelled: 'danger'
//         };
//
//         return severities[status] || 'secondary';
//     }
//
//
//     applyFilter(event: any): void {
//         const filterValue = (event.target as HTMLInputElement).value;
//         // Implement filtering logic
//         console.log('Filtering orders:', filterValue);
//     }
//
//     viewOrder(order: Order): void {
//         this.selectedOrder = order;
//         this.showOrderDialog = true;
//     }
//
//     cancelOrder(order: Order): void {
//         this.confirmationService.confirm({
//             message: `Are you sure you want to cancel order ${order.id}?`,
//             header: 'Confirm Cancellation',
//             icon: 'pi pi-exclamation-triangle',
//             accept: () => {
//                 // Implement order cancellation logic
//                 this.messageService.add({
//                     severity: 'success',
//                     summary: 'Order Cancelled',
//                     detail: `Order ${order.id} has been cancelled successfully.`
//                 });
//             }
//         });
//     }
//
//     updateProfile(): void {
//         if (this.profileForm.valid) {
//             const formData = this.profileForm.value;
//             // Implement profile update logic
//             this.messageService.add({
//                 severity: 'success',
//                 summary: 'Profile Updated',
//                 detail: 'Your profile has been updated successfully.'
//             });
//         }
//     }
//
//     saveProfile(): void {
//         if (this.editProfileForm.valid) {
//             const formData = this.editProfileForm.value;
//             // Implement profile save logic
//             this.messageService.add({
//                 severity: 'success',
//                 summary: 'Profile Saved',
//                 detail: 'Your profile changes have been saved.'
//             });
//             this.showEditDialog = false;
//         }
//     }
//
//     onAvatarSelect(event: any): void {
//         const file = event.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 this.selectedAvatar = e.target?.result as string;
//             };
//             reader.readAsDataURL(file);
//         }
//     }
//
//     uploadAvatar(): void {
//         if (this.selectedAvatar) {
//             // Implement avatar upload logic
//             this.messageService.add({
//                 severity: 'success',
//                 summary: 'Avatar Updated',
//                 detail: 'Your avatar has been updated successfully.'
//             });
//             this.showAvatarDialog = false;
//             this.selectedAvatar = null;
//         }
//     }
//
//     deleteAccount(): void {
//         this.confirmationService.confirm({
//             message: 'Are you sure you want to delete your account? This action cannot be undone.',
//             header: 'Confirm Account Deletion',
//             icon: 'pi pi-exclamation-triangle',
//             acceptButtonStyleClass: 'p-button-danger',
//             accept: () => {
//                 // Implement account deletion logic
//                 this.messageService.add({
//                     severity: 'warn',
//                     summary: 'Account Deletion',
//                     detail: 'Your account deletion request has been submitted.'
//                 });
//             }
//         });
//     }
// }