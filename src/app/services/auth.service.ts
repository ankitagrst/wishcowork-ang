import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@env';
import { SettingsService } from './settings.service';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'wishcowork_auth_token';
  private userKey = 'wishcowork_user';

  // Mock admin credentials (for frontend-only testing)
  private mockAdminCredentials = {
    email: 'admin@wishcowork.com',
    password: 'admin123'
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private settingsService: SettingsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    // Only access localStorage in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  /**
   * Login user with email and password (Real PHP API)
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const settings = this.settingsService.getSettings();
    const apiUrl = settings.apiUrl;
    const useMockAPI = settings.useMockAPI;

    // Option 1: Use Real PHP API
    if (!useMockAPI) {
      return this.http.post<AuthResponse>(`${apiUrl}/auth`, credentials).pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            // Store in localStorage (only in browser)
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem(this.tokenKey, response.token);
              localStorage.setItem(this.userKey, JSON.stringify(response.user));
            }
            this.currentUserSubject.next(response.user);
          }
        }),
        catchError(error => {
          const errorMessage = error.error?.error || error.message || 'Invalid email or password';
          return throwError(() => new Error(errorMessage));
        })
      );
    }
    
    // Option 2: Mock authentication (for frontend-only testing)
    if (
      credentials.email === this.mockAdminCredentials.email &&
      credentials.password === this.mockAdminCredentials.password
    ) {
      const user: User = {
        id: '1',
        email: credentials.email,
        name: 'Admin User',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff'
      };

      const token = this.generateMockToken();
      const response: AuthResponse = { success: true, user, token };

      // Store in localStorage (only in browser)
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }

      this.currentUserSubject.next(user);

      return of(response).pipe(delay(500)); // Simulate network delay
    } else {
      return throwError(() => new Error('Invalid email or password')).pipe(delay(500));
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/admin/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!this.currentUserSubject.value && !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUserSubject.next(null);
  }

  /**
   * Generate mock JWT token (replace with real token from backend)
   */
  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: '1',
      email: this.mockAdminCredentials.email,
      role: 'admin',
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    const signature = btoa('mock_signature');
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Validate token (mock implementation)
   */
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    // Validate JWT token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // JWT exp is in seconds, Date.now() is in milliseconds
      const isValid = payload.exp > (Date.now() / 1000);
      
      if (!isValid) {
        console.warn('Token expired');
        this.clearAuth();
      } else {
        console.log('Token is valid');
      }
      
      return of(isValid);
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuth();
      return of(false);
    }
  }
}
