import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import {Tokens} from "../../types";

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private jwtHelper: JwtHelperService = new JwtHelperService();
  private readonly STORAGE_NAME: string = "BUY_01"

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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

  isTokenValid(): boolean {
    const token = this.token?.accessToken;
    if (!token) {
      return false;
    }

    // Check expiry date
    const isTokenExpired = this.jwtHelper.isTokenExpired(token);
    if (isTokenExpired) {
      this.remove();
      return false;
    }
    return true;
  }

  parse() {
    const token = this.token?.accessToken;
    if (token) return this.jwtHelper.decodeToken(token);
    return null;
  }
}
