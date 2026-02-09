import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Enquiry {
  id?: number;
  property_id?: string | null;
  type: string;
  name: string;
  email: string;
  phone: string;
  guests?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  message?: string | null;
  status?: string;
  property_title?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  constructor(private http: HttpClient) {}

  // Submit an enquiry (from contact form)
  submitEnquiry(enquiryData: Enquiry) {
    return this.http.post(`${environment.apiUrl}/enquiries`, enquiryData);
  }

  // Get all enquiries (for admin) with optional filters
  getEnquiries(filters?: { status?: string; type?: string; limit?: number; offset?: number }) {
    let url = `${environment.apiUrl}/enquiries`;
    if (filters && Object.values(filters).some(v => v !== undefined && v !== null)) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
    }
    return this.http.get<{ success: boolean; enquiries: Enquiry[] }>(url);
  }

  // Update enquiry status
  updateEnquiryStatus(enquiryId: number, status: string) {
    return this.http.post(`${environment.apiUrl}/enquiries/${enquiryId}/status`, {
      status: status
    });
  }
}
