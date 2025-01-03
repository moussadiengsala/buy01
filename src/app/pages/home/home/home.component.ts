import { Component } from '@angular/core';
import { Product } from '../../../types';
import { CommonModule } from '@angular/common';
import {ProductComponent} from "../../../components/product/product.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  products: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      description: 'This is a great product.',
      price: 99.99,
      quantity: 10,
      // media: [
      //   { id: '1', imagePath: 'https://framerusercontent.com/images/H2lD1wbQgNQJOFWzv6bKAY6ng.png', productId: '1' }
      // ]
    },
    {
      id: '2',
      name: 'Product 2',
      description: 'This is another awesome product.',
      price: 149.99,
      quantity: 5,
      // media: [
      //   { id: '2', imagePath: 'https://framerusercontent.com/images/H2lD1wbQgNQJOFWzv6bKAY6ng.png', productId: '2' }
      // ]
    }
  ];

  // trackByProductId(index: number, product: Product): string {
  //   return product.id;
  // }
}
