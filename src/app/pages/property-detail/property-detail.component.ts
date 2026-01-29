import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { SeoService } from '../../services/seo.service';
import { ViewTrackingService } from '../../services/view-tracking.service';
import { Property } from '../../models/property.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
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

  private submitEnquiry(type: 'booking' | 'tour') {
    if (this.enquiryForm.invalid) {
      this.enquiryForm.markAllAsTouched();
      this.submitError = 'Please fill all required fields correctly.';
      return;
    }

    const bookingType = this.enquiryForm.get('bookingType')?.value;
    const isPaymentRedirect = bookingType === 'day-pass' || bookingType === 'meeting-room';

    this.submitting = true;
    this.submitError = '';
    
    const enquiryData = {
      ...this.enquiryForm.value,
      property_id: this.property?.id,
      type: type
    };

    if (isPaymentRedirect) {
      // Simulate redirection to payment gateway
      setTimeout(() => {
        this.submitting = false;
        alert('Redirecting to Payment Gateway...');
        // In a real app: window.location.href = 'https://payment-gateway.com/pay?amount=' + total;
      }, 1500);
      return;
    }

    this.propertyService.submitEnquiry(enquiryData).subscribe({
      next: (res) => {
        this.submitting = false;
        this.submitSuccess = true;
        this.enquiryForm.reset({
          guests: '1 person',
          bookingType: this.property?.category || 'coworking',
          check_in: new Date().toISOString().split('T')[0]
        });
        // Success message is handled in HTML
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = 'Failed to submit enquiry. Please try again later.';
      }
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
    let total = numPrice;
    
    if (this.shouldShowServiceFee()) {
      total += this.calculateServiceFee(numPrice);
    }
    
    if (this.shouldShowTax()) {
      total += this.calculateTax(numPrice);
    }
    
    return total;
  }
}
