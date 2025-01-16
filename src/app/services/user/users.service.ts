import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {TokenService} from "../token/token.service";
import {MediaService} from "../media/media.service";
import {Observable} from "rxjs";
import {ApiResponse, PaginatedResponse, Product, User} from "../../types";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly baseUrl = 'https://localhost:8082/api/v1/users';

  constructor(
      private http: HttpClient,
      private tokenService: TokenService,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token?.accessToken}`,
      'Content-Type': 'application/json'
    });
  }

  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(
        `${this.baseUrl}/${id}`,
        { headers: this.getAuthHeaders() }
    );
  }


}
