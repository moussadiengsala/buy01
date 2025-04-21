import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TokenService } from '../token/token.service';
import { ApiResponse, Tokens, User, UserLoginRequest, UserPayload } from '../../types';
import { of } from 'rxjs';
import { AuthService } from './auth-service.service';
import { Router } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;
  let router: jasmine.SpyObj<Router>;

  const mockToken: Tokens = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token'
  };

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'CLIENT',
    avatar: null
  };

  const mockApiResponse: ApiResponse<Tokens> = {
    status: HttpStatusCode.Ok,
    message: 'Success',
    data: mockToken
  };

  beforeEach(() => {
    const tokenSpy = jasmine.createSpyObj('TokenService', ['isTokenValid', 'token', 'parse', 'remove']);
    tokenSpy.isTokenValid.and.returnValue(of(mockUser));
    tokenSpy.token = mockToken;
    tokenSpy.parse.and.returnValue(mockUser);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: TokenService, useValue: tokenSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user and store token', () => {
      const credentials: UserLoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
        expect(tokenService.token).toEqual(mockToken);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/users/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockApiResponse);
    });
  });

  describe('register', () => {
    it('should register new user', () => {
      const formData = new FormData();
      formData.append('username', 'testuser');
      formData.append('email', 'test@example.com'); 
      formData.append('password', 'password123');
      formData.append('role', 'SELLER');

      service.register(formData).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
        expect(tokenService.token).toEqual(mockToken);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/users/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush(mockApiResponse);
    });
  });

  describe('logout', () => {
    it('should clear token and navigate to sign-in', () => {
      service.logout();
      expect(tokenService.remove).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/sign-in']);
    });
  });

  describe('isSeller', () => {
    it('should return true when user is a seller', () => {
      const sellerUserPayload: UserPayload = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'SELLER',
        avatar: null,
        isAuthenticated: true
      };
      
      (service as any).user.next(sellerUserPayload);
      
      expect(service.isSeller()).toBe(true);
    });

    it('should return false when user is not a seller', () => {
      const clientUserPayload: UserPayload = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENT',
        avatar: null,
        isAuthenticated: true
      };
      
      (service as any).user.next(clientUserPayload);
      
      expect(service.isSeller()).toBe(false);
    });
  });
}); 
