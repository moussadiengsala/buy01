import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MediaService } from './media.service';
import { TokenService } from '../token/token.service';
import { ApiResponse, Media } from '../../types';
import { HttpStatusCode } from '@angular/common/http';

describe('MediaService', () => {
  let service: MediaService;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;

  const mockMedia: Media = {
    id: '1',
    imagePath: 'test-image.jpg',
    productId: 'product1'
  };

  const mockApiResponse: ApiResponse<Media> = {
    status: HttpStatusCode.Ok,
    message: 'Success',
    data: mockMedia
  };

  beforeEach(() => {
    const tokenSpy = jasmine.createSpyObj('TokenService', ['token']);
    tokenSpy.token = { accessToken: 'test-token' };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MediaService,
        { provide: TokenService, useValue: tokenSpy }
      ]
    });

    service = TestBed.inject(MediaService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMedia', () => {
    it('should return media URL when productId and mediaId are provided', () => {
      const url = service.getMedia('product1', 'media1');
      expect(url).toBe('https://localhost:8082/api/v1/media/product1/media1');
    });

    it('should return null when productId is missing', () => {
      const url = service.getMedia('', 'media1');
      expect(url).toBeNull();
    });

    it('should return null when mediaId is missing', () => {
      const url = service.getMedia('product1', '');
      expect(url).toBeNull();
    });
  });

  describe('getMediaById', () => {
    it('should return media by id', () => {
      service.getMediaById('1').subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/media/1');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockApiResponse);
    });
  });

  describe('getMediaByProductId', () => {
    it('should return media by product id', () => {
      const mockProductMediaResponse: ApiResponse<Media[]> = {
        status: HttpStatusCode.Ok,
        message: 'Success',
        data: [mockMedia]
      };

      service.getMediaByProductId('product1').subscribe(response => {
        expect(response).toEqual(mockProductMediaResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/media/product/product1');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockProductMediaResponse);
    });
  });

  describe('createMedia', () => {
    it('should create media', () => {
      const formData = new FormData();
      formData.append('file', new File([], 'test.jpg'));

      service.createMedia('product1', formData).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/media/product1');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(mockApiResponse);
    });
  });

  describe('updateMedia', () => {
    it('should update media', () => {
      const formData = new FormData();
      formData.append('file', new File([], 'test.jpg'));

      service.updateMedia('1', formData).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/media/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(mockApiResponse);
    });
  });

  describe('deleteMedia', () => {
    it('should delete media', () => {
      service.deleteMedia('1').subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/media/1');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockApiResponse);
    });
  });
});
