// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ProductComponent } from './product.component';
// import { CartService } from '../../services/utils/cart.service';
// import { MediaService } from '../../services/media/media.service';
// import { ProductMedia } from '../../types';
// import { RouterTestingModule } from '@angular/router/testing';
// import { ButtonModule } from 'primeng/button';
// import { CardModule } from 'primeng/card';
// import { TooltipModule } from 'primeng/tooltip';
// import { TextPreviewComponent } from '../text-preview/text-preview.component';
//
// describe('ProductComponent', () => {
//   let component: ProductComponent;
//   let fixture: ComponentFixture<ProductComponent>;
//   let cartServiceMock: jasmine.SpyObj<CartService>;
//   let mediaServiceMock: jasmine.SpyObj<MediaService>;
//
//   const mockProductMedia: ProductMedia = {
//     product: {
//       id: '123',
//       name: 'Test Product',
//       description: 'Test Description',
//       price: 99.99,
//       quantity: 10,
//       userID: 'user123'
//     },
//     media: [
//       {
//         id: '1',
//         imagePath: 'test-image.jpg',
//         productId: '123'
//       }
//     ]
//   };
//
//   beforeEach(async () => {
//     // Create spies for services
//     cartServiceMock = jasmine.createSpyObj('CartService', ['isInCart', 'addToCart', 'removeFromCart']);
//     mediaServiceMock = jasmine.createSpyObj('MediaService', ['getMedia']);
//
//     await TestBed.configureTestingModule({
//       imports: [
//         ProductComponent,
//         RouterTestingModule,
//         ButtonModule,
//         CardModule,
//         TooltipModule,
//         TextPreviewComponent
//       ],
//       providers: [
//         { provide: CartService, useValue: cartServiceMock },
//         { provide: MediaService, useValue: mediaServiceMock }
//       ]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(ProductComponent);
//     component = fixture.componentInstance;
//     component.product = mockProductMedia;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe('ngOnInit', () => {
//     it('should check if product is in cart on initialization', () => {
//       cartServiceMock.isInCart.and.returnValue(true);
//       component.ngOnInit();
//       expect(cartServiceMock.isInCart).toHaveBeenCalledWith(mockProductMedia.product.id);
//       expect(component.isInCart).toBeTrue();
//     });
//
//     it('should set isInCart to false when product is not in cart', () => {
//       cartServiceMock.isInCart.and.returnValue(false);
//       component.ngOnInit();
//       expect(component.isInCart).toBeFalse();
//     });
//   });
//
//   describe('getMedia', () => {
//     it('should call mediaService.getMedia with correct parameters', () => {
//       const productId = '123';
//       const imagePath = 'test-image.jpg';
//       const expectedUrl = 'http://example.com/image.jpg';
//       mediaServiceMock.getMedia.and.returnValue(expectedUrl);
//
//       const result = component.getMedia(productId, imagePath);
//
//       expect(mediaServiceMock.getMedia).toHaveBeenCalledWith(productId, imagePath);
//       expect(result).toBe(expectedUrl);
//     });
//
//     it('should return null when mediaService.getMedia returns null', () => {
//       mediaServiceMock.getMedia.and.returnValue(null);
//       const result = component.getMedia('123', 'test-image.jpg');
//       expect(result).toBeNull();
//     });
//   });
//
//   describe('toggleCart', () => {
//     it('should remove product from cart when it is already in cart', () => {
//       component.isInCart = true;
//       component.toggleCart();
//       expect(cartServiceMock.removeFromCart).toHaveBeenCalledWith(mockProductMedia.product.id);
//       expect(cartServiceMock.addToCart).not.toHaveBeenCalled();
//     });
//
//     it('should add product to cart when it is not in cart', () => {
//       component.isInCart = false;
//       component.toggleCart();
//       expect(cartServiceMock.addToCart).toHaveBeenCalledWith(mockProductMedia.product);
//       expect(cartServiceMock.removeFromCart).not.toHaveBeenCalled();
//     });
//
//     it('should update isInCart state after toggling', () => {
//       // Test adding to cart
//       component.isInCart = false;
//       cartServiceMock.isInCart.and.returnValue(true);
//       component.toggleCart();
//       expect(component.isInCart).toBeTrue();
//
//       // Test removing from cart
//       component.isInCart = true;
//       cartServiceMock.isInCart.and.returnValue(false);
//       component.toggleCart();
//       expect(component.isInCart).toBeFalse();
//     });
//   });
// });