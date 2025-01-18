import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MessagesModule } from 'primeng/messages';
import {Role, UserLoginRequest} from "../../../types";
import {AuthService} from "../../../services/auth/auth-service.service";
import {AlertComponent} from "../../../components/alert/alert.component";
import {AlertService} from "../../../services/alert/alert.service";
import {ToastModule} from "primeng/toast";

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, CardModule, MessagesModule, ButtonModule, InputGroupModule, InputGroupAddonModule, PasswordModule, AlertComponent, ToastModule],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.css',
    providers: [MessageService]
})
export class SignInComponent {
    private formBuilder = inject(FormBuilder)
    signInForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)]],
    });
    loading = false;

    constructor(
      private authService: AuthService,
      private router: Router,
      private alertService: AlertService,
      private messageService: MessageService
    ) {
        this.alertService.clear()
    }

    onSubmit(): void {
      if (!this.signInForm.valid) {
          this.messageService.add({severity: "error", summary: 'Error', detail: 'Make sure to fill all required fields correctly!'})
          return
      }
      this.loading = true;
      const loginRequest: UserLoginRequest = {
          email: this.signInForm.value.email,
          password: this.signInForm.value.password
      }

      this.authService.login(loginRequest).subscribe({
          next: (response) => {
              this.loading = false;
              this.messageService.add({severity: "success", summary: 'Success', detail: 'Login successful!'})
              this.signInForm.reset();
              this.router.navigate(['/']);
              },
          error: (error) => {
              this.loading = false;
              this.alertService.error(error?.error?.message || 'Error', error?.error?.data || 'Failed to login')
          }
      });

    }

    get emailControl() { return this.signInForm.get('email')}
    get passwordControl() { return this.signInForm.get('password')}
}
