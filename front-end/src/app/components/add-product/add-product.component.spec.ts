// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { AddProductComponent } from './add-product.component';
// import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// import { ProductService } from '../../services/product/product.service';
// import { AlertService } from '../../services/alert/alert.service';
// import { MessageService } from 'primeng/api';
// import { of, throwError } from 'rxjs';
// import { ToastModule } from 'primeng/toast';
// import { AlertComponent } from '../alert/alert.component';
// import { CreateProduct, Product, ApiResponse } from '../../types';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { FileUploadModule } from 'primeng/fileupload';
//
// describe('AddProductComponent', () => {
//   let component: AddProductComponent;
//   let fixture: ComponentFixture<AddProductComponent>;
//   let productServiceMock: jasmine.SpyObj<ProductService>;
//   let alertServiceMock: jasmine.SpyObj<AlertService>;
//   let messageServiceMock: jasmine.SpyObj<MessageService>;
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
//   const mockResponse: ApiResponse<Product> = {
//     message: 'Product created successfully',
//     data: mockProduct,
//     status: 201
//   };
//
//   beforeEach(async () => {
//     // Create spies for services
//     productServiceMock = jasmine.createSpyObj('ProductService', ['createProduct']);
//     alertServiceMock = jasmine.createSpyObj('AlertService', ['error', 'clear']);
//     messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
//
//     await TestBed.configureTestingModule({
//       imports: [
//         AddProductComponent,
//         ReactiveFormsModule,
//         ButtonModule,
//         InputTextModule,
//         InputNumberModule,
//         FileUploadModule,
//         ToastModule,
//         AlertComponent
//       ],
//       providers: [
//         FormBuilder,
//         { provide: ProductService, useValue: productServiceMock },
//         { provide: AlertService, useValue: alertServiceMock },
//         { provide: MessageService, useValue: messageServiceMock }
//       ]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(AddProductComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe('Form Initialization', () => {
//     it('should initialize with empty form', () => {
//       expect(component.addProductForm.get('name')?.value).toBe('');
//       expect(component.addProductForm.get('description')?.value).toBe('');
//       expect(component.addProductForm.get('price')?.value).toBe('');
//       expect(component.addProductForm.get('quantity')?.value).toBe('');
//     });
//
//     it('should have required validators', () => {
//       const nameControl = component.addProductForm.get('name');
//       const descriptionControl = component.addProductForm.get('description');
//       const priceControl = component.addProductForm.get('price');
//       const quantityControl = component.addProductForm.get('quantity');
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
//       const nameControl = component.addProductForm.get('name');
//       nameControl?.setValue('Invalid@Name');
//       expect(nameControl?.valid).toBeFalsy();
//       expect(nameControl?.errors?.['pattern']).toBeTruthy();
//     });
//
//     it('should validate description pattern', () => {
//       const descriptionControl = component.addProductForm.get('description');
//       descriptionControl?.setValue('Invalid@Description');
//       expect(descriptionControl?.valid).toBeFalsy();
//       expect(descriptionControl?.errors?.['pattern']).toBeTruthy();
//     });
//
//     it('should validate price format', () => {
//       const priceControl = component.addProductForm.get('price');
//       priceControl?.setValue('invalid');
//       expect(priceControl?.valid).toBeFalsy();
//       expect(priceControl?.errors?.['pattern']).toBeTruthy();
//     });
//
//     it('should validate quantity format', () => {
//       const quantityControl = component.addProductForm.get('quantity');
//       quantityControl?.setValue('0');
//       expect(quantityControl?.valid).toBeFalsy();
//       expect(quantityControl?.errors?.['pattern']).toBeTruthy();
//     });
//   });
//
//   describe('onSubmit', () => {
//     it('should not submit if form is invalid', () => {
//       component.onSubmit();
//       expect(productServiceMock.createProduct).not.toHaveBeenCalled();
//       expect(messageServiceMock.add).toHaveBeenCalledWith({
//         severity: 'warn',
//         summary: 'Invalid Form',
//         detail: 'Please correct the errors in the form before submitting.'
//       });
//     });
//
//     it('should submit form and emit success message on successful creation', () => {
//       productServiceMock.createProduct.and.returnValue(of(mockResponse));
//       spyOn(component.productAdded, 'emit');
//
//       component.addProductForm.patchValue(mockProduct);
//       component.onSubmit();
//
//       expect(productServiceMock.createProduct).toHaveBeenCalledWith(mockProduct);
//       expect(component.productAdded.emit).toHaveBeenCalledWith({
//         severity: 'success',
//         summary: 'Product Added',
//         detail: mockResponse.message,
//         status: 'OK'
//       });
//       expect(component.addProductForm.pristine).toBeTruthy();
//     });
//
//     it('should handle error on product creation', () => {
//       const errorResponse = {
//         error: {
//           message: 'Error message',
//           data: 'Error details'
//         }
//       };
//       productServiceMock.createProduct.and.returnValue(throwError(() => errorResponse));
//
//       component.addProductForm.patchValue(mockProduct);
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
//     it('should toggle visibility and reset form', () => {
//       component.isAddProductVisible = true;
//       component.addProductForm.patchValue(mockProduct);
//       component.formSubmitted = true;
//
//       component.toggle();
//
//       expect(component.isAddProductVisible).toBeFalse();
//       expect(component.addProductForm.pristine).toBeTruthy();
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
// });