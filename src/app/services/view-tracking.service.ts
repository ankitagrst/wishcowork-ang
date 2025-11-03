import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@env';
import { SettingsService } from './settings.service';

interface ViewStats {
  success: boolean;
  total_views: number;
  properties_viewed?: number;
  days_with_views?: number;
  top_properties?: Array<{
    property_id: string;
    title: string;
    views: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ViewTrackingService {
  
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  private get apiUrl(): string {
    return this.settingsService.getApiUrl();
  }

  /**
   * Track a property view
   */
  trackPropertyView(propertyId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/views`, {
      property_id: propertyId
    }).pipe(
      tap(() => console.log(`Tracked view for property: ${propertyId}`)),
      catchError(error => {
        console.error('Failed to track view:', error);
        return of(null);
      })
    );
  }

  /**
   * Get total views across all properties
   */
  getTotalViews(): Observable<ViewStats> {
    return this.http.get<ViewStats>(`${this.apiUrl}/views`).pipe(
      catchError(error => {
        console.error('Failed to get total views:', error);
        return of({
          success: false,
          total_views: 0,
          properties_viewed: 0,
          days_with_views: 0,
          top_properties: []
        });
      })
    );
  }

  /**
   * Get views for a specific property
   */
  getPropertyViews(propertyId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/views?property_id=${propertyId}`).pipe(
      catchError(error => {
        console.error('Failed to get property views:', error);
        return of({ success: false, total_views: 0 });
      })
    );
  }
}
