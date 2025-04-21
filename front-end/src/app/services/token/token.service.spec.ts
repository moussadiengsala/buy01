import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TokenService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    
    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('token operations', () => {
    it('should store and retrieve token from localStorage', () => {
      const mockToken = { accessToken: 'test-token', refreshToken: 'test-refresh' };
      service.token = mockToken;
      
      const retrievedToken = service.token;
      expect(retrievedToken).toEqual(mockToken);
      
      // Clean up
      service.remove();
      expect(service.token).toBeNull();
    });
  });
});
