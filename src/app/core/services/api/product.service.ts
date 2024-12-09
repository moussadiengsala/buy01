import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';  // URL to Product Microservice

  constructor(private http: HttpClient) { }

  getSellerProducts() {
    return this.http.get(`${this.apiUrl}/seller`);
  }

  deleteProduct(productId: string) {
    return this.http.delete(`${this.apiUrl}/${productId}`);
  }
}
