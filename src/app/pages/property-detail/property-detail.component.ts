import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { BookingService } from '../../services/booking.service';
import { QueryService } from '../../services/query.service';
import { RazorpayService } from '../../services/razorpay.service';
import { PropertyPricingService } from '../../services/property-pricing.service';
import { SeoService } from '../../services/seo.service';
import { ViewTrackingService } from '../../services/view-tracking.service';
import { Property } from '../../models/property.model';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var Razorpay: any;

@Component({
    selector: 'app-property-detail',
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
    templateUrl: './property-detail.component.html',
    styleUrl: './property-detail.component.scss'
})
export class PropertyDetailComponent implements OnInit, OnDestroy {
  property: Property | null = null;
  relatedProperties: Property[] = [];
  loading = true;
  currentImageIndex = 0;
  
  enquiryForm: FormGroup;
  submitting = false;
  submitSuccess = false;
  submitError = '';
  
  // Dynamic pricing
  currentPrice = 0;
  currentBookingType = 'coworking';
  pricingCache: { [key: string]: number } = {};
  loadingPrice = false;
  
  // Pricing options
  bookingTypeOptions = [
    { value: 'day-pass', label: 'Day Pass', icon: '📅' },
    { value: 'meeting-room', label: 'Meeting Room', icon: '🏢' },
    { value: 'coworking', label: 'Coworking', icon: '👥' },
    { value: 'private-office', label: 'Private Office', icon: '🚪' },
    { value: 'virtual-office', label: 'Virtual Office', icon: '🌐' }
  ];
  allPricing: { [key: string]: number } = {};
  loadingAllPrices = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private bookingService: BookingService,
    private queryService: QueryService,
    private rzpService: RazorpayService,
    private pricingService: PropertyPricingService,
    private seoService: SeoService,
    private viewTrackingService: ViewTrackingService,
    private fb: FormBuilder
  ) {
    this.enquiryForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      guests: ['1 person'],
      bookingType: ['coworking'], // Default to current category
      check_in: [new Date().toISOString().split('T')[0]],
      check_out: [''],
      message: ['']
    });
  }

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const city = params['city'];
        const category = params['category'];
        const slug = params['slug'];
        
        if (city && category && slug) {
          this.loadProperty(city, category, slug);
        }
      });
    
    // Listen for booking type changes and fetch pricing dynamically
    this.enquiryForm.get('bookingType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookingType => {
        if (this.property) {
          this.onBookingTypeChange(bookingType);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProperty(city: string, category: string, slug: string) {
    this.loading = true;
    this.propertyService.getPropertyByUrl(city, category, slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (property) => {
          if (property) {
            this.property = property;
            this.loadRelatedProperties(property);
            this.loadAllPricing(property.id);
            this.loading = false;
            
            // Update bookingType based on property category
            if (property.category) {
              this.enquiryForm.patchValue({
                bookingType: property.category
              });
            }
            
            // Track the property view
            this.viewTrackingService.trackPropertyView(property.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe();
            
            const seoData = this.seoService.generatePropertyPageMeta(property);
            this.seoService.updateMetaTags(seoData);
          } else {
            // Property not found, redirect to home
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          console.error('Error loading property:', err);
          this.loading = false;
          this.router.navigate(['/']);
        }
      });
  }

  private loadAllPricing(propertyId: string) {
    this.loadingAllPrices = true;
    this.allPricing = {};
    
    // Load pricing for all booking types
    this.bookingTypeOptions.forEach(option => {
      this.pricingService.getPricing(propertyId, option.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.success && response.data) {
              this.allPricing[option.value] = response.data.price || 0;
            }
          },
          error: (err) => {
            console.warn(`Error loading pricing for ${option.value}:`, err);
          },
          complete: () => {
            this.loadingAllPrices = false;
          }
        });
    });
  }

  private loadRelatedProperties(currentProperty: Property) {
    this.propertyService.getPropertiesByCategory(currentProperty.category)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (properties) => {
          this.relatedProperties = properties
            .filter(p => p.id !== currentProperty.id)
            .slice(0, 3);
        },
        error: (err) => {
          console.error('Error loading related properties:', err);
        }
      });
  }

  getPropertyUrl(property: Property): string {
    return this.propertyService.getPropertyUrl(property);
  }

  get categoryDisplay(): string {
    if (!this.property) return '';
    const categoryNames: { [key: string]: string } = {
      'virtual-office': 'Virtual Office',
      'coworking': 'Coworking Space',
      'private-office': 'Private Office',
      'meeting-room': 'Meeting Room'
    };
    return categoryNames[this.property.category] || this.property.category;
  }

  get cityDisplay(): string {
    if (!this.property) return '';
    return this.property.city.charAt(0).toUpperCase() + this.property.city.slice(1);
  }

  slugify(value: string): string {
    if (!value) return '';
    return value.toLowerCase().replace(/\s+/g, '-');
  }

  nextImage() {
    if (this.property && this.property.photos.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.property.photos.length;
    }
  }

  previousImage() {
    if (this.property && this.property.photos.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.property.photos.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  onBookNow() {
    this.submitEnquiry('booking');
  }

  onContactTour() {
    this.submitEnquiry('tour');
  }

  /**
   * Fetch and update pricing when booking type changes
   */
  private onBookingTypeChange(bookingType: string) {
    this.currentBookingType = bookingType;
    
    // Check cache first
    const cacheKey = `${this.property?.id}_${bookingType}`;
    if (this.pricingCache[cacheKey] !== undefined) {
      this.currentPrice = this.pricingCache[cacheKey];
      return;
    }
    
    // Fetch pricing from backend
    this.loadingPrice = true;
    this.pricingService.getPricing(this.property?.id || 0, bookingType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.currentPrice = response.data.price || 0;
            this.pricingCache[cacheKey] = this.currentPrice;
          } else {
            this.currentPrice = 0; // Free enquiry if no pricing found
          }
          this.loadingPrice = false;
        },
        error: (err) => {
          console.warn('Pricing fetch error:', err);
          this.currentPrice = 0; // Default to free if error
          this.loadingPrice = false;
        }
      });
  }

  selectBookingType(bookingType: string) {
    this.enquiryForm.patchValue({ bookingType });
    this.onBookingTypeChange(bookingType);
  }

  getPriceDescription(bookingType: string): string {
    const descriptions: { [key: string]: string } = {
      'day-pass': 'per day',
      'meeting-room': 'per hour',
      'coworking': 'per month',
      'private-office': 'per month',
      'virtual-office': 'per month'
    };
    return descriptions[bookingType] || 'per month';
  }

  isPaymentBookingType(bookingType: string): boolean {
    return bookingType === 'day-pass' || bookingType === 'meeting-room';
  }

  private async submitEnquiry(type: 'booking' | 'tour') {
    if (this.enquiryForm.invalid) {
      this.enquiryForm.markAllAsTouched();
      this.submitError = 'Please fill all required fields correctly.';
      return;
    }

    const bookingType = this.enquiryForm.get('bookingType')?.value;
    const isPaymentType = bookingType === 'day-pass' || bookingType === 'meeting-room';

    // If NOT a payment type and user clicked "Book Now" (or submit), submit as query instead
    if (!isPaymentType && type === 'booking') {
      this.submitQuery();
      return;
    }

    // If not a payment type and user clicked "Contact for Tour", still submit as query
    if (!isPaymentType && type === 'tour') {
      this.submitQuery();
      return;
    }

    // Payment booking flow (day-pass, meeting-room)
    this.submitting = true;
    this.submitError = '';

    try {
      // Use dynamically fetched price for payment
      const price = this.currentPrice > 0 ? this.currentPrice : 0;

      const bookingData = {
        ...this.enquiryForm.value,
        property_id: this.property?.id,
        type: type,
        price: price
      };

      // Step 1: Create booking and get order
      const orderResp: any = await firstValueFrom(this.bookingService.createBooking(bookingData));

      if (!orderResp.success) {
        this.submitError = orderResp.message || 'Failed to create booking';
        this.submitting = false;
        return;
      }

      const bookingId = orderResp.booking_id;

      if (price === 0) {
        // No payment needed, success
        this.submitting = false;
        this.submitSuccess = true;
        this.enquiryForm.reset({
          guests: '1 person',
          bookingType: this.property?.category || 'coworking',
          check_in: new Date().toISOString().split('T')[0]
        });
        return;
      }

      // Step 2: Handle payment
      if (orderResp.demo_mode) {
        // Demo mode - simulate payment
        this.simulatePaymentDemo(bookingId, orderResp);
      } else {
        // Real Razorpay mode
        await this.openRazorpayCheckout(bookingId, orderResp);
      }
    } catch (e: any) {
      console.error(e);
      this.submitError = e.message || 'Booking failed';
      this.submitting = false;
    }
  }

  /**
   * Submit a query for non-payment booking types (coworking, private-office, virtual-office)
   */
  private submitQuery() {
    if (this.enquiryForm.invalid) {
      this.enquiryForm.markAllAsTouched();
      this.submitError = 'Please fill all required fields correctly.';
      return;
    }

    if (!this.property?.id) {
      this.submitError = 'Property information is missing.';
      return;
    }

    this.submitting = true;
    this.submitError = '';

    const queryData = {
      property_id: this.property.id,
      bookingType: this.enquiryForm.get('bookingType')?.value,
      name: this.enquiryForm.get('name')?.value,
      email: this.enquiryForm.get('email')?.value,
      phone: this.enquiryForm.get('phone')?.value,
      check_in: this.enquiryForm.get('check_in')?.value || null,
      guests: this.enquiryForm.get('guests')?.value || null,
      message: this.enquiryForm.get('message')?.value || null
    };

    this.queryService.submitQuery(queryData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.submitting = false;
          this.submitSuccess = true;
          this.enquiryForm.reset({
            guests: '1 person',
            bookingType: this.property?.category || 'coworking',
            check_in: new Date().toISOString().split('T')[0]
          });
        } else {
          this.submitting = false;
          this.submitError = res.message || 'Failed to submit query';
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = 'Failed to submit query. Please try again later.';
        console.error('Query submission error:', err);
      }
    });
  }

  private async openRazorpayCheckout(bookingId: number, orderResp: any) {
    try {
      await this.loadRazorpayScript();

      const rzpOptions = {
        key: orderResp.key_id,
        order_id: orderResp.order_id,
        amount: orderResp.amount,
        currency: orderResp.currency,
        name: 'Booking Payment',
        description: `${this.enquiryForm.get('bookingType')?.value} - ${this.property?.title}`,
        prefill: {
          name: this.enquiryForm.get('name')?.value,
          email: this.enquiryForm.get('email')?.value,
          contact: this.enquiryForm.get('phone')?.value
        },
        handler: async (response: any) => {
          // Verify payment with server
          this.verifyAndUpdateBooking(bookingId, response);
        },
        modal: {
          ondismiss: () => {
            this.submitting = false;
            this.submitError = 'Payment cancelled';
          }
        }
      };

      const rzp = new Razorpay(rzpOptions);
      rzp.open();
    } catch (e) {
      this.submitting = false;
      this.submitError = 'Failed to open payment window';
    }
  }

  private verifyAndUpdateBooking(bookingId: number, paymentResponse: any) {
    this.rzpService.verifyPayment(paymentResponse).subscribe({
      next: (verifyRes: any) => {
        if (verifyRes.success) {
          // Update booking in database
          this.bookingService.verifyAndUpdateBooking(bookingId, paymentResponse).subscribe({
            next: (updateRes: any) => {
              this.submitting = false;
              this.submitSuccess = true;
              alert('Payment successful! Your booking has been confirmed.');
              this.enquiryForm.reset({
                guests: '1 person',
                bookingType: this.property?.category || 'coworking',
                check_in: new Date().toISOString().split('T')[0]
              });
            },
            error: (err) => {
              this.submitting = false;
              this.submitError = 'Payment verified but booking update failed';
            }
          });
        } else {
          this.submitting = false;
          this.submitError = 'Payment verification failed';
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = 'Payment verification error';
      }
    });
  }

  private simulatePaymentDemo(bookingId: number, orderResp: any) {
    const confirmed = confirm(
      `Demo Mode: Confirm booking of ₹${(orderResp.amount / 100).toLocaleString()}?\n\n` +
      `Booking Type: ${this.enquiryForm.get('bookingType')?.value}\n` +
      `Check-in: ${this.enquiryForm.get('check_in')?.value}\n\n` +
      `Click OK to confirm booking.`
    );

    if (!confirmed) {
      this.submitting = false;
      this.submitError = 'Booking cancelled';
      return;
    }

    // Simulate payment
    const mockPaymentId = 'pay_' + Math.random().toString(36).substr(2, 16);
    const mockSignature = 'demo_' + Math.random().toString(36).substr(2, 32);

    this.rzpService.verifyPayment({
      razorpay_order_id: orderResp.order_id,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: mockSignature
    }).subscribe({
      next: (verifyRes: any) => {
        if (verifyRes.success) {
          this.bookingService.verifyAndUpdateBooking(bookingId, {
            razorpay_order_id: orderResp.order_id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature
          }).subscribe({
            next: (updateRes: any) => {
              this.submitting = false;
              this.submitSuccess = true;
              alert('Demo booking confirmed! You will receive a confirmation email soon.');
              this.enquiryForm.reset({
                guests: '1 person',
                bookingType: this.property?.category || 'coworking',
                check_in: new Date().toISOString().split('T')[0]
              });
            },
            error: (err) => {
              this.submitting = false;
              this.submitError = 'Booking update failed';
            }
          });
        } else {
          this.submitting = false;
          this.submitError = 'Demo booking verification failed';
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = 'Error in demo booking';
      }
    });
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  }

  shouldShowServiceFee(): boolean {
    // Show service fee if explicitly enabled or by default (for now, make it optional)
    return this.property?.includeServiceFee ?? false;
  }

  shouldShowTax(): boolean {
    // Show tax if explicitly enabled or by default (for now, make it optional)
    return this.property?.includeTax ?? false;
  }

  calculateTax(price: number): number {
    // GST - convert price to number first, use custom tax % or default 18%
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const taxPercent = this.property?.taxPercent ?? 18;
    return Math.round(numPrice * (taxPercent / 100));
  }

  calculateServiceFee(price: number): number {
    // Service fee - use custom % or default 10%, minimum ₹100
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const feePercent = this.property?.serviceFeePercent ?? 10;
    return Math.max(Math.round(numPrice * (feePercent / 100)), 100);
  }

  calculateTotal(price: number): number {
    // Convert price to number to avoid string concatenation
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // For payment bookings (day-pass, meeting-room), don't add service fee/tax
    // Only return the base price as calculated by the property owner
    // Service fee and tax should already be included in dayPassPrice/meetingRoomPrice in database
    return numPrice;
  }
}
