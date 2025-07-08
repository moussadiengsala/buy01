import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import {ApiResponse, TokenPayload, Tokens, User, UserPayload} from "../../types";
import {HttpClient, HttpHeaders, HttpStatusCode} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {environment} from "../../environment";

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private API_URL = environment.apiUrl + "user";
  private readonly STORAGE_NAME: string = "BUY_01"

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private jwtHelper: JwtHelperService ) {}

  set token(token: Tokens) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_NAME, JSON.stringify(token));
    }
  }

  get token(): Tokens | null {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem(this.STORAGE_NAME);
      return storedToken ? JSON.parse(storedToken) : null;
    }
    return null;
  }

  remove() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_NAME);
    }
  }

  isTokenValid(): Observable<UserPayload | null> {
    const tokenPayload: TokenPayload | null = this.parse();
    if (!tokenPayload || !tokenPayload.user) return of(null);

    console.log("kkkkkkkkkk", tokenPayload.user)
    return this.http
        .get<ApiResponse<User>>(`${this.API_URL}/${tokenPayload.user.id}`, {
          headers: {
            'Authorization': `Bearer ${this.token?.accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        .pipe(
            map(response => {
              const isAuthenticated = response.status === HttpStatusCode.Ok;
              if (!isAuthenticated) return null;
              return { ...tokenPayload.user, isAuthenticated };
            }),
            catchError( (e) => {
              return of(e);
            })
        );
  }

  parse(): TokenPayload | null {
    const token = this.token?.accessToken;
    if (token) return this.jwtHelper.decodeToken(token);
    return null;
  }
}
