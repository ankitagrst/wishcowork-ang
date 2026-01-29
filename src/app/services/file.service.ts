import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  uploadImage(file: File): Observable<{success: boolean, url: string, error?: string}> {
    if (this.settingsService.isUsingMockAPI()) {
      // Return a placeholder for mock mode
      return of({
        success: true,
        url: URL.createObjectURL(file)
      });
    }

    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = this.settingsService.getApiUrl();
    return this.http.post<any>(`${apiUrl}/upload`, formData).pipe(
      map(response => ({
        success: true,
        url: response.url
      })),
      catchError(error => {
        console.error('Upload failed:', error);
        let errorMessage = 'Upload failed';
        
        if (error.status === 0) {
          errorMessage = 'Could not reach the API server. Please check your API URL in Settings.';
        } else if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        return of({
          success: false,
          url: '',
          error: errorMessage
        });
      })
    );
  }
}
