import { Component, Input } from '@angular/core';
import { ProductService } from '../../../core/services/api/product.service';
import { Product } from '../../../types';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
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
