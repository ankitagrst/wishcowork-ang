import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PricingService, AdditionalService, FAQ } from '../../services/pricing.service';
import { PropertyService } from '../../services/property.service';
import { PropertyPricingService, BookingTypePrice } from '../../services/property-pricing.service';
import { AuthService } from '../../services/auth.service';
import { LocomotiveScrollService } from '../../services/locomotive-scroll.service';
import { Property } from '../../models/property.model';

@Component({
    selector: 'app-admin-pricing',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './admin-pricing.component.html',
    styleUrls: ['./admin-pricing.component.css']
})
export class AdminPricingComponent implements OnInit {
  activeTab: 'services' | 'faqs' | 'property-pricing' = 'property-pricing';
  
  // Services
  services: AdditionalService[] = [];
  selectedService: AdditionalService | null = null;
  showServiceModal = false;
  
  // FAQs
  faqs: FAQ[] = [];
  selectedFaq: FAQ | null = null;
  showFaqModal = false;
  
  // Property Pricing
  properties: Property[] = [];
  selectedProperty: Property | null = null;
  propertyPricing: BookingTypePrice[] = [];
  pricingForm: FormGroup;
  bookingTypes = ['coworking', 'private-office', 'meeting-room', 'virtual-office', 'day-pass'];
  
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private pricingService: PricingService,
    private propertyService: PropertyService,
    private propertyPricingService: PropertyPricingService,
    private router: Router,
    private authService: AuthService,
    private locomotiveScrollService: LocomotiveScrollService,
    private fb: FormBuilder
  ) {
    this.pricingForm = this.fb.group({
      booking_type: ['coworking', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      valid_from: [''],
      valid_to: [''],
      currency: ['INR']
    });
  }

  ngOnInit() {
    this.loadServices();
    this.loadFaqs();
    this.loadProperties();
  }

  public currentScrollY = 0;
  private scrollY = 0;

  private toggleBodyScroll(lock: boolean): void {
    if (typeof document === 'undefined') return;
    
    if (lock) {
      // Get scroll position from Locomotive Service for positioning the modal
      this.currentScrollY = this.locomotiveScrollService.getScrollY();
      
      this.scrollY = window.scrollY || window.pageYOffset;
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      this.locomotiveScrollService.stop();
    } else {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      window.scrollTo(0, this.scrollY);
      this.locomotiveScrollService.start();
    }
  }

  closeModal() {
    this.showServiceModal = false;
    this.showFaqModal = false;
    this.toggleBodyScroll(false);
  }

  // Services Methods
  loadServices(): void {
    this.loading = true;
    this.pricingService.getServices(true).subscribe({
      next: (data) => {
        this.services = data.sort((a, b) => a.displayOrder - b.displayOrder);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load services';
        this.loading = false;
      }
    });
  }

  openServiceModal(service?: AdditionalService) {
    if (service) {
      this.selectedService = { ...service };
    } else {
      this.selectedService = {
        name: '',
        description: '',
        price: 0,
        unit: 'hour',
        icon: '',
        displayOrder: this.services.length + 1,
        isActive: true
      };
    }
    this.showServiceModal = true;
    this.toggleBodyScroll(true);
  }

  saveService() {
    if (!this.selectedService) return;
    
    this.loading = true;
    const operation = this.selectedService.id 
      ? this.pricingService.updateService(this.selectedService)
      : this.pricingService.createService(this.selectedService);
    
    operation.subscribe({
      next: () => {
        this.success = `Service ${this.selectedService!.id ? 'updated' : 'created'} successfully`;
        this.closeModal();
        this.loadServices();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to save service';
        this.loading = false;
      }
    });
  }

  deleteService(id: number) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    this.loading = true;
    this.pricingService.deleteService(id).subscribe({
      next: () => {
        this.success = 'Service deleted successfully';
        this.loadServices();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete service';
        this.loading = false;
      }
    });
  }

  // FAQs Methods
  loadFaqs() {
    this.loading = true;
    this.pricingService.getFaqs(true).subscribe({
      next: (data) => {
        this.faqs = data.sort((a, b) => a.displayOrder - b.displayOrder);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load FAQs';
        this.loading = false;
      }
    });
  }

  openFaqModal(faq?: FAQ) {
    if (faq) {
      this.selectedFaq = { ...faq };
    } else {
      this.selectedFaq = {
        question: '',
        answer: '',
        displayOrder: this.faqs.length + 1,
        isActive: true
      };
    }
    this.showFaqModal = true;
    this.toggleBodyScroll(true);
  }

  saveFaq() {
    if (!this.selectedFaq) return;
    
    this.loading = true;
    const operation = this.selectedFaq.id 
      ? this.pricingService.updateFaq(this.selectedFaq)
      : this.pricingService.createFaq(this.selectedFaq);
    
    operation.subscribe({
      next: () => {
        this.success = `FAQ ${this.selectedFaq!.id ? 'updated' : 'created'} successfully`;
        this.closeModal();
        this.loadFaqs();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to save FAQ';
        this.loading = false;
      }
    });
  }

  deleteFaq(id: number) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    this.loading = true;
    this.pricingService.deleteFaq(id).subscribe({
      next: () => {
        this.success = 'FAQ deleted successfully';
        this.loadFaqs();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete FAQ';
        this.loading = false;
      }
    });
  }

  // Property Pricing Methods
  loadProperties() {
    this.propertyService.getAllProperties().subscribe({
      next: (properties) => {
        this.properties = properties;
      },
      error: (err) => {
        console.error('Failed to load properties:', err);
      }
    });
  }

  selectProperty(property: Property) {
    this.selectedProperty = property;
    this.propertyPricing = [];
    this.pricingForm.reset({ booking_type: 'coworking', currency: 'INR' });
    this.error = null;
    this.success = null;
    this.loadPropertyPricing(property);
  }

  loadPropertyPricing(property: Property) {
    this.loading = true;
    this.propertyPricingService.getPropertyPricing(property.id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.propertyPricing = response.data || [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pricing:', err);
        this.error = 'Failed to load pricing';
        this.loading = false;
      }
    });
  }

  editPropertyPricing(pricing: BookingTypePrice) {
    this.pricingForm.patchValue({
      booking_type: pricing.booking_type,
      price: pricing.price,
      description: pricing.description || '',
      valid_from: pricing.valid_from || '',
      valid_to: pricing.valid_to || '',
      currency: pricing.currency || 'INR'
    });
  }

  submitPropertyPricing() {
    if (!this.selectedProperty || this.pricingForm.invalid) {
      this.error = 'Please select a property and fill all required fields';
      return;
    }

    this.loading = true;
    this.propertyPricingService.setPricing(
      this.selectedProperty.id,
      this.pricingForm.get('booking_type')?.value,
      {
        price: this.pricingForm.get('price')?.value,
        description: this.pricingForm.get('description')?.value,
        valid_from: this.pricingForm.get('valid_from')?.value,
        valid_to: this.pricingForm.get('valid_to')?.value,
        currency: this.pricingForm.get('currency')?.value
      }
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.success = `${response.data?.booking_type} pricing updated successfully`;
          this.pricingForm.reset({ booking_type: 'coworking', currency: 'INR' });
          this.loadPropertyPricing(this.selectedProperty!);
          setTimeout(() => this.success = null, 3000);
        } else {
          this.error = response.message || 'Failed to update pricing';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating pricing:', err);
        this.error = 'Error updating pricing: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  resetPricingForm() {
    this.pricingForm.reset({ booking_type: 'coworking', currency: 'INR' });
    this.error = null;
  }

  getPricingForType(bookingType: string): BookingTypePrice | undefined {
    return this.propertyPricing.find(p => p.booking_type === bookingType);
  }

  // Navigation Methods
  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}

