// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { DashboardComponent } from './dashboard.component';
// import { AuthService } from '../../services/auth/auth.service';
// import { ProductService } from '../../services/product/product.service';
// import { MessageService } from 'primeng/api';
// import { Router } from '@angular/router';
// import { of, throwError } from 'rxjs';
// import { RouterTestingModule } from '@angular/router/testing';
// import { AvatarModule } from 'primeng/avatar';
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { TagModule } from 'primeng/tag';
// import { IconFieldModule } from 'primeng/iconfield';
// import { InputIconModule } from 'primeng/inputicon';
// import { InputTextModule } from 'primeng/inputtext';
// import { MultiSelectModule } from 'primeng/multiselect';
// import { DropdownModule } from 'primeng/dropdown';
// import { MenuModule } from 'primeng/menu';
// import { FormsModule } from '@angular/forms';
// import { EditProductComponent } from '../../components/edit-product/edit-product.component';
// import { AddProductComponent } from '../../components/add-product/add-product.component';
// import { DeleteProductComponent } from '../../components/delete-product/delete-product.component';
// import { MediaLayoutComponent } from '../../components/media-layout/media-layout.component';
// import { ToastModule } from 'primeng/toast';
// import { TextPreviewComponent } from '../../components/text-preview/text-preview.component';
// import { Paginator } from 'primeng/paginator';
// import {ACTION, ApiResponse, PaginatedResponse, ProductMedia, ToastMessage, UserPayload} from '../../types';
//
// describe('DashboardComponent', () => {
//   let component: DashboardComponent;
//   let fixture: ComponentFixture<DashboardComponent>;
//   let authServiceMock: jasmine.SpyObj<AuthService>;
//   let productServiceMock: jasmine.SpyObj<ProductService>;
//   let messageServiceMock: jasmine.SpyObj<MessageService>;
//   let routerMock: jasmine.SpyObj<Router>;
//
//   const mockUser: UserPayload = {
//     id: '123',
//     name: 'Test User',
//     email: 'test@example.com',
//     role: 'SELLER',
//     avatar: null,
//     isAuthenticated: true
//   };
//
//   const mockProducts: PaginatedResponse<ProductMedia> = {
//     content: [
//       {
//         product: {
//           id: '1',
//           name: 'Test Product',
//           description: 'Test Description',
//           price: 99.99,
//           quantity: 10,
//           userID: '123'
//         },
//         media: []
//       }
//     ],
//     page: {
//       totalElements: 1,
//       totalPages: 1,
//       size: 10,
//       number: 0
//     }
//   };
//
//   const mockResponse: ApiResponse<PaginatedResponse<ProductMedia>> = {
//     message: "",
//     data: mockProducts,
//     status: 200
//   }
//
//   beforeEach(async () => {
//     // Create spies for services
//     authServiceMock = jasmine.createSpyObj('AuthService', [], {
//       userState$: of(mockUser)
//     });
//     productServiceMock = jasmine.createSpyObj('ProductService', ['getProductsWithMediaByUserId']);
//     messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
//     routerMock = jasmine.createSpyObj('Router', ['navigate']);
//
//     await TestBed.configureTestingModule({
//       imports: [
//         DashboardComponent,
//         RouterTestingModule,
//         AvatarModule,
//         TableModule,
//         ButtonModule,
//         TagModule,
//         IconFieldModule,
//         InputIconModule,
//         InputTextModule,
//         MultiSelectModule,
//         DropdownModule,
//         MenuModule,
//         FormsModule,
//         AddProductComponent,
//         EditProductComponent,
//         DeleteProductComponent,
//         MediaLayoutComponent,
//         ToastModule,
//         TextPreviewComponent,
//         Paginator
//       ],
//       providers: [
//         { provide: AuthService, useValue: authServiceMock },
//         { provide: ProductService, useValue: productServiceMock },
//         { provide: MessageService, useValue: messageServiceMock },
//         { provide: Router, useValue: routerMock }
//       ]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(DashboardComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe('Initialization', () => {
//     it('should initialize with default values', () => {
//       expect(component.currentPage).toBe(0);
//       expect(component.pageSize).toBe(10);
//       expect(component.loading).toBeFalse();
//       expect(component.products).toBeNull();
//     });
//
//     it('should load products on initialization', () => {
//       productServiceMock.getProductsWithMediaByUserId.and.returnValue(of(mockResponse));
//       component.ngOnInit();
//       expect(productServiceMock.getProductsWithMediaByUserId).toHaveBeenCalledWith(mockUser.id, 0, 10);
//       expect(component.products).toEqual(mockProducts);
//     });
//   });
//
//   describe('getMedia', () => {
//     it('should return correct media URL', () => {
//       const productId = '123';
//       const mediaPath = 'test.jpg';
//       const expectedUrl = `https://localhost:8082/api/v1/media/${productId}/${mediaPath}`;
//       expect(component.getMedia(productId, mediaPath)).toBe(expectedUrl);
//     });
//   });
//
//   describe('loadProducts', () => {
//     it('should load products successfully', () => {
//       productServiceMock.getProductsWithMediaByUserId.and.returnValue(of(mockResponse));
//       component.loadProducts();
//       expect(component.products).toEqual(mockProducts);
//     });
//
//     it('should redirect to sign-in if user is not authenticated', () => {
//       authServiceMock.userState$ = of({ ...mockUser, isAuthenticated: false });
//       component.loadProducts();
//       expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/sign-in']);
//     });
//
//     it('should handle error and redirect to error page', () => {
//       const error = { error: { message: 'Test Error', status: 500 } };
//       productServiceMock.getProductsWithMediaByUserId.and.returnValue(throwError(() => error));
//       component.loadProducts();
//       expect(routerMock.navigate).toHaveBeenCalledWith(['/error', {
//         message: 'Test Error',
//         status: 500
//       }]);
//     });
//   });
//
//   describe('Pagination', () => {
//     it('should handle next page', () => {
//       const currentPage = 0;
//       const totalPages = 2;
//       productServiceMock.getProductsWithMediaByUserId.and.returnValue(of(mockResponse));
//       component.onNextPage(currentPage, totalPages);
//       expect(component.currentPage).toBe(1);
//       expect(productServiceMock.getProductsWithMediaByUserId).toHaveBeenCalledWith(mockUser.id, 1, 10);
//     });
//
//     it('should handle previous page', () => {
//       component.currentPage = 1;
//       productServiceMock.getProductsWithMediaByUserId.and.returnValue(of(mockResponse));
//       component.onPreviousPage(1);
//       expect(component.currentPage).toBe(0);
//       expect(productServiceMock.getProductsWithMediaByUserId).toHaveBeenCalledWith(mockUser.id, 0, 10);
//     });
//
//     it('should check if first page', () => {
//       expect(component.isFirstPage(0)).toBeTrue();
//       expect(component.isFirstPage(1)).toBeFalse();
//     });
//
//     it('should check if last page', () => {
//       expect(component.isLastPage(0, 1)).toBeTrue();
//       expect(component.isLastPage(0, 2)).toBeFalse();
//     });
//
//     it('should reset pagination', () => {
//       component.currentPage = 2;
//       component.pageSize = 20;
//       productServiceMock.getProductsWithMediaByUserId.and.returnValue(of(mockResponse));
//       component.reset();
//       expect(component.currentPage).toBe(0);
//       expect(component.pageSize).toBe(10);
//       expect(productServiceMock.getProductsWithMediaByUserId).toHaveBeenCalledWith(mockUser.id, 0, 10);
//     });
//
//     it('should handle page change event', () => {
//       const event = { page: 2, rows: 20 };
//       productServiceMock.getProductsWithMediaByUserId.and.returnValue(of(mockResponse));
//       component.onPageChange(event);
//       expect(component.currentPage).toBe(2);
//       expect(component.pageSize).toBe(20);
//       expect(productServiceMock.getProductsWithMediaByUserId).toHaveBeenCalledWith(mockUser.id, 2, 20);
//     });
//   });
//
//   describe('Product Actions', () => {
//     it('should handle product action and reload products', () => {
//       const event: ToastMessage = { severity: 'success', summary: 'Success', detail: 'Product updated', status: "OK" };
//       productServiceMock.getProductsWithMediaByUserId.and.returnValue(of(mockResponse));
//       component.onActionProduct(event);
//       expect(messageServiceMock.add).toHaveBeenCalledWith(event);
//       expect(productServiceMock.getProductsWithMediaByUserId).toHaveBeenCalled();
//     });
//   });
// });
