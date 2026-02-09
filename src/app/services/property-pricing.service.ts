import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface BookingTypePrice {
  id?: number;
  property_id: number;
  booking_type: string;
  price: number;
  currency?: string;
  description?: string;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyPricingService {
  constructor(private http: HttpClient) {}

  /**
   * Get pricing for a specific property and booking type
   * @param propertyId - Property ID
   * @param bookingType - Booking type (coworking, meeting-room, day-pass, etc.)
   */
  getPricing(propertyId: string | number, bookingType: string) {
    return this.http.get(
      `${environment.apiUrl}/bookings/get_pricing.php?property_id=${propertyId}&booking_type=${bookingType}`
    );
  }

  /**
   * Get all pricing configurations for a property (admin)
   * @param propertyId - Property ID
   */
  getPropertyPricing(propertyId: string | number) {
    return this.http.get(
      `${environment.apiUrl}/bookings/get_property_pricing.php?property_id=${propertyId}`
    );
  }

  /**
   * Set/update pricing for a property and booking type (admin only)
   * @param propertyId - Property ID
   * @param bookingType - Booking type
   * @param priceData - Price data including price, description, dates, etc.
   */
  setPricing(propertyId: string | number, bookingType: string, priceData: any) {
    return this.http.post(`${environment.apiUrl}/bookings/set_pricing.php`, {
      property_id: propertyId,
      booking_type: bookingType,
      ...priceData
    });
  }
}
