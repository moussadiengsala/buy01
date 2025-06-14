// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { SignUpComponent } from './sign-up.component';
// import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// import { AuthService } from '../../../services/auth/auth.service';
// import { AlertService } from '../../../services/alert/alert.service';
// import { MessageService } from 'primeng/api';
// import { Router } from '@angular/router';
// import {BehaviorSubject, of, throwError} from 'rxjs';
// import { RouterTestingModule } from '@angular/router/testing';
// import { CardModule } from 'primeng/card';
// import { ButtonModule } from 'primeng/button';
// import { InputGroupModule } from 'primeng/inputgroup';
// import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
// import { PasswordModule } from 'primeng/password';
// import { MessagesModule } from 'primeng/messages';
// import { ToastModule } from 'primeng/toast';
// import { AlertComponent } from '../../../components/alert/alert.component';
// import { FileUploadModule } from 'primeng/fileupload';
// import { RadioButtonModule } from 'primeng/radiobutton';
// import { DividerModule } from 'primeng/divider';
// import {ApiResponse, Role, Tokens} from '../../../types';
// import {provideIcons} from "@ng-icons/core";
// import {lucideCheck, lucideCircleX, lucideInfo, lucideMessageCircleWarning, lucideX} from '@ng-icons/lucide';
//
// describe('SignUpComponent', () => {
//   let component: SignUpComponent;
//   let fixture: ComponentFixture<SignUpComponent>;
//   let authServiceMock: jasmine.SpyObj<AuthService>;
//   let alertServiceMock: jasmine.SpyObj<AlertService>;
//   let messageServiceMock: jasmine.SpyObj<MessageService>;
//   let routerMock: jasmine.SpyObj<Router>;
//   let alertSubject: BehaviorSubject<any>;
//
//   const mockFormData = {
//     name: 'John Doe',
//     email: 'john@example.com',
//     password: 'Test123!@#',
//     role: Role.CLIENT,
//     avatar: null
//   };
//
//   const mockTokenResponse: ApiResponse<Tokens> = {
//     message: '',
//     data: {
//       accessToken: '',
//       refreshToken: ''
//     },
//     status: 200
//   };
//
//   beforeEach(async () => {
//     // Create alert subject for the AlertService mock
//     alertSubject = new BehaviorSubject(null);
//
//     // Create spies for services
//     authServiceMock = jasmine.createSpyObj('AuthService', ['register']);
//     alertServiceMock = jasmine.createSpyObj('AlertService', ['clear', 'error'], {
//       alert$: alertSubject.asObservable()
//     });
//     messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
//     routerMock = jasmine.createSpyObj('Router', ['navigate']);
//
//     await TestBed.configureTestingModule({
//       imports: [
//         SignUpComponent,
//         ReactiveFormsModule,
//         RouterTestingModule,
//         CardModule,
//         ButtonModule,
//         InputGroupModule,
//         InputGroupAddonModule,
//         PasswordModule,
//         MessagesModule,
//         ToastModule,
//         AlertComponent,
//         FileUploadModule,
//         RadioButtonModule,
//         DividerModule
//       ],
//       providers: [
//         FormBuilder,
//         { provide: AuthService, useValue: authServiceMock },
//         { provide: AlertService, useValue: alertServiceMock },
//         { provide: MessageService, useValue: messageServiceMock },
//         { provide: Router, useValue: routerMock },
//         provideIcons({ lucideCheck, lucideInfo, lucideCircleX, lucideMessageCircleWarning, lucideX })
//       ]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(SignUpComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe('Form Initialization', () => {
//     it('should initialize with empty form and default role', () => {
//       expect(component.signUpForm.get('name')?.value).toBe('');
//       expect(component.signUpForm.get('email')?.value).toBe('');
//       expect(component.signUpForm.get('password')?.value).toBe('');
//       expect(component.signUpForm.get('role')?.value).toBe(Role.CLIENT);
//       expect(component.signUpForm.get('avatar')?.value).toBeNull();
//     });
//
//     it('should have required validators', () => {
//       const nameControl = component.signUpForm.get('name');
//       const emailControl = component.signUpForm.get('email');
//       const passwordControl = component.signUpForm.get('password');
//       const roleControl = component.signUpForm.get('role');
//
//       nameControl?.setValue('');
//       emailControl?.setValue('');
//       passwordControl?.setValue('');
//       roleControl?.setValue(null);
//
//       expect(nameControl?.valid).toBeFalsy();
//       expect(emailControl?.valid).toBeFalsy();
//       expect(passwordControl?.valid).toBeFalsy();
//       expect(roleControl?.valid).toBeFalsy();
//     });
//   });
//
//   describe('Form Validation', () => {
//     it('should validate name pattern', () => {
//       const nameControl = component.signUpForm.get('name');
//       nameControl?.setValue('Invalid@Name');
//       expect(nameControl?.valid).toBeFalsy();
//       expect(nameControl?.errors?.['pattern']).toBeTruthy();
//     });
//
//     it('should validate email format', () => {
//       const emailControl = component.signUpForm.get('email');
//       emailControl?.setValue('invalid-email');
//       expect(emailControl?.valid).toBeFalsy();
//       expect(emailControl?.errors?.['email']).toBeTruthy();
//     });
//
//     it('should validate password pattern', () => {
//       const passwordControl = component.signUpForm.get('password');
//       passwordControl?.setValue('weak');
//       expect(passwordControl?.valid).toBeFalsy();
//       expect(passwordControl?.errors?.['pattern']).toBeTruthy();
//     });
//   });
//
//   describe('onSubmit', () => {
//     it('should not submit if form is invalid', () => {
//       component.onSubmit();
//       expect(authServiceMock.register).not.toHaveBeenCalled();
//       expect(messageServiceMock.add).toHaveBeenCalledWith({
//         severity: 'error',
//         summary: 'Error',
//         detail: 'Make sure to fill all required fields correctly!'
//       });
//     });
//
//     it('should submit form and navigate on successful registration', () => {
//       authServiceMock.register.and.returnValue(of(mockTokenResponse));
//       component.signUpForm.patchValue(mockFormData);
//       component.onSubmit();
//
//       expect(authServiceMock.register).toHaveBeenCalled();
//       expect(messageServiceMock.add).toHaveBeenCalledWith({
//         severity: 'success',
//         summary: 'Success',
//         detail: 'Registration successful!'
//       });
//       expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
//       expect(component.signUpForm.get('role')?.value).toBe(Role.CLIENT);
//     });
//
//     it('should handle error on registration failure', () => {
//       const errorMessage = 'Registration failed';
//       authServiceMock.register.and.returnValue(throwError(() => errorMessage));
//
//       component.signUpForm.patchValue(mockFormData);
//       component.onSubmit();
//
//       expect(alertServiceMock.error).toHaveBeenCalledWith('Failed to register', errorMessage);
//       expect(component.loading).toBeFalse();
//     });
//   });
//
//   describe('File Handling', () => {
//     it('should handle file selection', () => {
//       const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
//       const event = { target: { files: [file] } } as unknown as Event;
//
//       component.onFileSelected(event);
//
//       expect(component.avatarFile).toBe(file);
//       expect(component.avatarFileName).toBe('test.jpg');
//     });
//
//     it('should reject invalid file types', () => {
//       const file = new File([''], 'test.txt', { type: 'text/plain' });
//       const event = { target: { files: [file] } } as unknown as Event;
//       spyOn(window, 'alert');
//
//       component.onFileSelected(event);
//
//       expect(window.alert).toHaveBeenCalledWith('Please select a valid image file (JPEG, PNG, or GIF)');
//       expect(component.avatarFile).toBeNull();
//     });
//
//     it('should reject files larger than 10MB', () => {
//       const file = new File([''], 'large.jpg', { type: 'image/jpeg' });
//       Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
//       const event = { target: { files: [file] } } as unknown as Event;
//       spyOn(window, 'alert');
//
//       component.onFileSelected(event);
//
//       expect(window.alert).toHaveBeenCalledWith('File size must be less than 10MB');
//       expect(component.avatarFile).toBeNull();
//     });
//
//     it('should remove avatar', () => {
//       component.avatarFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
//       component.avatarPreview = 'preview-url';
//       component.avatarFileName = 'test.jpg';
//
//       component.removeAvatar();
//
//       expect(component.avatarFile).toBeNull();
//       expect(component.avatarPreview).toBeNull();
//       expect(component.avatarFileName).toBeNull();
//     });
//   });
//
//   describe('Form Controls and Role Check', () => {
//     it('should have getters for form controls', () => {
//       expect(component.nameControl).toBeTruthy();
//       expect(component.emailControl).toBeTruthy();
//       expect(component.passwordControl).toBeTruthy();
//       expect(component.roleControl).toBeTruthy();
//     });
//
//     it('should correctly identify seller role', () => {
//       component.signUpForm.patchValue({ role: Role.SELLER });
//       expect(component.isSeller()).toBeTrue();
//
//       component.signUpForm.patchValue({ role: Role.CLIENT });
//       expect(component.isSeller()).toBeFalse();
//     });
//   });
// });
