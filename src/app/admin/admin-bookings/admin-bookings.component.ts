import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { QueryService } from '../../services/query.service';
import { EnquiryService } from '../../services/enquiry.service';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';

@Component({
    selector: 'app-admin-bookings',
    imports: [CommonModule, FormsModule, AdminHeaderComponent],
    templateUrl: './admin-bookings.component.html'
})
export class AdminBookingsComponent implements OnInit {
  bookings: any[] = [];
  queries: any[] = [];
  enquiries: any[] = [];
  loading = false;
  activeTab: 'bookings' | 'queries' | 'enquiries' = 'bookings';
  filterStatus = 'all';
  sortBy = 'created_at';
  sortOrder = 'DESC';

  // Computed counts
  get pendingBookingsCount(): number {
    return this.bookings ? this.bookings.filter(b => b.status === 'pending').length : 0;
  }

  // Selected enquiry for detailed view modal
  selectedEnquiry: any | null = null;

  statusOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'initiated', label: 'Payment Initiated' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending Enquiry' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  queryStatusOptions = [
    { value: 'all', label: 'All Queries' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'responded', label: 'Responded' },
    { value: 'converted', label: 'Converted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  enquiryStatusOptions = [
    { value: 'all', label: 'All Enquiries' },
    { value: 'pending', label: 'Pending' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'responded', label: 'Responded' },
    { value: 'converted', label: 'Converted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  constructor(
    private bookingService: BookingService,
    private queryService: QueryService,
    private enquiryService: EnquiryService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadQueries();
    this.loadEnquiries();
  }

  loadBookings(): void {
    this.loading = true;
    const status = this.filterStatus === 'all' ? null : this.filterStatus;
    
    this.bookingService.getBookings().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.bookings = res.data;
          if (status) {
            this.bookings = this.bookings.filter(b => b.status === status);
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loading = false;
      }
    });
  }

  loadQueries(): void {
    this.loading = true;
    const status = this.filterStatus === 'all' ? null : this.filterStatus;

    this.queryService.getQueries({ status: status || undefined }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.queries = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading queries:', err);
        this.loading = false;
      }
    });
  }

  loadEnquiries(): void {
    this.loading = true;
    const status = this.filterStatus === 'all' ? null : this.filterStatus;

    this.enquiryService.getEnquiries({ status: status || undefined }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.enquiries = res.enquiries || [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading enquiries:', err);
        this.loading = false;
      }
    });
  }

  switchTab(tab: 'bookings' | 'queries' | 'enquiries'): void {
    this.activeTab = tab;
  }

  updateQueryStatus(queryId: number, newStatus: string): void {
    this.queryService.updateQueryStatus(queryId, newStatus).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Reload queries
          this.loadQueries();
        }
      },
      error: (err) => {
        console.error('Error updating query status:', err);
      }
    });
  }

  updateEnquiryStatus(enquiryId: number, newStatus: string): void {
    this.enquiryService.updateEnquiryStatus(enquiryId, newStatus).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Reload enquiries
          this.loadEnquiries();
        }
      },
      error: (err) => {
        console.error('Error updating enquiry status:', err);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'completed': 'bg-green-100 text-green-800',
      'initiated': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getQueryStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'new': 'bg-red-100 text-red-800',
      'contacted': 'bg-blue-100 text-blue-800',
      'responded': 'bg-purple-100 text-purple-800',
      'converted': 'bg-green-100 text-green-800',
      'rejected': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusBadgeClass(status: string | null): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    const classes: { [key: string]: string } = {
      'success': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN');
  }

  isPaymentBooking(bookingType: string): boolean {
    return bookingType === 'day-pass' || bookingType === 'meeting-room';
  }

  onFilterChange(): void {
    if (this.activeTab === 'bookings') {
      this.loadBookings();
    } else if (this.activeTab === 'queries') {
      this.loadQueries();
    } else if (this.activeTab === 'enquiries') {
      this.loadEnquiries();
    }
  }

  // Open modal to view full enquiry details
  openEnquiry(enquiry: any): void {
    this.selectedEnquiry = enquiry;
  }

  // Close the modal
  closeEnquiry(): void {
    this.selectedEnquiry = null;
  }

  // Update status from modal and reflect optimistically in UI
  onEnquiryStatusChange(enquiry: any, newStatus: string): void {
    this.updateEnquiryStatus(enquiry.id, newStatus);
    enquiry.status = newStatus;
    if (this.selectedEnquiry && this.selectedEnquiry.id === enquiry.id) {
      this.selectedEnquiry.status = newStatus;
    }
  }
} 
