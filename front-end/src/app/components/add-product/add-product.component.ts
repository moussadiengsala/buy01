import {Component, EventEmitter, Output} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ProductService} from "../../services/product/product.service";
import {CreateProduct, ToastMessage} from "../../types";
import {AlertService} from "../../services/alert/alert.service";
import {AlertComponent} from "../alert/alert.component";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
    selector: 'app-add-product',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AlertComponent, ToastModule],
    templateUrl: './add-product.component.html',
})
export class AddProductComponent {
  addProductForm: FormGroup;
  isAddProductVisible: boolean = false;
  loading: boolean = false;
  formSubmitted: boolean = false;
  @Output() productAdded = new EventEmitter<ToastMessage>();

  constructor(
      private fb: FormBuilder,
      private productService: ProductService,
      private alertService: AlertService,
      private messageService: MessageService
  ) {
      this.addProductForm = this.fb.group({
        name: ['', [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-zÀ-ÿ0-9\s'-]+$/)
        ]],
        description: ['', [
          Validators.required, 
          Validators.minLength(10), 
          Validators.maxLength(255), 
          Validators.pattern(/^[A-Za-zÀ-ÿ0-9\s.,!?()'-]+$/)
        ]],
        price: ['', [ 
          Validators.required, 
          Validators.min(0.01), 
          Validators.pattern(/^\d+(\.\d{1,2})?$/) 
        ]],
        quantity: ['', [ 
          Validators.required, 
          Validators.min(1), 
          Validators.pattern(/^[1-9]\d*$/) 
        ]],
      });
      this.alertService.clear();
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.addProductForm.markAllAsTouched();
    
    if (this.addProductForm.invalid) {
      this.messageService.add({
        severity: "warn", 
        summary: "Invalid Form", 
        detail: 'Please correct the errors in the form before submitting.'
      });
      return;
    }

    const newProduct: CreateProduct = {
      name: this.addProductForm.value.name,
      description: this.addProductForm.value.description,
      price: this.addProductForm.value.price,
      quantity: this.addProductForm.value.quantity,
    };
    this.loading = true;

    this.productService.createProduct(newProduct).subscribe({
      next: (response) => {
        this.loading = false;
        this.formSubmitted = false;
        this.addProductForm.reset();
        this.productAdded.emit({
          severity: "success", 
          summary: "Product Added", 
          detail: response.message || 'Product successfully added to your inventory!', 
          status: "OK"
        });
        this.toggle();
      },
      error: (error) => {
        this.loading = false;
        this.alertService.error(
            error?.error?.message || 'Error',
            error?.error?.data || 'Failed to create product. Please try again.'
        );
      }
    });
  }

  toggle(): void {
    this.isAddProductVisible = !this.isAddProductVisible;
    
    if (!this.isAddProductVisible) {
      // Reset form when closing the modal
      this.formSubmitted = false;
      this.addProductForm.reset();
      this.alertService.clear();
    }
  }

  get nameControl() {return this.addProductForm.controls['name'];}
  get descriptionControl() {return this.addProductForm.controls['description'];}
  get priceControl() {return this.addProductForm.controls['price'];}
  get quantityControl() {return this.addProductForm.controls['quantity'];}
}
