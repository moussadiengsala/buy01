import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

import { ApiResponse, Tokens, User, UserPayload } from '../../types';
import { TokenService } from "./token.service";

describe('TokenService', () => {
  let service: TokenService;
  let httpMock: HttpTestingController;
  let localStorageSpy: jasmine.SpyObj<Storage>;
  let jwtHelperSpy: jasmine.SpyObj<JwtHelperService>;

  const mockTokens: Tokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  };

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'CLIENT',
    avatar: null
  };

  const mockApiResponse: ApiResponse<User> = {
    status: HttpStatusCode.Ok,
    data: mockUser,
    message: 'Success'
  };

  // Store original localStorage
  let originalLocalStorage: PropertyDescriptor | undefined;

  beforeEach(() => {
    // Create localStorage spy
    localStorageSpy = jasmine.createSpyObj<Storage>('localStorage', ['getItem', 'setItem', 'removeItem']);

    // Create JWT helper spy with proper typing
    jwtHelperSpy = jasmine.createSpyObj<JwtHelperService>('JwtHelperService', ['decodeToken']);
    jwtHelperSpy.decodeToken.and.returnValue(mockUser);

    // Store original localStorage
    originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');

    // Configure testing module
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TokenService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: JwtHelperService,
          useValue: jwtHelperSpy
        }
      ]
    });

    // Override localStorage with spy
    Object.defineProperty(window, 'localStorage', {
      get: () => localStorageSpy,
      configurable: true
    });

    // Get service and http mock
    service = TestBed.inject(TokenService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  afterAll(() => {
    // Restore original localStorage after tests
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', originalLocalStorage);
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('token setter', () => {
    it('should store tokens in localStorage', () => {
      service.token = mockTokens;
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('BUY_01', JSON.stringify(mockTokens));
    });

    it('should not store tokens when not in browser platform', () => {
      // Re-configure service with server platform ID
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          TokenService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      const serverService = TestBed.inject(TokenService);
      serverService.token = mockTokens;

      expect(localStorageSpy.setItem).not.toHaveBeenCalled();
    });
  });

  describe('token getter', () => {
    it('should retrieve tokens from localStorage', () => {
      localStorageSpy.getItem.and.returnValue(JSON.stringify(mockTokens));

      const result = service.token;

      expect(localStorageSpy.getItem).toHaveBeenCalledWith('BUY_01');
      expect(result).toEqual(mockTokens);
    });

    it('should return null when localStorage is empty', () => {
      localStorageSpy.getItem.and.returnValue(null);

      const result = service.token;

      expect(result).toBeNull();
    });

    it('should return null when not in browser platform', () => {
      // Re-configure service with server platform ID
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          TokenService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      const serverService = TestBed.inject(TokenService);
      const result = serverService.token;

      expect(result).toBeNull();
      expect(localStorageSpy.getItem).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove token from localStorage', () => {
      service.remove();
      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('BUY_01');
    });

    it('should not attempt to remove when not in browser platform', () => {
      // Re-configure service with server platform ID
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          TokenService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      const serverService = TestBed.inject(TokenService);
      serverService.remove();

      expect(localStorageSpy.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('parse', () => {
    it('should decode token when token exists', () => {
      spyOnProperty(service, 'token', 'get').and.returnValue(mockTokens);
      const result = service.parse();

      expect(jwtHelperSpy.decodeToken).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null when token does not exist', () => {
      spyOnProperty(service, 'token', 'get').and.returnValue(null);

      const result = service.parse();

      expect(jwtHelperSpy.decodeToken).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('isTokenValid', () => {
    it('should return user with isAuthenticated true when API returns success', () => {
      // Mock parse to return user
      spyOn(service, 'parse').and.returnValue(mockUser);
      spyOnProperty(service, 'token', 'get').and.returnValue(mockTokens);

      let result: UserPayload | null = null;
      service.isTokenValid().subscribe(res => {
        result = res;
      });

      const req = httpMock.expectOne(`https://localhost:8082/api/v1/users/${mockUser.id}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockTokens.accessToken}`);
      req.flush(mockApiResponse);

      expect(result).toEqual(jasmine.objectContaining({
        ...mockUser,
        isAuthenticated: true
      }));
    });

    it('should return null when API returns non-OK status', () => {
      // Mock parse to return user
      spyOn(service, 'parse').and.returnValue(mockUser);
      spyOnProperty(service, 'token', 'get').and.returnValue(mockTokens);

      let result: UserPayload | null = null;
      service.isTokenValid().subscribe(res => {
        result = res;
      });

      const req = httpMock.expectOne(`https://localhost:8082/api/v1/users/${mockUser.id}`);
      req.flush({
        status: HttpStatusCode.Unauthorized,
        data: null,
        message: 'Unauthorized'
      }, { status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized' });

      expect(result).toBeNull();
    });

    it('should return null when parse returns null', () => {
      // Mock parse to return null
      spyOn(service, 'parse').and.returnValue(null);

      let result: UserPayload | null = null;
      service.isTokenValid().subscribe(res => {
        result = res;
      });

      httpMock.expectNone(`https://localhost:8082/api/v1/users/${mockUser.id}`);
      expect(result).toBeNull();
    });

    it('should return null when API request fails', () => {
      // Mock parse to return user
      spyOn(service, 'parse').and.returnValue(mockUser);
      spyOnProperty(service, 'token', 'get').and.returnValue(mockTokens);

      let result: UserPayload | null = null;
      service.isTokenValid().subscribe(res => {
        result = res;
      });

      const req = httpMock.expectOne(`https://localhost:8082/api/v1/users/${mockUser.id}`);
      req.error(new ErrorEvent('Network error'));

      expect(result).toBeNull();
    });
  });
});