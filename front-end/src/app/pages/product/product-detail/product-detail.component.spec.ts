// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ProductDetailComponent } from './product-detail.component';
// import { RouterTestingModule } from '@angular/router/testing';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
// import { of } from 'rxjs';
// import { MessageService } from 'primeng/api';
// import { ProductService } from '../../../services/product/product.service';
// // import { CartService } from '../../../services/cart/cart.service';
// import { Router } from '@angular/router';
// import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
// import { ApiResponse, Product, ProductMedia } from '../../../types';
// import { ButtonModule } from 'primeng/button';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { ToastModule } from 'primeng/toast';
// import { AlertComponent } from '../../../components/alert/alert.component';
//
// describe('ProductDetailComponent', () => {
//   let component: ProductDetailComponent;
//   let fixture: ComponentFixture<ProductDetailComponent>;
//   let productServiceMock: jasmine.SpyObj<ProductService>;
//   // let cartServiceMock: jasmine.SpyObj<CartService>;
//   let messageServiceMock: jasmine.SpyObj<MessageService>;
//   let routerMock: jasmine.SpyObj<Router>;
//
//   const mockProduct: Product = {
//     id: '1',
//     name: 'Test Product',
//     description: 'Test Description',
//     price: 99.99,
//     quantity: 10,
//     userID: '123'
//   };
//
//   const mockProductMedia: ProductMedia = {
//     product: mockProduct,
//     media: []
//   };
//
//   const mockResponse: ApiResponse<ProductMedia> = {
//     message: 'Product retrieved successfully',
//     data: mockProductMedia,
//     status: 200
//   };
//
//   beforeEach(async () => {
//     // Create spies for services
//     productServiceMock = jasmine.createSpyObj('ProductService', ['getProductWithMediaById']);
//     // cartServiceMock = jasmine.createSpyObj('CartService', ['addToCart', 'removeFromCart', 'isInCart']);
//     messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
//     routerMock = jasmine.createSpyObj('Router', ['navigate']);
//
//     await TestBed.configureTestingModule({
//       imports: [
//         ProductDetailComponent,
//         RouterTestingModule,
//         HttpClientTestingModule,
//         ButtonModule,
//         InputNumberModule,
//         ToastModule,
//         AlertComponent
//       ],
//       providers: [
//         { provide: ProductService, useValue: productServiceMock },
//         // { provide: CartService, useValue: cartServiceMock },
//         { provide: MessageService, useValue: messageServiceMock },
//         { provide: Router, useValue: routerMock },
//         { provide: JWT_OPTIONS, useValue: {} },
//         JwtHelperService,
//         {
//           provide: ActivatedRoute,
//           useValue: {
//             paramMap: of(convertToParamMap({ id: '123' }))
//           }
//         }
//       ]
//     })
//     .compileComponents();
//
//     fixture = TestBed.createComponent(ProductDetailComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
