import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Query {
  id?: number;
  property_id: string;
  bookingType: string;
  name: string;
  email: string;
  phone: string;
  check_in?: string | null;
  guests?: string | null;
  message?: string | null;
  status?: string;
  property_title?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  constructor(private http: HttpClient) {}

  // Submit a query for non-payment booking types
  submitQuery(queryData: Query) {
    return this.http.post(`${environment.apiUrl}/bookings/create_query.php`, queryData);
  }

  // Get all queries (for admin)
  getQueries(filters?: { status?: string; property_id?: string; booking_type?: string; limit?: number; offset?: number }) {
    let url = `${environment.apiUrl}/bookings/get_queries.php`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.property_id) params.append('property_id', filters.property_id);
      if (filters.booking_type) params.append('booking_type', filters.booking_type);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
    }
    return this.http.get<any>(url);
  }

  // Update query status
  updateQueryStatus(queryId: number, status: string) {
    return this.http.post(`${environment.apiUrl}/bookings/update_query_status.php`, {
      query_id: queryId,
      status: status
    });
  }
}
