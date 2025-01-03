
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Nullable } from 'primeng/ts-helpers';
import { TokenService } from '../token/token.service';
import { Router } from '@angular/router';
import {ApiResponse, Tokens, UserLoginRequest, UserPayload} from "../../types";
import {Token} from "@angular/compiler";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
    private API_URL = "https://localhost:8082/api/v1/users"
    private user = new BehaviorSubject<UserPayload>({ id: '', name: '', email: '', avatar: null, role: null, isAuthenticated: false});
    public userState$: Observable<UserPayload> = this.user.asObservable();


    constructor(
        private http: HttpClient,
        private tokenService: TokenService,
        private router: Router
    ) {
        this.initializeUserState();
    }

    private initializeUserState(): void {
      if (this.isAuthenticated()) {
        const user = this.tokenService.parse(); // Assuming this method parses the JWT and extracts user info
        this.user.next({ ...user, isAuthenticated: true });
      }
    }

    register(user: FormData): Observable<ApiResponse<Tokens> | null> {
        return this.http
            .post<ApiResponse<Tokens>>(`${this.API_URL}/auth/register`, user, {
                // Optionally track upload progress
                reportProgress: true,
                observe: 'response'
            })
            .pipe(
                map(response => {
                    const body = response.body;
                    if (body?.data) {
                        this.tokenService.token = body.data; // Store tokens
                        const userPayload = this.tokenService.parse(); // Extract user data from token
                        this.user.next({ ...userPayload, isAuthenticated: true }); // Update user state
                    }
                    return body;
                })
            );
    }

  login(userLoginRequest: UserLoginRequest): Observable<ApiResponse<Tokens> | null> {
    return this.http
      .post<ApiResponse<Tokens>>(`${this.API_URL}/auth/login`, userLoginRequest, {
          reportProgress: true,
          observe: 'response'
      })
      .pipe(
        map(response => {
            const body = response.body;
            if (body?.data) {
                this.tokenService.token = body.data; // Store tokens
                const userPayload = this.tokenService.parse(); // Extract user data from token
                this.user.next({ ...userPayload, isAuthenticated: true }); // Update user state
            }
            return body;
        })
      );
  }

  // A method to log the user out and remove token
  logout(): void {
    this.tokenService.remove();
    // this.user.next({ email: '', name: '', avatar: '', role: null, isAuthenticated: false });
    this.router.navigate(['/auth/sign-in']);
  }

  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }

  isSeller(): boolean {
    console.log('isSeller', this.tokenService.parse());
    return this.tokenService.parse()?.role === 'SELLER';
  }

}
