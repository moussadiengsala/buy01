import {Component, Input, SimpleChanges} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Product} from "../../types";
import {AuthService} from "../../services/auth/auth-service.service";
import {ProductService} from "../../services/product/product.service";
import {AlertService} from "../../services/alert/alert.service";
import {AlertComponent} from "../alert/alert.component";


@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent {
  @Input({required: true}) product!: Product;

  isEditProductVisible: boolean = false
  editProductForm: FormGroup;
  loading: boolean = false;

  constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private productService: ProductService,
      private alertService: AlertService
  ) {
    this.editProductForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
      price: ['', [ Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/) ]],
      quantity: ['', [ Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/) ]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.editProductForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        quantity: this.product.quantity,
      });
    }
  }

  onSubmit(): void {
    // Mark all fields as touched to trigger validation display
    this.editProductForm.markAllAsTouched();

    if (this.editProductForm.invalid) {
      this.alertService.error('Error', 'Make sure to fill all required fields correctly!')
      return;
    }

    const updatedProduct: Product = {
      id: "",
      name: this.editProductForm.value.name,
      description: this.editProductForm.value.description,
      price: this.editProductForm.value.price,
      quantity: this.editProductForm.value.quantity
    };
    this.loading = true;

    this.productService.updateProduct(this.product.id, updatedProduct).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.success('Success', 'Product updated successful!')
        this.editProductForm.reset();
        console.log(response)
      },
      error: (error) => {
        const errorDetails = Object.entries(error.error.data || {})
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        this.loading = false;
        this.alertService.error(
            error?.error?.message || 'Error',
            `${errorDetails || 'Failed to updated product'}`
        )
      }
    });
  }

  toggle() {this.isEditProductVisible = !this.isEditProductVisible}

  get nameControl() {return this.editProductForm.controls['name'];}
  get descriptionControl() {return this.editProductForm.controls['description'];}
  get priceControl() {return this.editProductForm.controls['price'];}
  get quantityControl() {return this.editProductForm.controls['quantity'];}

}
