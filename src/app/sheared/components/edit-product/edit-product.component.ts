import { Component, Input } from '@angular/core';
import { Product } from '../../../types';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth-service.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent {
  @Input({required: true}) product!: Product;

  isEditProductVisible: boolean = false
  editProductForm: FormGroup;
  
  messageAction: {
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string
  } | null = null;


  constructor(private fb: FormBuilder, private authService: AuthService) {
      this.editProductForm = this.fb.group({
        name: ['', [Validators.required]],
        description: ['', [Validators.required]],
        price: ['', [Validators.required, Validators.min(0)]],
        quantity: ['', [Validators.required, Validators.min(1)]],
      });
  }

  get name() {
    return this.editProductForm.controls['name'];
  }

  get description() {
    return this.editProductForm.controls['description'];
  }

  get price() {
    return this.editProductForm.controls['price'];
  }

  get quantity() {
    return this.editProductForm.controls['quantity'];
  }

  editProduct() {
    this.isEditProductVisible = true;
  }
  
  closeAddPopup() {
    this.isEditProductVisible = false;
  }

  saveProduct() {
    if (this.editProductForm.invalid) {
      this.editProductForm.markAllAsTouched(); // Ensure all fields are validated on submit
      return;
    }

    // Logic to save the product, possibly making an API call
    // Mocking success action:
    this.messageAction = {
      severity: 'success',
      summary: 'Product Updated',
      detail: 'The product details have been successfully updated!'
    };

    // Close the popup after a brief delay
    setTimeout(() => {
      this.isEditProductVisible = false;
      this.messageAction = null;
    }, 2000);
  }
}
