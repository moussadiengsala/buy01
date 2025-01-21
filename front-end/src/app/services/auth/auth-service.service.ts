
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import {HttpClient, HttpStatusCode} from '@angular/common/http';
import { TokenService } from '../token/token.service';
import { Router } from '@angular/router';
import {ApiResponse, Tokens, User, UserLoginRequest, UserPayload} from "../../types";
import {take} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
    private defaultUserPayload: UserPayload = { id: '', name: '', email: '', avatar: null, role: null, isAuthenticated: false};
    private API_URL = "https://localhost:8082/api/v1/users"
    private user = new BehaviorSubject<UserPayload>(this.defaultUserPayload);
    public userState$: Observable<UserPayload> = this.user.asObservable();
    public initializationComplete$ = new BehaviorSubject<boolean>(false);

    constructor(
        private http: HttpClient,
        private tokenService: TokenService,
        private router: Router
    ) {
        this.initialize().then(() => {
            this.initializationComplete$.next(true);
        });
    }

    private async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.tokenService.isTokenValid().subscribe(
                user => {
                    if (user) {
                        this.user.next(user);
                    } else {
                        this.user.next(this.defaultUserPayload);
                    }
                    resolve();
                },
                error => {
                    this.user.next(this.defaultUserPayload);
                    reject(error);
                }
            );
        });
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
                    if (body?.data && body.status === HttpStatusCode.Created) {
                        this.tokenService.token = body.data; // Store tokens
                        const user: User | null = this.tokenService.parse();
                        if (!user) throw Error("Unable to parse the token.")
                        this.user.next({ ...user, isAuthenticated: true });
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
            if (body?.data && HttpStatusCode.Ok === body.status) {
                this.tokenService.token = body.data; // Store tokens
                const user: User | null = this.tokenService.parse(); // Extract user data from token
                if (!user) throw Error("Unable to parse the token.")
                this.user.next({ ...user, isAuthenticated: true }); // Update user state
            }
            return body;
        })
      );
  }

  logout(): void {
    this.router.navigate(['/auth/sign-in']);
    this.user.next(this.defaultUserPayload);
    this.tokenService.remove();
  }

    isSeller(): boolean {
        return this.user.value.role === 'SELLER';
    }

}
