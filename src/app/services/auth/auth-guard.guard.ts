import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service.service';
import { inject } from '@angular/core';
import { TokenService } from '../token/token.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/sign-in']);
    return false;
  }

  return true;
};

export const SellerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isSeller()) {
    router.navigate(['/error?message=You%20do%20not%20have%20seller%20permissions.&state=403']);
    return false;
  }  

  return true;
};