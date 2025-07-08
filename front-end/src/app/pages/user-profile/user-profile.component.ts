import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
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
import { MessageService, ConfirmationService } from 'primeng/api';

import { User, UserPayload } from '../../types';
import {InputSwitch} from "primeng/inputswitch";

interface Order {
    id: string;
    orderDate: Date;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    items: Array<{
        productName: string;
        quantity: number;
        price: number;
    }>;
}

interface ProductStats {
    productId: string;
    productName: string;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    imageUrl: string;
}

interface UserStats {
    totalOrders: number;
    totalSpent: number;
    favoriteCategories: string[];
    accountAge: number;
}

interface SellerStats {
    totalProducts: number;
    totalRevenue: number;
    totalOrders: number;
    averageRating: number;
    bestSellingProducts: ProductStats[];
}

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
        InputSwitch
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './user-profile.component.html',
    styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    user: UserPayload | null = null;
    profileForm: FormGroup;
    editProfileForm: FormGroup;

    showEditDialog = false;
    showAvatarDialog = false;
    showOrderDialog = false;
    selectedOrder: Order | null = null;
    selectedAvatar: string | null = null;

    orders: Order[] = [];

    userStats: UserStats = {
        totalOrders: 0,
        totalSpent: 0,
        favoriteCategories: [],
        accountAge: 0
    };

    sellerStats: SellerStats = {
        totalProducts: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageRating: 0,
        bestSellingProducts: []
    };

    // Chart data
    revenueChartData: any;
    statusChartData: any;
    chartOptions: any;
    pieChartOptions: any;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.profileForm = this.createProfileForm();
        this.editProfileForm = this.createEditProfileForm();
        this.initializeChartData();
    }

    ngOnInit(): void {
        this.loadUserData();
        this.loadOrders();
        this.loadStatistics();
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

    private initializeChartData(): void {
        this.revenueChartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [1200, 1900, 3000, 5000, 2000, 3000],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        };

        this.statusChartData = {
            labels: ['Delivered', 'Processing', 'Shipped', 'Pending', 'Cancelled'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#6B7280', '#EF4444']
            }]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        this.pieChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };
    }

    private loadUserData(): void {
        // Simulate loading user data
        this.user = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'CLIENT',
            avatar: '/assets/images/avatar.jpg',
            isAuthenticated: true
        };

        this.profileForm.patchValue({
            name: this.user.name,
            email: this.user.email
        });

        this.editProfileForm.patchValue({
            name: this.user.name,
            email: this.user.email
        });
    }

    public loadOrders(): void {
        // Simulate loading orders
        this.orders = [
            {
                id: 'ORD-001',
                orderDate: new Date('2024-01-15'),
                status: 'delivered',
                total: 129.99,
                items: [
                    { productName: 'Wireless Headphones', quantity: 1, price: 99.99 },
                    { productName: 'Phone Case', quantity: 2, price: 15.00 }
                ]
            },
            {
                id: 'ORD-002',
                orderDate: new Date('2024-01-20'),
                status: 'processing',
                total: 89.99,
                items: [
                    { productName: 'Bluetooth Speaker', quantity: 1, price: 89.99 }
                ]
            }
        ];
    }

    private loadStatistics(): void {
        if (this.user?.role === 'CLIENT') {
            this.userStats = {
                totalOrders: 15,
                totalSpent: 1249.85,
                favoriteCategories: ['Electronics', 'Clothing', 'Home & Garden'],
                accountAge: 2
            };
        } else if (this.user?.role === 'SELLER') {
            this.sellerStats = {
                totalProducts: 25,
                totalRevenue: 15750.00,
                totalOrders: 156,
                averageRating: 4.8,
                bestSellingProducts: [
                    {
                        productId: '1',
                        productName: 'Wireless Headphones',
                        totalOrders: 45,
                        totalRevenue: 4499.55,
                        averageRating: 4.9,
                        imageUrl: '/assets/images/headphones.jpg'
                    },
                    {
                        productId: '2',
                        productName: 'Bluetooth Speaker',
                        totalOrders: 32,
                        totalRevenue: 2879.68,
                        averageRating: 4.7,
                        imageUrl: '/assets/images/speaker.jpg'
                    }
                ]
            };
        }
    }

    getMemberSince(): string {
        return 'January 2023';
    }

    getCategoryPercentage(category: string): number {
        const percentages: { [key: string]: number } = {
            'Electronics': 85,
            'Clothing': 60,
            'Home & Garden': 40
        };
        return percentages[category] || 0;
    }

    getOrderStatusSeverity(
        status: string
    ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const severities: { [key: string]: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' } = {
            delivered: 'success',
            shipped: 'info',
            processing: 'warn',       // use 'warn' instead of 'warning' to match allowed type
            pending: 'secondary',
            cancelled: 'danger'
        };

        return severities[status] || 'secondary';
    }


    applyFilter(event: any): void {
        const filterValue = (event.target as HTMLInputElement).value;
        // Implement filtering logic
        console.log('Filtering orders:', filterValue);
    }

    viewOrder(order: Order): void {
        this.selectedOrder = order;
        this.showOrderDialog = true;
    }

    downloadInvoice(order: Order): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Download Started',
            detail: `Invoice for order ${order.id} is being downloaded.`
        });
    }

    cancelOrder(order: Order): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to cancel order ${order.id}?`,
            header: 'Confirm Cancellation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Implement order cancellation logic
                this.messageService.add({
                    severity: 'success',
                    summary: 'Order Cancelled',
                    detail: `Order ${order.id} has been cancelled successfully.`
                });
            }
        });
    }

    exportOrders(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Export Started',
            detail: 'Your order history is being exported.'
        });
    }

    addProduct(): void {
        // Navigate to add product page
        console.log('Navigate to add product');
    }

    openBulkActions(): void {
        // Open bulk actions dialog
        console.log('Open bulk actions');
    }

    editProduct(product: ProductStats): void {
        // Navigate to edit product page
        console.log('Edit product:', product);
    }

    viewProductAnalytics(product: ProductStats): void {
        // Navigate to product analytics page
        console.log('View analytics for:', product);
    }

    openProductMenu(product: ProductStats): void {
        // Open product context menu
        console.log('Open menu for:', product);
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

    openSettings(): void {
        // Navigate to settings or open settings dialog
        console.log('Open settings');
    }

    changePassword(): void {
        // Open change password dialog
        console.log('Change password');
    }

    enableTwoFactor(): void {
        // Open two-factor authentication setup
        console.log('Enable 2FA');
    }

    downloadAccountData(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Download Started',
            detail: 'Your account data is being prepared for download.'
        });
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
}














// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MessageService } from 'primeng/api';
// import { UserService } from "../../services/user/user.service";
// import { AuthService } from "../../services/auth/auth.service";
// import { Observable, of } from "rxjs";
// import { Role, UserPayload } from "../../types";
// import { catchError, finalize, take } from "rxjs/operators";
// import { NgClass, NgIf } from "@angular/common";
// import { Router } from '@angular/router';
// import { ToastModule } from "primeng/toast";
//
// @Component({
//     selector: 'app-user-profile',
//     templateUrl: './user-profile.component.html',
//     styleUrl: "./user-profile.component.css",
//     standalone: true,
//     imports: [
//         NgIf,
//         FormsModule,
//         ReactiveFormsModule,
//         NgClass,
//         ToastModule
//     ],
//     providers: [MessageService]
// })
// export class UserProfileComponent {
//     user$: Observable<UserPayload>;
//     updating = false;
//     deleting = false;
//     isVisible = false;
//     // currentUserName = '';
//
//     // For delete confirmation
//     userName = '';
//     nameConfirmation = '';
//     nameConfirmationError = false;
//
//     // Avatar handling
//     avatarPreview: string | ArrayBuffer | null = null;
//     avatarFileName: string | null = null;
//     avatarFile: File | null = null;
//
//     form: FormGroup;
//
//     constructor(
//         private fb: FormBuilder,
//         private userService: UserService,
//         private authService: AuthService,
//         private messageService: MessageService,
//         private router: Router
//     ) {
//         this.user$ = this.authService.userState$;
//         this.form = this.fb.group({
//             name: ['', []],
//             prev_password: ['', []],
//             new_password: ['', []],
//             avatar: [null]
//         });
//         // this.initializeForm();
//         this.getUserName();
//     }
//
//     private getUserName(): void {
//         this.user$.pipe(take(1)).subscribe(user => {
//             this.userName = user.name;
//         });
//     }
//
//     updateProfile(): void {
//         if (this.updating) return;
//
//         const formValue = this.form.value;
//         const formData = new FormData();
//         let hasChanges = false;
//         let hasValidationErrors = false;
//
//         // Collect original values for comparison
//         this.user$.pipe(take(1)).subscribe(user => {
//             // Check name changes and validate if changed
//             if (formValue.name && formValue.name !== user.name) {
//                 // Dynamically validate name
//                 const nameControl = this.form.get('name');
//                 nameControl?.setValidators([
//                     Validators.required,
//                     Validators.minLength(2),
//                     Validators.maxLength(20),
//                     Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)
//                 ]);
//                 nameControl?.updateValueAndValidity();
//
//                 if (nameControl?.invalid) {
//                     hasValidationErrors = true;
//                 } else {
//                     formData.append('name', formValue.name);
//                     hasChanges = true;
//                 }
//             }
//
//             // Check password changes and validate if both fields are provided
//             if (formValue.prev_password || formValue.new_password) {
//                 // Both fields are required if either is provided
//                 const prevPasswordControl = this.form.get('prev_password');
//                 const newPasswordControl = this.form.get('new_password');
//
//                 const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
//
//                 // Apply validators
//                 prevPasswordControl?.setValidators([
//                     Validators.required,
//                     Validators.pattern(passwordPattern)
//                 ]);
//                 newPasswordControl?.setValidators([
//                     Validators.required,
//                     Validators.pattern(passwordPattern)
//                 ]);
//
//                 prevPasswordControl?.updateValueAndValidity();
//                 newPasswordControl?.updateValueAndValidity();
//
//                 if (prevPasswordControl?.invalid || newPasswordControl?.invalid) {
//                     hasValidationErrors = true;
//                 } else {
//                     formData.append('prev_password', formValue.prev_password);
//                     formData.append('new_password', formValue.new_password);
//                     hasChanges = true;
//                 }
//             }
//
//             // Check avatar changes
//             if (this.avatarFile) {
//                 formData.append('avatar', this.avatarFile, this.avatarFile.name);
//                 hasChanges = true;
//             }
//
//             // Display appropriate messages and handle form submission
//             if (hasValidationErrors) {
//                 this.messageService.add({
//                     severity: "error",
//                     summary: "Validation Failed",
//                     detail: "Please check the form for errors."
//                 });
//                 return;
//             }
//
//             if (!hasChanges) {
//                 this.messageService.add({
//                     severity: "info",
//                     summary: "No Changes",
//                     detail: "You must modify a field to update your profile."
//                 });
//                 return;
//             }
//
//             // If we got here, we have changes and no validation errors
//             this.updating = true;
//
//             this.userService.updateUser(user.id, formData)
//                 .pipe(
//                     catchError(error => {
//                         this.messageService.add({
//                             severity: "error",
//                             summary: "Error",
//                             detail: error?.error?.message || "Failed to update profile. Please try again."
//                         });
//                         return of(null);
//                     }),
//                     finalize(() => {
//                         this.updating = false;
//                     })
//                 )
//                 .subscribe(response => {
//                     if (response) {
//                         this.messageService.add({
//                             severity: "success",
//                             summary: "Success",
//                             detail: response.message || "Profile updated successfully!"
//                         });
//
//                         // Reset password fields
//                         this.form.patchValue({
//                             prev_password: '',
//                             new_password: ''
//                         });
//
//                         // Reset validators
//                         this.resetValidators();
//
//                         // // If name was updated, update the currentUserName
//                         // if (formValue.name && formValue.name !== this.currentUserName) {
//                         //     this.currentUserName = formValue.name;
//                         // }
//                     }
//                 });
//         });
//     }
//
//     // Reset validators when not editing
//     private resetValidators(): void {
//         this.form.get('name')?.clearValidators();
//         this.form.get('name')?.updateValueAndValidity();
//
//         this.form.get('prev_password')?.clearValidators();
//         this.form.get('prev_password')?.updateValueAndValidity();
//
//         this.form.get('new_password')?.clearValidators();
//         this.form.get('new_password')?.updateValueAndValidity();
//     }
//
//     onFileSelected(event: Event): void {
//         const input = event.target as HTMLInputElement;
//         if (input.files && input.files[0]) {
//             const file = input.files[0];
//
//             // Validate file type
//             if (!file.type.match(/image\/(jpeg|png|gif)$/)) {
//                 alert('Please select a valid image file (JPEG, PNG, or GIF)');
//                 return;
//             }
//
//             // Validate file size (10MB max)
//             if (file.size > 10 * 1024 * 1024) {
//                 alert('File size must be less than 10MB');
//                 return;
//             }
//
//             this.avatarFile = file;
//             this.avatarFileName = file.name;
//
//             // Create preview
//             const reader = new FileReader();
//             reader.onload = (e: ProgressEvent<FileReader>) => {
//                 this.avatarPreview = e.target?.result as string;
//             };
//             reader.readAsDataURL(file);
//         }
//     }
//
//     removeAvatar(): void {
//         this.avatarFile = null;
//         this.avatarPreview = null;
//         this.avatarFileName = null;
//
//         // Reset the file input
//         const fileInput = document.getElementById('avatar') as HTMLInputElement;
//         if (fileInput) {
//             fileInput.value = '';
//         }
//     }
//
//     deleteUser(): void {
//         if (this.deleting || this.nameConfirmation !== this.userName) {
//             this.nameConfirmationError = true;
//             return;
//         }
//
//         this.nameConfirmationError = false;
//         this.deleting = true;
//
//         this.user$.pipe(take(1)).subscribe(user => {
//             this.userService.deleteUser(user.id).pipe(
//                 catchError((error) => {
//                     this.messageService.add({
//                         severity: 'error',
//                         summary: 'Error Deleting Account',
//                         detail: error?.error?.message || "Failed to delete account. Please try again.",
//                     });
//                     return of(null);
//                 }),
//                 finalize(() => {
//                     this.deleting = false;
//                     this.toggle();
//                 })
//             ).subscribe((response) => {
//                 if (response) {
//                     this.messageService.add({
//                         severity: 'success',
//                         summary: 'Account Deleted',
//                         detail: response?.message || "Your account has been deleted successfully.",
//                     });
//                     this.authService.logout();
//                     this.router.navigate(['/']);
//                 }
//             });
//         });
//     }
//
//     toggle(): void {
//         if (this.deleting) return;
//         this.isVisible = !this.isVisible;
//         this.nameConfirmation = '';
//         this.nameConfirmationError = false;
//
//         // Get current name when opening modal
//         if (this.isVisible) {
//             this.user$.pipe(take(1)).subscribe(user => {
//                 this.userName = user.name;
//             });
//         }
//     }
//
//     isSeller(): boolean {
//         let isSeller = false;
//         this.user$.pipe(take(1)).subscribe(user => {
//             isSeller = user.role === Role.SELLER;
//         });
//         return isSeller;
//     }
// }