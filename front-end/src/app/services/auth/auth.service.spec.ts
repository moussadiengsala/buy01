import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { HttpStatusCode } from '@angular/common/http';
import { environment } from '../../environment';
import { User, UserPayload, Tokens } from '../../types';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;
  let router: Router;

  const API_URL = environment.apiUrl + 'users';

  const mockTokens: Tokens = {
    accessToken: 'fake-access-token',
    refreshToken: 'fake-refresh-token',
  };

  const mockUser: User = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    avatar: null,
    role: 'SELLER' as const
  };

  const mockUserPayload: UserPayload = {
    ...mockUser,
    isAuthenticated: true
  };

  beforeEach(() => {
    // Create a complete mock of TokenService with all required methods
    const tokenServiceSpy = jasmine.createSpyObj<TokenService>('TokenService', [
      'isTokenValid', 'parse', 'remove'
    ]);

    // Mock property getter/setter with proper typing
    let tokenValue: Tokens | null = mockTokens;
    Object.defineProperty(tokenServiceSpy, 'token', {
      get: () => tokenValue,
      set: (value: Tokens | null) => { tokenValue = value; },
      configurable: true
    });

    // Properly mock isTokenValid to return an Observable
    tokenServiceSpy.isTokenValid.and.returnValue(of(mockUserPayload));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        AuthService,
        { provide: TokenService, useValue: tokenServiceSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    router = TestBed.inject(Router);

    spyOn(router, 'navigate');
    spyOn(console, 'error');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should handle errors during initialization', fakeAsync(() => {
      // Mock the error case
      tokenService.isTokenValid.and.returnValue(
          throwError(() => new Error('Token validation error'))
      );

      let initializationComplete = false;
      let initializationError: Error | undefined;
      let userState: UserPayload | undefined;

      service.initializationComplete$.subscribe({
        next: isComplete => initializationComplete = isComplete,
        error: err => initializationError = err
      });

      service.userState$.subscribe(user => {
        userState = user;
      });

      // Re-initialize to trigger the error
      (service as any).initialize().catch((error: { message: any; }) => {
        expect(error.message).toBe('Token validation error');
      });

      tick(); // Process the async operations

      // Verify the state after error
      expect(initializationComplete).toBeFalse();
      expect(initializationError).toBeUndefined(); // Error is caught by the promise
      expect(userState?.isAuthenticated).toBeFalse();
    }));
  });

  describe('register', () => {
    it('should register user and update state on success', () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password');

      tokenService.parse.and.returnValue(mockUser);

      service.register(formData).subscribe(response => {
        expect(response?.status).toBe(HttpStatusCode.Created);
        expect(response?.data).toEqual(mockTokens);
      });

      const req = httpMock.expectOne(`${API_URL}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush({
        status: HttpStatusCode.Created,
        message: 'User registered successfully',
        data: mockTokens
      });

      service.userState$.subscribe(user => {
        expect(user.isAuthenticated).toBeTrue();
        expect(user.id).toBe(mockUser.id);
      });
    });

    it('should handle registration error', () => {
      const formData = new FormData();
      const errorResponse = {
        status: HttpStatusCode.BadRequest,
        message: 'Email already in use'
      };

      let errorMsg: string | undefined;
      service.register(formData).subscribe({
        next: () => fail('Should have failed with error'),
        error: (error) => {
          errorMsg = error.message;
        }
      });

      const req = httpMock.expectOne(`${API_URL}/auth/register`);
      req.flush({ message: 'Email already in use' }, { status: 400, statusText: 'Bad Request' });

      expect(errorMsg).toBeTruthy();
    });
  });

  describe('login', () => {
    it('should login user and update state on success', () => {
      const loginRequest = { email: 'test@example.com', password: 'password' };
      tokenService.parse.and.returnValue(mockUser);

      service.login(loginRequest).subscribe(response => {
        expect(response?.status).toBe(HttpStatusCode.Ok);
        expect(response?.data).toEqual(mockTokens);
      });

      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({
        status: HttpStatusCode.Ok,
        message: 'Login successful',
        data: mockTokens
      });

      service.userState$.subscribe(user => {
        expect(user.isAuthenticated).toBeTrue();
        expect(user.id).toBe(mockUser.id);
      });
    });

    it('should handle login error', () => {
      const loginRequest = { email: 'test@example.com', password: 'wrong-password' };

      let errorMsg: string | undefined;
      service.login(loginRequest).subscribe({
        next: () => fail('Should have failed with error'),
        error: (error) => {
          errorMsg = error.message;
        }
      });

      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      expect(errorMsg).toBeTruthy();
    });
  });

  describe('updateUserState', () => {
    it('should update tokens and user state', () => {
      tokenService.parse.and.returnValue(mockUser);

      service.updateUserState(mockTokens);

      expect(tokenService.token).toEqual(mockTokens);

      service.userState$.subscribe(user => {
        expect(user.isAuthenticated).toBeTrue();
        expect(user.id).toBe(mockUser.id);
        expect(user.email).toBe(mockUser.email);
      });
    });

    it('should throw error if token cannot be parsed', () => {
      tokenService.parse.and.returnValue(null);

      expect(() => service.updateUserState(mockTokens)).toThrowError('Unable to parse the token.');
    });
  });

  describe('logout', () => {
    it('should call the logout API when token exists', () => {
      // Set up mock token
      tokenService.token = mockTokens;
      tokenService.parse.and.returnValue(mockUser);

      service.logout();

      const req = httpMock.expectOne(`${API_URL}/auth/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: mockTokens.refreshToken });

      req.flush({ status: HttpStatusCode.Ok, message: 'Logout successful' });

      expect(router.navigate).toHaveBeenCalledWith(['/auth/sign-in']);
      expect(tokenService.remove).toHaveBeenCalled();

      service.userState$.subscribe(user => {
        expect(user.isAuthenticated).toBeFalse();
        expect(user.id).toBe('');
      });
    });

    it('should handle logout API error and still clear user state', () => {
      tokenService.token = mockTokens;
      tokenService.parse.and.returnValue(mockUser);

      service.logout();

      const req = httpMock.expectOne(`${API_URL}/auth/logout`);
      req.error(new ErrorEvent('Network error'));

      expect(router.navigate).toHaveBeenCalledWith(['/auth/sign-in']);
      expect(tokenService.remove).toHaveBeenCalled();

      service.userState$.subscribe(user => {
        expect(user.isAuthenticated).toBeFalse();
      });
    });

    it('should clear user state without API call when no token exists', () => {
      Object.defineProperty(tokenService, 'token', {
        get: () => null,
        configurable: true
      });
      tokenService.parse.and.returnValue(null);

      service.logout();

      httpMock.expectNone(`${API_URL}/auth/logout`);

      expect(router.navigate).toHaveBeenCalledWith(['/auth/sign-in']);
      expect(tokenService.remove).toHaveBeenCalled();

      service.userState$.subscribe(user => {
        expect(user.isAuthenticated).toBeFalse();
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', () => {
      tokenService.token = mockTokens;
      tokenService.parse.and.returnValue(mockUser);

      service.refreshToken().subscribe(result => {
        expect(result).toEqual(mockTokens);
      });

      const req = httpMock.expectOne(`${API_URL}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: mockTokens.refreshToken });

      req.flush({
        status: HttpStatusCode.Ok,
        message: 'Token refreshed',
        data: mockTokens
      });
    });

    it('should return null when no refresh token exists', () => {
      Object.defineProperty(tokenService, 'token', {
        get: () => null,
        configurable: true
      });
      tokenService.parse.and.returnValue(null);

      service.refreshToken().subscribe(result => {
        expect(result).toBeNull();
      });

      httpMock.expectNone(`${API_URL}/auth/refresh`);
    });

    it('should handle refresh token error and logout user', () => {
      tokenService.token = mockTokens;
      tokenService.parse.and.returnValue(mockUser);
      spyOn(service, 'logout');

      service.refreshToken().subscribe(result => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(`${API_URL}/auth/refresh`);
      req.error(new ErrorEvent('Network error'));

      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('role checking methods', () => {
    beforeEach(() => {
      // Reset the mock user before each test
      tokenService.parse.and.returnValue(mockUser);
      tokenService.isTokenValid.and.returnValue(of(mockUserPayload));

      // Ensure the service has the latest user state
      (service as any).user.next(mockUserPayload);
    });

    it('should correctly identify authenticated users', () => {
      // Verify initial state
      expect(service.isAuthenticated()).withContext('should be authenticated initially').toBeTrue();

      // Test unauthenticated case
      tokenService.isTokenValid.and.returnValue(of(null));
      (service as any).user.next({...mockUserPayload, isAuthenticated: false});
      expect(service.isAuthenticated()).withContext('should not be authenticated after change').toBeFalse();
    });

    it('should correctly identify sellers', () => {
      // Initial state should be SELLER
      expect(service.isSeller()).withContext('initial user should be seller').toBeTrue();

      // Test CLIENT role
      const clientUserPayload = {...mockUserPayload, role: 'CLIENT' as const};
      tokenService.parse.and.returnValue({...mockUser, role: 'CLIENT'});
      (service as any).user.next(clientUserPayload);

      expect(service.isSeller()).withContext('client user should not be seller').toBeFalse();
    });

    it('should check if user has specific role', () => {
      // Initial state checks (SELLER)
      expect(service.hasRole('SELLER')).withContext('should have SELLER role initially').toBeTrue();
      expect(service.hasRole('CLIENT')).withContext('should not have CLIENT role initially').toBeFalse();
      expect(service.hasRole(['SELLER', 'ADMIN'])).withContext('should match array with SELLER').toBeTrue();
      expect(service.hasRole(['CLIENT', 'ADMIN'])).withContext('should not match array without SELLER').toBeFalse();

      // Change to CLIENT
      const clientUserPayload = {...mockUserPayload, role: 'CLIENT' as const};
      tokenService.parse.and.returnValue({...mockUser, role: 'CLIENT'});
      (service as any).user.next(clientUserPayload);

      // Verify CLIENT role checks
      expect(service.hasRole('CLIENT')).withContext('should have CLIENT role after change').toBeTrue();
      expect(service.hasRole('SELLER')).withContext('should not have SELLER role after change').toBeFalse();
    });
  });
});