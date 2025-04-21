import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { TokenService } from '../token/token.service';
import { MediaService } from '../media/media.service';
import { UsersService } from '../user/users.service';
import { ApiResponse, CreateProduct, FullProduct, PaginatedResponse, Product, ProductMedia } from '../../types';
import { of } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;
  let mediaService: jasmine.SpyObj<MediaService>;
  let userService: jasmine.SpyObj<UsersService>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    quantity: 10,
    userID: 'user1'
  };

  const mockProductMedia: ProductMedia = {
    product: mockProduct,
    media: []
  };

  const mockPaginatedResponse: PaginatedResponse<Product> = {
    content: [mockProduct],
    page: {
      totalPages: 1,
      totalElements: 1,
      size: 10,
      number: 0
    }
  };

  const mockApiResponse: ApiResponse<Product> = {
    status: HttpStatusCode.Ok,
    message: 'Success',
    data: mockProduct
  };

  const mockCreateProduct: CreateProduct = {
    name: 'New Product',
    description: 'New Description',
    price: 200,
    quantity: 20
  };

  beforeEach(() => {
    const tokenSpy = jasmine.createSpyObj('TokenService', ['token']);
    const mediaSpy = jasmine.createSpyObj('MediaService', ['getMediaByProductId']);
    const userSpy = jasmine.createSpyObj('UsersService', ['getCurrentUser']);

    tokenSpy.token = { accessToken: 'test-token' };
    mediaSpy.getMediaByProductId.and.returnValue(of({
      status: HttpStatusCode.Ok,
      message: 'Success',
      data: []
    }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductService,
        { provide: TokenService, useValue: tokenSpy },
        { provide: MediaService, useValue: mediaSpy },
        { provide: UsersService, useValue: userSpy }
      ]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    mediaService = TestBed.inject(MediaService) as jasmine.SpyObj<MediaService>;
    userService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllProducts', () => {
    it('should return paginated products', () => {
      service.getAllProducts(0, 10).subscribe(response => {
        expect(response.data).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/?page=0&size=10');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({
        status: HttpStatusCode.Ok,
        message: 'Success',
        data: mockPaginatedResponse
      });
    });
  });

  describe('getProductById', () => {
    it('should return product by id', () => {
      service.getProductById('1').subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/1');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockApiResponse);
    });
  });

  describe('getProductsByUserId', () => {
    it('should return paginated products for a user', () => {
      service.getProductsByUserId('user1', 0, 10).subscribe(response => {
        expect(response.data).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/users/user1?page=0&size=10');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({
        status: HttpStatusCode.Ok,
        message: 'Success',
        data: mockPaginatedResponse
      });
    });
  });

  describe('getSingleProductsMedia', () => {
    it('should return product with media', () => {
      service.getSingleProductsMedia('1').subscribe(response => {
        expect(response.status).toBe(HttpStatusCode.Ok);
        expect(response.data.product).toEqual(mockProduct);
        expect(response.data.media).toEqual([]);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/1');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockApiResponse);
    });
  });

  describe('getAllProductsMedia', () => {
    it('should return paginated products with media', () => {
      service.getAllProductsMedia(0, 10).subscribe(response => {
        expect(response.status).toBe(HttpStatusCode.Ok);
        expect(response.data.content[0].product).toEqual(mockProduct);
        expect(response.data.content[0].media).toEqual([]);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/?page=0&size=10');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({
        status: HttpStatusCode.Ok,
        message: 'Success',
        data: mockPaginatedResponse
      });
    });

    it('should handle empty products list', () => {
      service.getAllProductsMedia(0, 10).subscribe(response => {
        expect(response.data.content).toEqual([]);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/?page=0&size=10');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({
        status: HttpStatusCode.Ok,
        message: 'Success',
        data: {
          content: [],
          page: {
            totalPages: 0,
            totalElements: 0,
            size: 10,
            number: 0
          }
        }
      });
    });
  });

  describe('getProductsWithMediaByUserId', () => {
    it('should return paginated products with media for a user', () => {
      service.getProductsWithMediaByUserId('user1', 0, 10).subscribe(response => {
        expect(response.status).toBe(HttpStatusCode.Ok);
        expect(response.data.content[0].product).toEqual(mockProduct);
        expect(response.data.content[0].media).toEqual([]);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/users/user1?page=0&size=10');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({
        status: HttpStatusCode.Ok,
        message: 'Success',
        data: mockPaginatedResponse
      });
    });

    it('should handle empty products list', () => {
      service.getProductsWithMediaByUserId('user1', 0, 10).subscribe(response => {
        expect(response.data.content).toEqual([]);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/users/user1?page=0&size=10');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({
        status: HttpStatusCode.Ok,
        message: 'Success',
        data: {
          content: [],
          page: {
            totalPages: 0,
            totalElements: 0,
            size: 10,
            number: 0
          }
        }
      });
    });
  });

  describe('createProduct', () => {
    it('should create product', () => {
      service.createProduct(mockCreateProduct).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockApiResponse);
    });
  });

  describe('updateProduct', () => {
    it('should update product', () => {
      const updates: Product = {
        ...mockProduct,
        name: 'Updated Product',
        price: 150
      };

      service.updateProduct('1', updates).subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockApiResponse);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', () => {
      service.deleteProduct('1').subscribe(response => {
        expect(response).toEqual(mockApiResponse);
      });

      const req = httpMock.expectOne('https://localhost:8082/api/v1/products/1');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockApiResponse);
    });
  });
});
