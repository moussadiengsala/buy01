import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import {ProductService} from "../../services/product/product.service";
import {Product} from "../../types";

@Component({
    selector: 'app-product-management',
    imports: [CommonModule, MenuModule, ButtonModule],
    standalone: true,
    templateUrl: './product-management.component.html'
})
export class ProductManagementComponent {
  @Input({required: true}) product!: Product;
  items: MenuItem[] = [];

  constructor(private productService: ProductService) { }
    
  ngOnInit() {
      this.items = [
          {
              label: 'Options',
              items: [
                  {
                      label: 'Edit',
                      icon: 'pi pi-refresh'
                  },
                  {
                      label: 'Remove',
                      icon: 'pi pi-upload'
                  }
              ]
          }
      ];

      console.log(this.items)
  }

}
