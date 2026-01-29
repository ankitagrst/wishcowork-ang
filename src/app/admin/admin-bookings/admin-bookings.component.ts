import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';

@Component({
    selector: 'app-admin-bookings',
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-bookings.component.html'
})
export class AdminBookingsComponent implements OnInit {
  bookings: any[] = [];
  loading = false;

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.propertyService.getEnquiries().subscribe(enquiries => {
      // Filter for bookings if needed, or just show all enquiries as "bookings"
      // The dashboard shows all enquiries, so I'll do the same but maybe filter or sort
      this.bookings = enquiries;
      this.loading = false;
    });
  }

  updateStatus(id: number, status: string): void {
    this.propertyService.updateEnquiryStatus(id, status).subscribe(() => {
      this.loadBookings();
    });
  }

  deleteBooking(id: number): void {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.propertyService.deleteEnquiry(id).subscribe(() => {
        this.loadBookings();
      });
    }
  }
}
