// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { EditProductComponent } from './edit-product.component';
// import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// import { ProductService } from '../../services/product/product.service';
// import { AlertService } from '../../services/alert/alert.service';
// import { MessageService } from 'primeng/api';
// import { of, throwError } from 'rxjs';
// import { ToastModule } from 'primeng/toast';
// import { AlertComponent } from '../alert/alert.component';
// import {ApiResponse, Product, ToastMessage} from '../../types';
//
// describe('EditProductComponent', () => {
//   let component: EditProductComponent;
//   let fixture: ComponentFixture<EditProductComponent>;
//   let productServiceMock: jasmine.SpyObj<ProductService>;
//   let alertServiceMock: jasmine.SpyObj<AlertService>;
//   let messageServiceMock: jasmine.SpyObj<MessageService>;
//
//   const mockProduct: Product = {
//     id: '123',
//     name: 'Test Product',
//     description: 'This is a test product description',
//     price: 99.99,
//     quantity: 10,
//     userID: 'user123'
//   };
//
//   const mockResponse: ApiResponse<Product> = {
//     message: 'Product updated successfully',
//     data: mockProduct,
//     status: 200
//   };
//
//   beforeEach(async () => {
//     // Create spies for services
//     productServiceMock = jasmine.createSpyObj('ProductService', ['updateProduct']);
//     alertServiceMock = jasmine.createSpyObj('AlertService', ['error', 'clear']);
//     messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
//
//     await TestBed.configureTestingModule({
//       imports: [
//         ReactiveFormsModule,
//         ToastModule,
//         AlertComponent
//       ],
//       declarations: [EditProductComponent],
//       providers: [
//         FormBuilder,
//         { provide: ProductService, useValue: productServiceMock },
//         { provide: AlertService, useValue: alertServiceMock },
//         { provide: MessageService, useValue: messageServiceMock }
//       ]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(EditProductComponent);
//     component = fixture.componentInstance;
//     component.product = mockProduct;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe('Form Initialization', () => {
//     it('should initialize form with product values', () => {
//       expect(component.editProductForm.get('name')?.value).toBe(mockProduct.name);
//       expect(component.editProductForm.get('description')?.value).toBe(mockProduct.description);
//       expect(component.editProductForm.get('price')?.value).toBe(mockProduct.price);
//       expect(component.editProductForm.get('quantity')?.value).toBe(mockProduct.quantity);
//     });
//
//     it('should have required validators', () => {
//       const nameControl = component.editProductForm.get('name');
//       const descriptionControl = component.editProductForm.get('description');
//       const priceControl = component.editProductForm.get('price');
//       const quantityControl = component.editProductForm.get('quantity');
//
//       nameControl?.setValue('');
//       descriptionControl?.setValue('');
//       priceControl?.setValue('');
//       quantityControl?.setValue('');
//
//       expect(nameControl?.valid).toBeFalsy();
//       expect(descriptionControl?.valid).toBeFalsy();
//       expect(priceControl?.valid).toBeFalsy();
//       expect(quantityControl?.valid).toBeFalsy();
//     });
//   });
//
//   describe('Form Validation', () => {
//     it('should validate name pattern', () => {
//       const nameControl = component.editProductForm.get('name');
//       nameControl?.setValue('Invalid@Name');
//       expect(nameControl?.valid).toBeFalsy();
//       expect(nameControl?.errors?.['pattern']).toBeTruthy();
//     });
//
//     it('should validate description pattern', () => {
//       const descriptionControl = component.editProductForm.get('description');
//       descriptionControl?.setValue('Invalid@Description');
//       expect(descriptionControl?.valid).toBeFalsy();
//       expect(descriptionControl?.errors?.['pattern']).toBeTruthy();
//     });
//
//     it('should validate price format', () => {
//       const priceControl = component.editProductForm.get('price');
//       priceControl?.setValue('invalid');
//       expect(priceControl?.valid).toBeFalsy();
//       expect(priceControl?.errors?.['pattern']).toBeTruthy();
//     });
//
//     it('should validate quantity format', () => {
//       const quantityControl = component.editProductForm.get('quantity');
//       quantityControl?.setValue('0');
//       expect(quantityControl?.valid).toBeFalsy();
//       expect(quantityControl?.errors?.['pattern']).toBeTruthy();
//     });
//   });
//
//   describe('onSubmit', () => {
//     it('should not submit if form is invalid', () => {
//       component.editProductForm.get('name')?.setValue('');
//       component.onSubmit();
//
//       expect(productServiceMock.updateProduct).not.toHaveBeenCalled();
//       expect(messageServiceMock.add).toHaveBeenCalledWith({
//         severity: 'warn',
//         summary: 'Invalid Form',
//         detail: 'Please correct the errors in the form before submitting.'
//       });
//     });
//
//     it('should not submit if values are unchanged', () => {
//       component.onSubmit();
//
//       expect(productServiceMock.updateProduct).not.toHaveBeenCalled();
//       expect(messageServiceMock.add).toHaveBeenCalledWith({
//         severity: 'warn',
//         summary: 'No Changes',
//         detail: 'Please modify at least one field before saving.'
//       });
//     });
//
//     it('should submit form and emit success message on successful update', () => {
//       productServiceMock.updateProduct.and.returnValue(of(mockResponse));
//       spyOn(component.productEdited, 'emit');
//
//       const updatedProduct = { ...mockProduct, name: 'Updated Name' };
//       component.editProductForm.patchValue({ name: 'Updated Name' });
//       component.onSubmit();
//
//       expect(productServiceMock.updateProduct).toHaveBeenCalledWith(mockProduct.id, updatedProduct);
//       expect(component.productEdited.emit).toHaveBeenCalledWith({
//         severity: 'success',
//         summary: 'Product Updated',
//         detail: mockResponse.message,
//         status: 'OK'
//       });
//     });
//
//     it('should handle error on product update', () => {
//       const errorResponse = {
//         error: {
//           message: 'Error message',
//           data: 'Error details'
//         }
//       };
//       productServiceMock.updateProduct.and.returnValue(throwError(() => errorResponse));
//
//       component.editProductForm.patchValue({ name: 'Updated Name' });
//       component.onSubmit();
//
//       expect(alertServiceMock.error).toHaveBeenCalledWith(
//         errorResponse.error.message,
//         errorResponse.error.data
//       );
//     });
//   });
//
//   describe('toggle', () => {
//     it('should toggle visibility and reset form with product data', () => {
//       component.isEditProductVisible = false;
//       component.editProductForm.patchValue({ name: 'Changed Name' });
//       component.formSubmitted = true;
//
//       component.toggle();
//
//       expect(component.isEditProductVisible).toBeTrue();
//       expect(component.editProductForm.get('name')?.value).toBe(mockProduct.name);
//       expect(component.formSubmitted).toBeFalse();
//       expect(alertServiceMock.clear).toHaveBeenCalled();
//     });
//   });
//
//   describe('Form Controls', () => {
//     it('should have getters for form controls', () => {
//       expect(component.nameControl).toBeTruthy();
//       expect(component.descriptionControl).toBeTruthy();
//       expect(component.priceControl).toBeTruthy();
//       expect(component.quantityControl).toBeTruthy();
//     });
//   });
//
//   describe('isValuesUnchanged', () => {
//     it('should return true when values are unchanged', () => {
//       const unchangedProduct = { ...mockProduct };
//       expect(component.isValuesUnchanged(unchangedProduct)).toBeTrue();
//     });
//
//     it('should return false when values are changed', () => {
//       const changedProduct = { ...mockProduct, name: 'New Name' };
//       expect(component.isValuesUnchanged(changedProduct)).toBeFalse();
//     });
//   });
// });