
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Nullable } from 'primeng/ts-helpers';
import { TokenService } from '../token/token.service';
import { Router } from '@angular/router';
import {ResponseAPI, UserLoginRequest, UserPayload} from "../../../types";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
    private API_URL = "https://localhost:8082/api/v1/users"
    private user = new BehaviorSubject<UserPayload>({ id: '', name: '', email: '', avatar: null, role: null, isAuthenticated: false});
    public userState$: Observable<UserPayload> = this.user.asObservable();


    constructor(
        private http: HttpClient,
        private token: TokenService,
        private router: Router
    ) {
        this.initializeUserState();
    }

    private initializeUserState(): void {
      if (this.isAuthenticated()) {
        const user = this.token.parse(); // Assuming this method parses the JWT and extracts user info
        this.user.next({ ...user, isAuthenticated: true });
      }
    }

    register(user: FormData): Observable<ResponseAPI> {
        return this.http
            .post<ResponseAPI>(`${this.API_URL}/auth/register`, user, {
                // Optionally track upload progress
                reportProgress: true,
                observe: 'response'
            })
            .pipe(
                map(response => {
                    this.token.token = response.body?.data;
                    const user = this.token.parse();
                    this.user.next({ ...user, isAuthenticated: true });
                    return response.body?.data;
                })
            );
    }

  login(userLoginRequest: UserLoginRequest): Observable<{ token: string }> {
    return this.http
      .post<ResponseAPI>(`${this.API_URL}/auth/login`, userLoginRequest, {
          reportProgress: true,
          observe: 'response'
      })
      .pipe(
        map(response => {
          this.token.token = response.body?.data;
          const user = this.token.parse();
          this.user.next({ ...user, isAuthenticated: true });
          return response.body?.data;
        })
      );
  }

  // A method to log the user out and remove token
  logout(): void {
    this.token.remove();
    // this.user.next({ email: '', name: '', avatar: '', role: null, isAuthenticated: false });
    this.router.navigate(['/auth/sign-in']);
  }

  isAuthenticated(): boolean {
    return this.token.isTokenValid();
  }

  isSeller(): boolean {
    console.log('isSeller', this.token.parse());
    return this.token.parse()?.role === 'SELLER';
  }

}
