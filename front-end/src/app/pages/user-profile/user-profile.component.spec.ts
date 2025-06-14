import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileComponent } from './user-profile.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgClass, NgIf } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import {ApiResponse, Product, Role, Tokens, UserPayload} from '../../types';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockUser: UserPayload = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: Role.SELLER,
    avatar: null,
    isAuthenticated: true
  };

  beforeEach(async () => {
    // Create spies for services
    userServiceMock = jasmine.createSpyObj('UserService', ['updateUser']);
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      userState$: of(mockUser)
    });
    messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        UserProfileComponent,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        ToastModule
      ],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.updating).toBeFalse();
      expect(component.deleting).toBeFalse();
      expect(component.isVisible).toBeFalse();
      expect(component.userName).toBe(mockUser.name);
      expect(component.avatarPreview).toBeNull();
      expect(component.avatarFileName).toBeNull();
      expect(component.avatarFile).toBeNull();
    });

    it('should initialize form with empty values', () => {
      expect(component.form.get('name')?.value).toBe('');
      expect(component.form.get('prev_password')?.value).toBe('');
      expect(component.form.get('new_password')?.value).toBe('');
      expect(component.form.get('avatar')?.value).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should not update if already updating', () => {
      component.updating = true;
      component.updateProfile();
      expect(userServiceMock.updateUser).not.toHaveBeenCalled();
    });

    it('should show error message if form has validation errors', () => {
      component.form.patchValue({
        name: 'Invalid@Name',
        prev_password: 'weak',
        new_password: 'weak'
      });
      component.updateProfile();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Validation Failed',
        detail: 'Please check the form for errors.'
      });
      expect(userServiceMock.updateUser).not.toHaveBeenCalled();
    });

    it('should show info message if no changes made', () => {
      component.updateProfile();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'No Changes',
        detail: 'You must modify a field to update your profile.'
      });
      expect(userServiceMock.updateUser).not.toHaveBeenCalled();
    });

    it('should update profile successfully', () => {
      const updatedName = 'New Name';
      const response: ApiResponse<Tokens> = {
        message: 'Profile updated successfully',
        data: {
          accessToken: '',
          refreshToken: ''
        },
        status: 200
      };
      userServiceMock.updateUser.and.returnValue(of(response));

      component.form.patchValue({ name: updatedName });
      component.updateProfile();

      expect(userServiceMock.updateUser).toHaveBeenCalled();
      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: response.message
      });
      expect(component.form.get('prev_password')?.value).toBe('');
      expect(component.form.get('new_password')?.value).toBe('');
    });

    it('should handle update error', () => {
      const error = { error: { message: 'Update failed' } };
      userServiceMock.updateUser.and.returnValue(throwError(() => error));

      component.form.patchValue({ name: 'New Name' });
      component.updateProfile();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Update failed'
      });
      expect(component.updating).toBeFalse();
    });
  });

  describe('File Handling', () => {
    it('should handle file selection', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } } as unknown as Event;

      component.onFileSelected(event);

      expect(component.avatarFile).toBe(file);
      expect(component.avatarFileName).toBe('test.jpg');
    });

    it('should reject invalid file types', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [file] } } as unknown as Event;
      spyOn(window, 'alert');

      component.onFileSelected(event);

      expect(window.alert).toHaveBeenCalledWith('Please select a valid image file (JPEG, PNG, or GIF)');
      expect(component.avatarFile).toBeNull();
    });

    it('should reject files larger than 10MB', () => {
      const file = new File([''], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
      const event = { target: { files: [file] } } as unknown as Event;
      spyOn(window, 'alert');

      component.onFileSelected(event);

      expect(window.alert).toHaveBeenCalledWith('File size must be less than 10MB');
      expect(component.avatarFile).toBeNull();
    });

    it('should remove avatar', () => {
      component.avatarFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      component.avatarPreview = 'preview-url';
      component.avatarFileName = 'test.jpg';

      component.removeAvatar();

      expect(component.avatarFile).toBeNull();
      expect(component.avatarPreview).toBeNull();
      expect(component.avatarFileName).toBeNull();
    });
  });

  describe('Role Check', () => {
    it('should correctly identify seller role', () => {
      expect(component.isSeller()).toBeTrue();

      authServiceMock.userState$ = of({ ...mockUser, role: Role.CLIENT });
      fixture = TestBed.createComponent(UserProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isSeller()).toBeFalse();
    });
  });
}); 