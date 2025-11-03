import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

/**
 * Auth Guard to protect routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.validateToken().pipe(
    map(isValid => {
      if (isValid && authService.isAuthenticated()) {
        return true;
      } else {
        // Redirect to login with return URL
        router.navigate(['/admin/login'], { 
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    })
  );
};

/**
 * Admin Guard to protect routes that require admin role
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.validateToken().pipe(
    map(isValid => {
      if (isValid && authService.isAuthenticated() && authService.isAdmin()) {
        return true;
      } else if (isValid && authService.isAuthenticated()) {
        // User is logged in but not admin
        router.navigate(['/']);
        return false;
      } else {
        // User is not logged in
        router.navigate(['/admin/login'], { 
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    })
  );
};
