import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {AuthService} from "../../services/auth/auth-service.service";
import {ProductService} from "../../services/product/product.service";
import {Product, Role} from "../../types";
import {AlertService} from "../../services/alert/alert.service";
import {AlertComponent} from "../alert/alert.component";

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
  addProductForm: FormGroup;
  isAddProductVisible: boolean = false;
  loading: boolean = false;

  constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private productService: ProductService,
      private alertService: AlertService
  ) {
      this.addProductForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
        description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
        price: ['', [ Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/) ]],
        quantity: ['', [ Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/) ]],
      });
  }

  onSubmit(): void {
    // Mark all fields as touched to trigger validation display
    this.addProductForm.markAllAsTouched();

    if (this.addProductForm.invalid) {
      this.alertService.error('Error', 'Make sure to fill all required fields correctly!')
      return;
    }

    const newProduct: Product = {
      id: "",
      name: this.addProductForm.value.name,
      description: this.addProductForm.value.description,
      price: this.addProductForm.value.price,
      quantity: this.addProductForm.value.quantity
    };
    this.loading = true;

    this.productService.createProduct(newProduct).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.success('Success', 'Product created successful!')
        this.addProductForm.reset();
        console.log(response)
      },
      error: (error) => {
        const errorDetails = Object.entries(error.error.data || {})
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        this.loading = false;
        this.alertService.error(
            error?.error?.message || 'Error',
            `${errorDetails || 'Failed to create product'}`
        )
      }
    });
  }

  toggle() {this.isAddProductVisible = !this.isAddProductVisible}

  get nameControl() {return this.addProductForm.controls['name'];}
  get descriptionControl() {return this.addProductForm.controls['description'];}
  get priceControl() {return this.addProductForm.controls['price'];}
  get quantityControl() {return this.addProductForm.controls['quantity'];}

}
