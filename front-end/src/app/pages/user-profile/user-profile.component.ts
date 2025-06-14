import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from "../../services/user/user.service";
import { AuthService } from "../../services/auth/auth.service";
import { Observable, of } from "rxjs";
import { Role, UserPayload } from "../../types";
import { catchError, finalize, take } from "rxjs/operators";
import { NgClass, NgIf } from "@angular/common";
import { Router } from '@angular/router';
import { ToastModule } from "primeng/toast";

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrl: "./user-profile.component.css",
    standalone: true,
    imports: [
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        ToastModule
    ],
    providers: [MessageService]
})
export class UserProfileComponent {
    user$: Observable<UserPayload>;
    updating = false;
    deleting = false;
    isVisible = false;
    // currentUserName = '';

    // For delete confirmation
    userName = '';
    nameConfirmation = '';
    nameConfirmationError = false;

    // Avatar handling
    avatarPreview: string | ArrayBuffer | null = null;
    avatarFileName: string | null = null;
    avatarFile: File | null = null;

    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.user$ = this.authService.userState$;
        this.form = this.fb.group({
            name: ['', []],
            prev_password: ['', []],
            new_password: ['', []],
            avatar: [null]
        });
        // this.initializeForm();
        this.getUserName();
    }

    private getUserName(): void {
        this.user$.pipe(take(1)).subscribe(user => {
            this.userName = user.name;
        });
    }

    updateProfile(): void {
        if (this.updating) return;

        const formValue = this.form.value;
        const formData = new FormData();
        let hasChanges = false;
        let hasValidationErrors = false;

        // Collect original values for comparison
        this.user$.pipe(take(1)).subscribe(user => {
            // Check name changes and validate if changed
            if (formValue.name && formValue.name !== user.name) {
                // Dynamically validate name
                const nameControl = this.form.get('name');
                nameControl?.setValidators([
                    Validators.required,
                    Validators.minLength(2),
                    Validators.maxLength(20),
                    Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)
                ]);
                nameControl?.updateValueAndValidity();

                if (nameControl?.invalid) {
                    hasValidationErrors = true;
                } else {
                    formData.append('name', formValue.name);
                    hasChanges = true;
                }
            }

            // Check password changes and validate if both fields are provided
            if (formValue.prev_password || formValue.new_password) {
                // Both fields are required if either is provided
                const prevPasswordControl = this.form.get('prev_password');
                const newPasswordControl = this.form.get('new_password');

                const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

                // Apply validators
                prevPasswordControl?.setValidators([
                    Validators.required,
                    Validators.pattern(passwordPattern)
                ]);
                newPasswordControl?.setValidators([
                    Validators.required,
                    Validators.pattern(passwordPattern)
                ]);

                prevPasswordControl?.updateValueAndValidity();
                newPasswordControl?.updateValueAndValidity();

                if (prevPasswordControl?.invalid || newPasswordControl?.invalid) {
                    hasValidationErrors = true;
                } else {
                    formData.append('prev_password', formValue.prev_password);
                    formData.append('new_password', formValue.new_password);
                    hasChanges = true;
                }
            }

            // Check avatar changes
            if (this.avatarFile) {
                formData.append('avatar', this.avatarFile, this.avatarFile.name);
                hasChanges = true;
            }

            // Display appropriate messages and handle form submission
            if (hasValidationErrors) {
                this.messageService.add({
                    severity: "error",
                    summary: "Validation Failed",
                    detail: "Please check the form for errors."
                });
                return;
            }

            if (!hasChanges) {
                this.messageService.add({
                    severity: "info",
                    summary: "No Changes",
                    detail: "You must modify a field to update your profile."
                });
                return;
            }

            // If we got here, we have changes and no validation errors
            this.updating = true;

            this.userService.updateUser(user.id, formData)
                .pipe(
                    catchError(error => {
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: error?.error?.message || "Failed to update profile. Please try again."
                        });
                        return of(null);
                    }),
                    finalize(() => {
                        this.updating = false;
                    })
                )
                .subscribe(response => {
                    if (response) {
                        this.messageService.add({
                            severity: "success",
                            summary: "Success",
                            detail: response.message || "Profile updated successfully!"
                        });

                        // Reset password fields
                        this.form.patchValue({
                            prev_password: '',
                            new_password: ''
                        });

                        // Reset validators
                        this.resetValidators();

                        // // If name was updated, update the currentUserName
                        // if (formValue.name && formValue.name !== this.currentUserName) {
                        //     this.currentUserName = formValue.name;
                        // }
                    }
                });
        });
    }

    // Reset validators when not editing
    private resetValidators(): void {
        this.form.get('name')?.clearValidators();
        this.form.get('name')?.updateValueAndValidity();

        this.form.get('prev_password')?.clearValidators();
        this.form.get('prev_password')?.updateValueAndValidity();

        this.form.get('new_password')?.clearValidators();
        this.form.get('new_password')?.updateValueAndValidity();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validate file type
            if (!file.type.match(/image\/(jpeg|png|gif)$/)) {
                alert('Please select a valid image file (JPEG, PNG, or GIF)');
                return;
            }

            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }

            this.avatarFile = file;
            this.avatarFileName = file.name;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                this.avatarPreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    removeAvatar(): void {
        this.avatarFile = null;
        this.avatarPreview = null;
        this.avatarFileName = null;

        // Reset the file input
        const fileInput = document.getElementById('avatar') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    deleteUser(): void {
        if (this.deleting || this.nameConfirmation !== this.userName) {
            this.nameConfirmationError = true;
            return;
        }

        this.nameConfirmationError = false;
        this.deleting = true;

        this.user$.pipe(take(1)).subscribe(user => {
            this.userService.deleteUser(user.id).pipe(
                catchError((error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error Deleting Account',
                        detail: error?.error?.message || "Failed to delete account. Please try again.",
                    });
                    return of(null);
                }),
                finalize(() => {
                    this.deleting = false;
                    this.toggle();
                })
            ).subscribe((response) => {
                if (response) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Account Deleted',
                        detail: response?.message || "Your account has been deleted successfully.",
                    });
                    this.authService.logout();
                    this.router.navigate(['/']);
                }
            });
        });
    }

    toggle(): void {
        if (this.deleting) return;
        this.isVisible = !this.isVisible;
        this.nameConfirmation = '';
        this.nameConfirmationError = false;

        // Get current name when opening modal
        if (this.isVisible) {
            this.user$.pipe(take(1)).subscribe(user => {
                this.userName = user.name;
            });
        }
    }

    isSeller(): boolean {
        let isSeller = false;
        this.user$.pipe(take(1)).subscribe(user => {
            isSeller = user.role === Role.SELLER;
        });
        return isSeller;
    }
}



// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MessageService } from 'primeng/api';
// import { UserService } from "../../services/user/users.service";
// import { AuthService } from "../../services/auth/auth-service.service";
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
//             name: ['', [
//                 Validators.required,
//                 Validators.minLength(2),
//                 Validators.maxLength(20),
//                 Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)
//             ]],
//             prev_password: ['', [
//                 Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
//             ]],
//             new_password: ['', [
//                 Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
//             ]],
//             avatar: [null]
//         });
//         this.initializeForm();
//         this.getUserName();
//     }
//
//     private initializeForm(): void {
//
//         // Set initial values from user data
//         this.user$.pipe(take(1)).subscribe(user => {
//             this.form.patchValue({
//                 name: user.name
//             });
//         });
//     }
//
//     private getUserName(): void {
//         this.user$.pipe(take(1)).subscribe(user => {
//             this.userName = user.name;
//         });
//     }
//
//     updateProfile(): void {
//         if (this.form.invalid || this.updating) return;
//
//         this.updating = true;
//
//         this.user$.pipe(take(1)).subscribe(user => {
//             const formValue = this.form.value;
//             const formData = new FormData();
//             let hasChanges = false;
//
//             // Check for changes and prepare form data
//             if (formValue.name && formValue.name !== user.name) {
//                 formData.append('name', formValue.name);
//                 hasChanges = true;
//             }
//             console.log(formData);
//
//             if (formValue.prev_password && formValue.new_password) {
//                 formData.append('prev_password', formValue.prev_password);
//                 formData.append('new_password', formValue.new_password);
//                 hasChanges = true;
//             }
//
//             if (this.avatarFile) {
//                 formData.append('avatar', this.avatarFile, this.avatarFile.name);
//                 hasChanges = true;
//             }
//
//             if (!hasChanges) {
//                 this.messageService.add({
//                     severity: "info",
//                     summary: "No Changes",
//                     detail: "You must modify a field to update your profile."
//                 });
//                 this.updating = false;
//                 return;
//             }
//
//             this.userService.updateUser(user.id, formData).subscribe({
//                 next: (response) => {
//                     this.messageService.add({
//                         severity: "success",
//                         summary: "Success",
//                         detail: response?.message || "Profile updated successfully!"
//                     });
//                     // Update the auth state with new user data
//                     // this.authService.updateUserState(response.user);
//                     // Update local name if changed
//                     // if (response.user?.name) {
//                     //     this.userName = response.user.name;
//                     // }
//                 },
//                 error: (error) => {
//                     this.messageService.add({
//                         severity: "error",
//                         summary: "Error",
//                         detail: error?.error?.message || "Failed to update profile. Please try again."
//                     });
//                 },
//                 complete: () => {
//                     this.updating = false;
//                 }
//             });
//         });
//     }
//
//     onFileSelected(event: Event): void {
//         const input = event.target as HTMLInputElement;
//         if (input.files && input.files[0]) {
//             const file = input.files[0];
//
//             // Validate file type
//             const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
//             if (!validTypes.includes(file.type)) {
//                 this.messageService.add({
//                     severity: 'error',
//                     summary: 'Invalid File Type',
//                     detail: 'Please select a JPEG, PNG, or GIF image.'
//                 });
//                 return;
//             }
//
//             // Validate file size (10MB max)
//             if (file.size > 10 * 1024 * 1024) {
//                 this.messageService.add({
//                     severity: 'error',
//                     summary: 'File Too Large',
//                     detail: 'Maximum file size is 10MB.'
//                 });
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
//         if (this.deleting || this.nameConfirmation !== this.userName) return;
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