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
    User,
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
import {Message} from "primeng/message";
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

    // Dialog states
    showEditDialog = false;
    showAvatarDialog = false;
    showOrderDialog = false;
    showStatsDialog = false;
    showPasswordDialog = false;
    showOrderTrackingDialog = false;
    selectedOrder: Order | null = null;
    selectedAvatar: string | null = null;
    orderTrackingInfo: any = null;

    // Orders and filtering
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

    // Statistics
    userStats: UserStatisticsDTO | SellerStatisticsDTO | null = null;
    chartData: any = {};
    chartOptions: any = {};

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
        this.initializeChartData();
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
                    this.updateChartData(stats);
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
                    this.updateChartData(stats);
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

    private updateChartData(stats: UserStatisticsDTO | SellerStatisticsDTO): void {
        try {
            // Type guards to determine if it's UserStatisticsDTO or SellerStatisticsDTO
            const isUserStats = this.isUserStatistics(stats);

            let labels: string[] = [];
            let primaryData: number[] = [];
            let orderData: number[] = [];
            let primaryLabel = '';

            if (isUserStats) {
                // Handle UserStatisticsDTO
                const userStats = stats as UserStatisticsDTO;

                // Safely extract chart data
                const monthlySpending = userStats.monthlySpendingChart || {};
                const monthlyOrders = userStats.monthlyOrderChart || {};

                labels = Object.keys(monthlySpending).sort();
                primaryData = labels.map(month => monthlySpending[month] || 0);
                orderData = labels.map(month => monthlyOrders[month] || 0);
                primaryLabel = 'Monthly Spending';

                // If no chart data available, create default structure
                if (labels.length === 0) {
                    const currentDate = new Date();
                    for (let i = 5; i >= 0; i--) {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        labels.push(monthKey);
                        primaryData.push(0);
                        orderData.push(0);
                    }
                }
            } else {
                // Handle SellerStatisticsDTO
                const sellerStats = stats as SellerStatisticsDTO;

                // Safely extract chart data
                const monthlyRevenue = sellerStats.monthlyRevenueChart || {};
                const monthlyOrders = sellerStats.monthlyOrderChart || {};

                labels = Object.keys(monthlyRevenue).sort();
                primaryData = labels.map(month => monthlyRevenue[month] || 0);
                orderData = labels.map(month => monthlyOrders[month] || 0);
                primaryLabel = 'Monthly Revenue';

                // If no chart data available, create default structure
                if (labels.length === 0) {
                    const currentDate = new Date();
                    for (let i = 5; i >= 0; i--) {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        labels.push(monthKey);
                        primaryData.push(0);
                        orderData.push(0);
                    }
                }
            }

            // Format labels for better display (e.g., "2024-01" -> "Jan 2024")
            const formattedLabels = labels.map(label => {
                try {
                    const [year, month] = label.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                } catch {
                    return label; // fallback to original label if parsing fails
                }
            });

            this.chartData = {
                labels: formattedLabels,
                datasets: [
                    {
                        label: primaryLabel,
                        data: primaryData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Orders',
                        data: orderData,
                        backgroundColor: 'rgba(255, 206, 86, 0.6)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            };

            this.chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: primaryLabel
                        },
                        ticks: {
                            callback: (value: any) => '$' + Number(value).toFixed(2)
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Number of Orders'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: (value: any) => Number(value).toString()
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top' as const
                    },
                    tooltip: {
                        callbacks: {
                            label: (context: any) => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;

                                if (label.includes('Spending') || label.includes('Revenue')) {
                                    return `${label}: $${Number(value).toFixed(2)}`;
                                }
                                return `${label}: ${Number(value)}`;
                            }
                        }
                    }
                }
            };
        } catch (error) {
            console.error('Error updating chart data:', error);
            this.initializeEmptyChartData();
        }
    }

    public isUserStatistics(stats: UserStatisticsDTO | SellerStatisticsDTO): stats is UserStatisticsDTO {
        return 'monthlySpendingChart' in stats && 'totalSpent' in stats;
    }

    private initializeChartData(): void {
        this.initializeEmptyChartData();
    }

    private initializeEmptyChartData(): void {
        this.chartData = {
            labels: [],
            datasets: [{
                label: 'No Data Available',
                data: [],
                backgroundColor: 'rgba(128, 128, 128, 0.6)',
                borderColor: 'rgba(128, 128, 128, 1)',
                borderWidth: 1
            }]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const
                }
            }
        };
    }

    // Helper methods for statistics display
    getTotalMetric(): number {
        if (!this.userStats) return 0;

        if (this.isUserStatistics(this.userStats)) {
            return this.userStats.totalSpent || 0;
        } else {
            return this.userStats.totalRevenue || 0;
        }
    }

    getTotalMetricLabel(): string {
        if (!this.userStats) return 'Total';

        if (this.isUserStatistics(this.userStats)) {
            return 'Total Spent';
        } else {
            return 'Total Revenue';
        }
    }

    getMonthlyMetric(): number {
        if (!this.userStats) return 0;

        if (this.isUserStatistics(this.userStats)) {
            return this.userStats.monthlySpending || 0;
        } else {
            return this.userStats.monthlyRevenue || 0;
        }
    }

    getMonthlyMetricLabel(): string {
        if (!this.userStats) return 'Monthly';

        if (this.isUserStatistics(this.userStats)) {
            return 'Monthly Spending';
        } else {
            return 'Monthly Revenue';
        }
    }

    getCompletionRate(): number {
        if (!this.userStats) return 0;

        const totalOrders = this.userStats.totalOrders || 0;
        const completedOrders = this.userStats.completedOrders || 0;

        if (totalOrders === 0) return 0;
        return (completedOrders / totalOrders) * 100;
    }

    // Rest of the methods remain the same...
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

    viewOrder(order: Order): void {
        this.selectedOrder = order;
        this.showOrderDialog = true;
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

    showStatistics(): void {
        this.showStatsDialog = true;
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

    exportOrderHistory(): void {
        if (!this.user) return;

        const searchParams: OrderSearchParams = {
            userId: this.user.id
        };

        this.orderService.exportOrders(searchParams)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `order-history-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Export Complete',
                        detail: 'Your order history has been exported successfully.'
                    });
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Export Failed',
                        detail: 'Unable to export order history. Please try again.'
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

    // Utility methods
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

    // Avatar selection options
    getAvatarOptions(): string[] {
        return [
            '/assets/avatars/avatar-1.png',
            '/assets/avatars/avatar-2.png',
            '/assets/avatars/avatar-3.png',
            '/assets/avatars/avatar-4.png',
            '/assets/avatars/avatar-5.png',
            '/assets/avatars/avatar-6.png',
            '/assets/avatars/avatar-7.png',
            '/assets/avatars/avatar-8.png'
        ];
    }

    getUserInitials(): string {
        if (!this.user?.name) return 'U';

        const names = this.user.name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return names[0][0].toUpperCase();
    }

    // Order action helpers
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

    formatDateTime(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Dialog control methods
    closeOrderDialog(): void {
        this.showOrderDialog = false;
        this.selectedOrder = null;
    }

    closeEditDialog(): void {
        this.showEditDialog = false;
        this.editProfileForm.reset();
    }

    closePasswordDialog(): void {
        this.showPasswordDialog = false;
        this.passwordForm.reset();
    }

    closeAvatarDialog(): void {
        this.showAvatarDialog = false;
        this.selectedAvatar = null;
    }

    closeStatsDialog(): void {
        this.showStatsDialog = false;
    }

    closeOrderTrackingDialog(): void {
        this.showOrderTrackingDialog = false;
        this.orderTrackingInfo = null;
    }

    getTimelineEvents(): any[] {
        if (!this.userStats) return [];

        const events = [];

        // Add first purchase/last purchase events
        if (this.isUserStatistics(this.userStats)) {
            if (this.userStats.firstPurchaseDate) {
                events.push({
                    title: 'First Purchase',
                    description: 'Your first order on our platform',
                    date: this.userStats.firstPurchaseDate
                });
            }

            if (this.userStats.lastPurchaseDate) {
                events.push({
                    title: 'Last Purchase',
                    description: 'Your most recent order',
                    date: this.userStats.lastPurchaseDate
                });
            }
        } else {
            if (this.userStats.firstOrderDate) {
                events.push({
                    title: 'First Order',
                    description: 'First order received as a seller',
                    date: this.userStats.firstOrderDate
                });
            }

            if (this.userStats.lastOrderDate) {
                events.push({
                    title: 'Last Order',
                    description: 'Most recent order received',
                    date: this.userStats.lastOrderDate
                });
            }
        }

        // // Add account creation date
        // if (this.user?.createdAt) {
        //     events.push({
        //         title: 'Account Created',
        //         description: 'You joined our platform',
        //         date: this.user.createdAt
        //     });
        // }

        // Sort events by date
        return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    protected readonly environment = environment;
}