import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ApiResponse, PaginatedResponse, Product, ProductMedia} from "../../types";
import {forkJoin, Observable, switchMap} from "rxjs";
import {TokenService} from "../token/token.service";
import {MediaService} from "../media/media.service";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = 'https://localhost:8082/api/v1/products';

  constructor(private http: HttpClient, private tokenService: TokenService, private mediaService: MediaService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token?.accessToken}`,
      'Content-Type': 'application/json'
    });
  }

  // Get all products with pagination
  getAllProducts(page: number = 0, size: number = 10): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(
        `${this.baseUrl}/?page=${page}&size=${size}`,
        { headers: { 'Content-Type': 'application/json' }}
    );
  }

  // Get product by ID
  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(
        `${this.baseUrl}/${id}`,
        { headers: { 'Content-Type': 'application/json' }}
    );
  }

  // Get products by user ID with pagination
  getProductsByUserId(userId: string, page: number = 0, size: number = 10): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(
        `${this.baseUrl}/users/${userId}?page=${page}&size=${size}`,
        { headers: { 'Content-Type': 'application/json' }}
    );
  }


  getProductsWithMediaByUserId(userId: string, page: number = 0, size: number = 10): Observable<ApiResponse<PaginatedResponse<ProductMedia>>> {
    return this.getProductsByUserId(userId, page, size).pipe(
        switchMap(productsResponse => {
          const products = productsResponse.data.content;
          const mediaRequests = products.map(product =>
              this.mediaService.getMediaByProductId(product.id).pipe(
                  map(mediaResponse => ({
                    product,
                    media: mediaResponse.data
                  }))
              )
          );

          return forkJoin(mediaRequests).pipe(
              map(productMediaArray => ({
                status: productsResponse.status,
                message: productsResponse.message,
                data: {
                  content: productMediaArray,
                  page: productsResponse.data.page
                }
              }))
          );
        })
    );
  }


// Create a new product
  createProduct(product: Product): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.baseUrl}/`, product, { headers: this.getAuthHeaders() });
  }

  // Update an existing product
  updateProduct(id: string, updates: Product): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/${id}`, updates, { headers: this.getAuthHeaders() });
  }

  // Delete a product
  deleteProduct(id: string): Observable<ApiResponse<Product>> {
    return this.http.delete<ApiResponse<Product>>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
