import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
  addProductForm: FormGroup;
  isAddProductVisible: boolean = false;
  messageAction: {
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string
} | null = null;


  constructor(private fb: FormBuilder, private authService: AuthService) {
      this.addProductForm = this.fb.group({
        name: ['', [Validators.required]],
        description: ['', [Validators.required]],
        price: ['', [Validators.required, Validators.min(0)]],
        quantity: ['', [Validators.required, Validators.min(1)]],
      });
    }

    get name() {
      return this.addProductForm.controls['name'];
    }

    get description() {
      return this.addProductForm.controls['description'];
    }

    get price() {
      return this.addProductForm.controls['price'];
    }

    get quantity() {
      return this.addProductForm.controls['quantity'];
    }

    addProduct() {
      this.isAddProductVisible = true;
    }
    
    closeAddPopup() {
      this.isAddProductVisible = false;
    }
    
    saveNewProduct() {
      if (this.addProductForm.valid) {
        const newProduct = this.addProductForm.value;
        console.log('New Product:', newProduct);
        this.closeAddPopup();
        this.messageAction = {
          severity: 'success',
          summary: 'Success',
          detail: 'Product added successfully'
        };
      } else {
        console.log('Form is not valid');
        this.messageAction = {
          severity: 'error',
          summary: 'Error',
          detail: 'Please fill out all required fields'
        };
      }
    }

}
