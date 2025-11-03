import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingsService } from './settings.service';

export interface Event {
  id?: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  image?: string;
  category: string;
  registrationLink?: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  maxAttendees?: number;
  currentAttendees: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private get apiUrl(): string {
    return this.settingsService.getApiUrl();
  }

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  // Get all events
  getEvents(includeInactive = false, category?: string, upcoming = false): Observable<Event[]> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }
    if (category) {
      params = params.set('category', category);
    }
    if (upcoming) {
      params = params.set('upcoming', 'true');
    }
    return this.http.get<Event[]>(`${this.apiUrl}/events`, { params });
  }

  // Get event by ID
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  // Create new event
  createEvent(event: Event): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, event);
  }

  // Update event
  updateEvent(event: Event): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${event.id}`, event);
  }

  // Delete event
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`);
  }
}
