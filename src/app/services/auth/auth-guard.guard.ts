import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateFn, GuardResult,
    MaybeAsync,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import { AuthService } from './auth-service.service';
import {inject, Injectable} from '@angular/core';
import {filter, map, take} from 'rxjs/operators';
import {switchMap} from "rxjs";


export const AuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.initializationComplete$.pipe(
        filter(complete => complete), // Wait until initialization is complete
        switchMap(() => authService.userState$),
        take(1),
        map(user => {
            if (!user.isAuthenticated) {
                router.navigate(['/auth/sign-in']);
                return false;
            }
            return true;
        })
    );
};

export const SellerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.initializationComplete$.pipe(
          filter(complete => complete), // Wait until initialization is complete
          switchMap(() => authService.userState$),
          take(1),
          map(user => {
            if (user.role !== 'SELLER') {
              router.navigate(['/error'], {
                queryParams: { message: 'You do not have seller permissions.', state: 403 }
              });
              return false;
            }
            return true;
          })
  );
};

export function appInitializerFactory(authService: AuthService) {
    return () => authService.initializationComplete$.pipe(
        filter((isComplete) => isComplete),
        take(1)
    ).toPromise();
}

