import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(private http: HttpClient) {}

  // Create a booking with Razorpay order
  createBooking(bookingData: any) {
    return this.http.post(`${environment.apiUrl}/bookings/create_booking.php`, bookingData);
  }

  // Get all bookings (for admin)
  getBookings() {
    return this.http.get(`${environment.apiUrl}/bookings/get_bookings.php`);
  }

  // Get booking by ID
  getBooking(id: number) {
    return this.http.get(`${environment.apiUrl}/bookings/get_booking.php?id=${id}`);
  }

  // Update booking status after payment verification
  updateBookingStatus(bookingId: number, status: 'initiated' | 'completed' | 'failed') {
    return this.http.post(`${environment.apiUrl}/bookings/update_booking.php`, { id: bookingId, status });
  }

  // Verify payment and update booking
  verifyAndUpdateBooking(bookingId: number, paymentData: any) {
    return this.http.post(`${environment.apiUrl}/bookings/verify_and_update.php`, { 
      booking_id: bookingId, 
      ...paymentData 
    });
  }
}
