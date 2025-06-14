// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { DeleteProductComponent } from './delete-product.component';
// import { ProductService } from '../../services/product/product.service';
// import { of, throwError } from 'rxjs';
// import {ApiResponse, Product, ProductMedia, ToastMessage} from '../../types';
//
// describe('DeleteProductComponent', () => {
//   let component: DeleteProductComponent;
//   let fixture: ComponentFixture<DeleteProductComponent>;
//   let productServiceMock: jasmine.SpyObj<ProductService>;
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
//     media: []
//   };
//
//   const mockResponse: ApiResponse<Product> = {
//     message: 'Product deleted successfully',
//     data: mockProductMedia.product,
//     status: 200
//   };
//
//   beforeEach(async () => {
//     // Create spy for ProductService
//     productServiceMock = jasmine.createSpyObj('ProductService', ['deleteProduct']);
//
//     await TestBed.configureTestingModule({
//       imports: [DeleteProductComponent],
//       providers: [
//         { provide: ProductService, useValue: productServiceMock }
//       ]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(DeleteProductComponent);
//     component = fixture.componentInstance;
//     component.productMedia = mockProductMedia;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe('deleteProduct', () => {
//     it('should not delete if already loading', () => {
//       component.isLoading = true;
//       component.deleteProduct();
//       expect(productServiceMock.deleteProduct).not.toHaveBeenCalled();
//     });
//
//     it('should delete product and emit success message on successful deletion', () => {
//       productServiceMock.deleteProduct.and.returnValue(of(mockResponse));
//       spyOn(component.productDeleted, 'emit');
//
//       component.deleteProduct();
//
//       expect(productServiceMock.deleteProduct).toHaveBeenCalledWith(mockProductMedia.product.id);
//       expect(component.productDeleted.emit).toHaveBeenCalledWith({
//         severity: 'success',
//         summary: 'Product Deleted',
//         detail: mockResponse.message,
//         status: 'OK'
//       });
//       expect(component.isVisible).toBeFalse();
//     });
//
//     it('should handle error on product deletion', () => {
//       const errorResponse = {
//         error: {
//           message: 'Error message'
//         }
//       };
//       productServiceMock.deleteProduct.and.returnValue(throwError(() => errorResponse));
//       spyOn(component.productDeleted, 'emit');
//
//       component.deleteProduct();
//
//       expect(component.deleteError).toBe(errorResponse.error.message);
//       expect(component.productDeleted.emit).toHaveBeenCalledWith({
//         severity: 'error',
//         summary: 'Error Deleting Product',
//         detail: errorResponse.error.message,
//         status: 'FAILED'
//       });
//     });
//
//     it('should set loading state correctly during deletion', () => {
//       productServiceMock.deleteProduct.and.returnValue(of(mockResponse));
//
//       expect(component.isLoading).toBeFalse();
//       component.deleteProduct();
//       expect(component.isLoading).toBeTrue();
//
//       // Wait for the async operation to complete
//       fixture.detectChanges();
//       expect(component.isLoading).toBeFalse();
//     });
//   });
//
//   describe('toggle', () => {
//     it('should not toggle if loading', () => {
//       component.isLoading = true;
//       component.isVisible = false;
//       component.toggle();
//       expect(component.isVisible).toBeFalse();
//     });
//
//     it('should toggle visibility and clear error', () => {
//       component.deleteError = 'Some error';
//       component.isVisible = false;
//       component.toggle();
//       expect(component.isVisible).toBeTrue();
//       expect(component.deleteError).toBe('');
//     });
//   });
// });