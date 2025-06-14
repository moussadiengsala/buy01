import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignInComponent } from './sign-in.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { AlertService } from '../../../services/alert/alert.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { AlertComponent } from '../../../components/alert/alert.component';
import { ApiResponse, Tokens, UserLoginRequest } from '../../../types';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideInfo, lucideCircleX, lucideMessageCircleWarning, lucideX } from '@ng-icons/lucide';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let alertServiceMock: jasmine.SpyObj<AlertService>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;
  let routerMock: jasmine.SpyObj<Router>;
  let alertSubject: BehaviorSubject<any>;

  const mockLoginRequest: UserLoginRequest = {
    email: 'test@example.com',
    password: 'Test123!@#'
  };

  const mockTokenResponse: ApiResponse<Tokens> = {
    message: '',
    data: {
      accessToken: '',
      refreshToken: ''
    },
    status: 200
  };

  beforeEach(async () => {
    // Create alert subject for the AlertService mock
    alertSubject = new BehaviorSubject(null);

    // Create spies for services
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    alertServiceMock = jasmine.createSpyObj('AlertService', ['clear', 'error'], {
      alert$: alertSubject.asObservable()
    });
    messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        SignInComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: SignInComponent },
          { path: 'auth/sign-in', component: SignInComponent }
        ]),
        CardModule,
        ButtonModule,
        InputGroupModule,
        InputGroupAddonModule,
        PasswordModule,
        MessagesModule,
        ToastModule,
        AlertComponent
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: AlertService, useValue: alertServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: Router, useValue: routerMock },
        provideIcons({ lucideCheck, lucideInfo, lucideCircleX, lucideMessageCircleWarning, lucideX })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form', () => {
      expect(component.signInForm.get('email')?.value).toBe('');
      expect(component.signInForm.get('password')?.value).toBe('');
    });

    it('should have required validators', () => {
      const emailControl = component.signInForm.get('email');
      const passwordControl = component.signInForm.get('password');

      emailControl?.setValue('');
      passwordControl?.setValue('');

      expect(emailControl?.valid).toBeFalsy();
      expect(passwordControl?.valid).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailControl = component.signInForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.errors?.['email']).toBeTruthy();
    });

    it('should validate password pattern', () => {
      const passwordControl = component.signInForm.get('password');
      passwordControl?.setValue('weak');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.errors?.['pattern']).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.onSubmit();
      expect(authServiceMock.login).not.toHaveBeenCalled();
      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Make sure to fill all required fields correctly!'
      });
    });

    it('should submit form and navigate on successful login', () => {
      authServiceMock.login.and.returnValue(of(mockTokenResponse));
      component.signInForm.patchValue(mockLoginRequest);
      component.onSubmit();

      expect(authServiceMock.login).toHaveBeenCalledWith(mockLoginRequest);
      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Login successful!'
      });
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
      expect(component.signInForm.pristine).toBeTruthy();
    });

    it('should handle error on login failure', () => {
      const errorMessage = 'Invalid credentials';
      authServiceMock.login.and.returnValue(throwError(() => errorMessage));

      component.signInForm.patchValue(mockLoginRequest);
      component.onSubmit();

      expect(alertServiceMock.error).toHaveBeenCalledWith('Failed to login', errorMessage);
      expect(component.loading).toBeFalse();
    });
  });

  describe('Form Controls', () => {
    it('should have getters for form controls', () => {
      expect(component.emailControl).toBeTruthy();
      expect(component.passwordControl).toBeTruthy();
    });
  });
});