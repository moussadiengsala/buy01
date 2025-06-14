import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard, SellerGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserPayload } from '../../types';

describe('AuthGuard', () => {
  let router: Router;
  let authService: AuthService;
  let initializationComplete$: BehaviorSubject<boolean>;
  let userState$: BehaviorSubject<UserPayload>;

  const routeSnapshot = {} as ActivatedRouteSnapshot;
  const stateSnapshot = { url: '/protected-route' } as RouterStateSnapshot;

  function isObservable<T>(value: any): value is Observable<T> {
    return value && typeof value.subscribe === 'function';
  }

  beforeEach(() => {
    // Create mock userState$ and initializationComplete$ subjects
    userState$ = new BehaviorSubject<UserPayload>({
      id: '',
      name: '',
      email: '',
      avatar: null,
      role: null,
      isAuthenticated: false
    });

    initializationComplete$ = new BehaviorSubject<boolean>(false);

    // Create a more accurate AuthService mock that matches the actual implementation
    const authServiceMock = {
      userState$: userState$,
      initializationComplete$: initializationComplete$
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);

    // Spy on router navigate method
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    // Clean up subscriptions
    userState$.complete();
    initializationComplete$.complete();
  });

  describe('AuthGuard', () => {
    // it('should wait for initialization to complete before checking authentication', fakeAsync(() => {
    //   // Arrange
    //   initializationComplete$.next(false);
    //   let guardResult: boolean | undefined;
    //   let completed = false;
    //
    //   // Act
    //   const result = TestBed.runInInjectionContext(() =>
    //       AuthGuard(routeSnapshot, stateSnapshot)
    //   );
    //
    //   // Since Angular 14+, we need to properly handle the MaybeAsync<GuardResult> type
    //   if (result && typeof result === 'object' && 'subscribe' in result) {
    //     // Subscribe to the guard result if it's an Observable
    //     result.subscribe({
    //       next: (allowed: boolean) => guardResult = allowed,
    //       complete: () => completed = true
    //     });
    //   }
    //
    //   // Assert - guard should not emit or complete yet
    //   tick(50);
    //   expect(guardResult).toBeUndefined();
    //   expect(completed).toBeFalse();
    //
    //   // Now complete initialization with authenticated user
    //   initializationComplete$.next(true);
    //   userState$.next({
    //     id: '1',
    //     name: 'Test User',
    //     email: 'test@example.com',
    //     avatar: null,
    //     role: null,
    //     isAuthenticated: true
    //   });
    //
    //   // Let the async operations complete
    //   tick(50);
    //
    //   // Check result
    //   expect(guardResult).toBeTrue();
    //   expect(completed).toBeTrue();
    //   expect(router.navigate).not.toHaveBeenCalled();
    // }));

    it('should wait for initialization to complete before checking authentication', fakeAsync(() => {
      initializationComplete$.next(false);
      let guardResult: boolean | undefined;
      let completed = false;

      const result = TestBed.runInInjectionContext(() =>
          AuthGuard(routeSnapshot, stateSnapshot)
      );

      if (isObservable<boolean>(result)) {
        result.subscribe({
          next: (allowed) => guardResult = allowed,
          complete: () => completed = true
        });
      } else {
        fail('Expected Observable from AuthGuard');
      }

      tick(50);
      expect(guardResult).toBeUndefined();
      expect(completed).toBeFalse();

      userState$.next({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        avatar: null,
        role: null,
        isAuthenticated: true
      });
      initializationComplete$.next(true);

      tick(50);

      expect(completed).toBeTrue();
      expect(guardResult).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should allow access when user is authenticated', fakeAsync(() => {
      let completed = false;
      // Arrange - IMPORTANT: Set initialization to complete FIRST
      initializationComplete$.next(true);
      // Then set the authenticated user state
      userState$.next({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        avatar: null,
        role: null,
        isAuthenticated: true
      });

      // Act
      const result = TestBed.runInInjectionContext(() =>
          AuthGuard(routeSnapshot, stateSnapshot)
      );

      let guardResult: boolean | undefined;

      if (isObservable<boolean>(result)) {
        result.subscribe({
          next: (allowed) => guardResult = allowed,
          complete: () => completed = true
        });
      } else {
        fail('Expected Observable from AuthGuard');
      }

      // Let the async operations complete
      tick(50);

      // Assert
      expect(guardResult).withContext('Expected guard to allow access').toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should redirect to sign-in when user is not authenticated', fakeAsync(() => {
      let completed = false;
      // Arrange - Set initialization complete FIRST
      initializationComplete$.next(true);
      // Then set the unauthenticated user state
      userState$.next({
        id: '',
        name: '',
        email: '',
        avatar: null,
        role: null,
        isAuthenticated: false
      });

      // Act
      const result = TestBed.runInInjectionContext(() =>
          AuthGuard(routeSnapshot, stateSnapshot)
      );

      let guardResult: boolean | undefined;
      if (isObservable<boolean>(result)) {
        result.subscribe({
          next: (allowed) => guardResult = allowed,
          complete: () => completed = true
        });
      } else {
        fail('Expected Observable from AuthGuard');
      }

      // Let the async operations complete
      tick(50);

      // Assert
      expect(guardResult).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/sign-in']);
    }));
  });

  describe('SellerGuard', () => {
    it('should allow access when user has SELLER role', fakeAsync(() => {
      let completed = false;
      // Arrange - Set initialization complete FIRST
      initializationComplete$.next(true);
      // Then set the authenticated seller user state
      userState$.next({
        id: '1',
        name: 'Seller User',
        email: 'seller@example.com',
        avatar: null,
        role: 'SELLER',
        isAuthenticated: true
      });

      // Act
      const result = TestBed.runInInjectionContext(() =>
          SellerGuard(routeSnapshot, stateSnapshot)
      );

      let guardResult: boolean | undefined;
      if (isObservable<boolean>(result)) {
        result.subscribe({
          next: (allowed) => guardResult = allowed,
          complete: () => completed = true
        });
      } else {
        fail('Expected Observable from AuthGuard');
      }

      // Let the async operations complete
      tick(50);

      // Assert
      expect(guardResult).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should redirect to error page when user does not have SELLER role', fakeAsync(() => {
      let completed = false;
      // Arrange - Set initialization complete FIRST
      initializationComplete$.next(true);
      // Then set the authenticated non-seller user state
      userState$.next({
        id: '1',
        name: 'Customer User',
        email: 'customer@example.com',
        avatar: null,
        role: 'CLIENT',
        isAuthenticated: true
      });

      // Act
      const result = TestBed.runInInjectionContext(() =>
          SellerGuard(routeSnapshot, stateSnapshot)
      );

      let guardResult: boolean | undefined;
      if (isObservable<boolean>(result)) {
        result.subscribe({
          next: (allowed) => guardResult = allowed,
          complete: () => completed = true
        });
      } else {
        fail('Expected Observable from AuthGuard');
      }

      // Let the async operations complete
      tick(50);

      // Assert
      expect(guardResult).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(
          ['/error'],
          { queryParams: { message: 'You do not have seller permissions.', state: 403 } }
      );
    }));

    it('should redirect to error page when user has no role', fakeAsync(() => {
      let completed = false;
      // Arrange - Set initialization complete FIRST
      initializationComplete$.next(true);
      // Then set the authenticated user with no role state
      userState$.next({
        id: '1',
        name: 'User',
        email: 'user@example.com',
        avatar: null,
        role: null,
        isAuthenticated: true
      });

      // Act
      const result = TestBed.runInInjectionContext(() =>
          SellerGuard(routeSnapshot, stateSnapshot)
      );

      let guardResult: boolean | undefined;
      if (isObservable<boolean>(result)) {
        result.subscribe({
          next: (allowed) => guardResult = allowed,
          complete: () => completed = true
        });
      } else {
        fail('Expected Observable from AuthGuard');
      }

      // Let the async operations complete
      tick(50);

      // Assert
      expect(guardResult).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(
          ['/error'],
          { queryParams: { message: 'You do not have seller permissions.', state: 403 } }
      );
    }));
  });
});
