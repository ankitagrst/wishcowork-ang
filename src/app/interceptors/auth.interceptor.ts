import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Only add token if it exists and request is to our API
  if (token && (req.url.includes('/auth') || req.url.includes('/properties'))) {
    // Clone the request and add the Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Auth interceptor: Added token to request', req.url);
    return next(authReq);
  }
  
  return next(req);
};
