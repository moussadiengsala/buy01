import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Product, ToastMessage} from "../../types";
import {ProductService} from "../../services/product/product.service";
import {AlertService} from "../../services/alert/alert.service";
import {AlertComponent} from "../alert/alert.component";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";


@Component({
    selector: 'app-edit-product',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AlertComponent, ToastModule],
    templateUrl: './edit-product.component.html',
})
export class EditProductComponent {
  @Input({required: true}) product!: Product;
  @Output() productEdited = new EventEmitter<ToastMessage>()

  isEditProductVisible: boolean = false
  editProductForm: FormGroup;
  loading: boolean = false;

  constructor(
      private fb: FormBuilder,
      private productService: ProductService,
      private alertService: AlertService,
      private messageService: MessageService
  ) {
    this.editProductForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255), Validators.pattern(/^[A-Za-zÀ-ÿ\s'-]+$/)]],
      price: ['', [ Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/) ]],
      quantity: ['', [ Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/) ]],
    });
    this.alertService.clear()
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
    this.editProductForm.markAllAsTouched();

    // if (this.editProductForm.invalid) {
    //   this.messageService.add({severity: "warn", summary: "Invalid fields", detail: 'Make sure to fill all required fields correctly!'})
    //   return;
    // }

    const updatedProduct: Product = {
      id: "",
      name: this.editProductForm.value.name,
      description: this.editProductForm.value.description,
      price: this.editProductForm.value.price,
      quantity: this.editProductForm.value.quantity,
      userID: ""
    };

    if (this.isValuesChanges(updatedProduct, this.product)) {
      this.messageService.add({severity: "warn", summary: "Invalid", detail: 'Make sure to change some fields before submitting!'})
      return;
    }

    this.loading = true;
    this.productService.updateProduct(this.product.id, updatedProduct).subscribe({
      next: (response) => {
        this.loading = false;
        this.editProductForm.reset();
        this.productEdited.emit({severity: "success", summary: "Success", detail: response.message || 'Product is updated successful!', status: "OK"})
        this.toggle()
      },
      error: (error) => {
        this.loading = false;
        this.alertService.error(
            error?.error?.message || 'Error',
            error?.error?.data || 'Failed to update product'
        )
      }
    });
  }

  isValuesChanges(product1: Product, product2: Product) {
    return product1.name == product2.name &&
        product1.description == product2.description &&
        product1.price == product2.price &&
        product1.quantity == product2.quantity;
  }

  toggle() {this.isEditProductVisible = !this.isEditProductVisible}

  get nameControl() {return this.editProductForm.controls['name'];}
  get descriptionControl() {return this.editProductForm.controls['description'];}
  get priceControl() {return this.editProductForm.controls['price'];}
  get quantityControl() {return this.editProductForm.controls['quantity'];}
}
