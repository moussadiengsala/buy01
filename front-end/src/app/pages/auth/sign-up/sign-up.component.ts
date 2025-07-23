import {Component, inject, OnInit} from '@angular/core';
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

import { Router, RouterLink } from '@angular/router';
import {Role} from "../../../types";
import {AlertComponent} from "../../../components/alert/alert.component";
import {AuthService} from "../../../services/auth/auth.service";
import {AlertService} from "../../../services/alert/alert.service";
import {ToastModule} from "primeng/toast";
import {FileData, FileService} from "../../../services/file-service/file-service.service";


@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [CommonModule,
        ReactiveFormsModule,
        RouterLink,
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

export class SignUpComponent implements OnInit {
    private formBuilder = inject(FormBuilder)
    signUpForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)]],
        role: [Role.CLIENT, [Validators.required]],
        avatar: [null as File | null]
    });

    loading: boolean = false;
    currentFile: FileData | null = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private alertService: AlertService,
        private fileService: FileService) {
        this.alertService.clear()
        this.fileService.fileData$.subscribe(fileData => {
            this.currentFile = fileData;
        });
    }

    ngOnInit(): void {}

    onSubmit(): void {
        // Mark all fields as touched to trigger validation display
        this.signUpForm.markAllAsTouched();

        if (this.signUpForm.invalid) {
            this.messageService.add({severity: "error", summary: 'Error', detail: 'Make sure to fill all required fields correctly!'})
            return;
        }

        const formValue = this.signUpForm.value;

        const formData = new FormData();
        if (this.currentFile
            && this.currentFile.file
            && this.currentFile.fileName) formData.append('avatar', this.currentFile.file, this.currentFile.fileName);
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
                const msg: string = error ? `${error}` : 'Failed to register';
                this.alertService.error('Failed to register', msg)
            }
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

    // Getter methods for form controls to simplify template validation
    get nameControl() { return this.signUpForm.get('name'); }
    get emailControl() { return this.signUpForm.get('email'); }
    get passwordControl() { return this.signUpForm.get('password'); }
    get roleControl() { return this.signUpForm.get('role'); }
    isSeller(): boolean { return this.roleControl?.value === Role.SELLER.toString()}
}
