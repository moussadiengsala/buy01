import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';

import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {Role} from "../../../types";
import {AlertComponent} from "../../../components/alert/alert.component";
import {AuthService} from "../../../services/auth/auth-service.service";
import {AlertService} from "../../../services/alert/alert.service";
import {ToastModule} from "primeng/toast";

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [CommonModule,
        ReactiveFormsModule,
        RouterLink,
        RouterLinkActive,
        FileUploadModule,
        RadioButtonModule,
        CardModule,
        MessagesModule,
        DividerModule,
        ButtonModule,
        InputGroupModule,
        InputGroupAddonModule,
        PasswordModule,
        AlertComponent, ToastModule
    ],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.css',
    providers: [MessageService]
})

export class SignUpComponent {
    private formBuilder = inject(FormBuilder)
    signUpForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)]],
        role: [Role.CLIENT, [Validators.required]],
        avatar: [null as File | null]
    });

    loading: boolean = false;
    avatarPreview: string | ArrayBuffer | null = null;
    avatarFileName: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private alertService: AlertService) {
        this.alertService.clear()
    }

    onSubmit(): void {
        // Mark all fields as touched to trigger validation display
        this.signUpForm.markAllAsTouched();

        if (this.signUpForm.invalid) {
            this.messageService.add({severity: "error", summary: 'Error', detail: 'Make sure to fill all required fields correctly!'})
            return;
        }

        const formValue = this.signUpForm.value;

        const formData = new FormData();
        if (formValue.avatar) formData.append('avatar', formValue.avatar as File, (formValue.avatar as File).name);
        formData.append('name', formValue.name || '');
        formData.append('email', formValue.email || '');
        formData.append('password', formValue.password || '');
        formData.append('role', formValue.role?.toString() || Role.CLIENT.toString());

        this.loading = true;

        this.authService.register(formData).subscribe({
            next: (response) => {
                this.loading = false;
                this.messageService.add({severity: "success", summary: 'Success', detail: 'Registration successful!'})
                this.signUpForm.reset({ role: Role.CLIENT });
                this.router.navigate(['/']);
            },
            error: (error) => {
                this.loading = false;
                this.alertService.error(error?.error?.message || 'Error', error.error.data || 'Failed to register')
            }
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            // Validate file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                this.messageService.add({severity: "warn", summary: 'File Too Large', detail: 'File size should not exceed 2MB.'})
                input.value = ''; // Clear the input
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.messageService.add({severity: "warn", summary: 'Invalid File Type', detail: 'Only image files are allowed.'})
                input.value = ''; // Clear the input
                return;
            }

            // File preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.avatarPreview = e.target?.result || null;
            };
            reader.readAsDataURL(file);

            // Update form
            this.signUpForm.patchValue({
                avatar: file
            });
            this.signUpForm.get('avatar')?.updateValueAndValidity();

            // Store file name
            this.avatarFileName = file.name;
        }
    }

    // Getter methods for form controls to simplify template validation
    get nameControl() { return this.signUpForm.get('name'); }
    get emailControl() { return this.signUpForm.get('email'); }
    get passwordControl() { return this.signUpForm.get('password'); }
    get roleControl() { return this.signUpForm.get('role'); }
    isSeller(): boolean { return this.roleControl?.value === Role.SELLER.toString()}
}
