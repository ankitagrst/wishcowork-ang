import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { SeoService } from '../../services/seo.service';
import { ViewTrackingService } from '../../services/view-tracking.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss'
})
export class PropertyDetailComponent implements OnInit {
  property: Property | null = null;
  relatedProperties: Property[] = [];
  loading = true;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private seoService: SeoService,
    private viewTrackingService: ViewTrackingService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const city = params['city'];
      const category = params['category'];
      const slug = params['slug'];
      
      if (city && category && slug) {
        this.loadProperty(city, category, slug);
      }
    });
  }

  private loadProperty(city: string, category: string, slug: string) {
    this.loading = true;
    this.propertyService.getPropertyByUrl(city, category, slug).subscribe(property => {
      if (property) {
        this.property = property;
        this.loadRelatedProperties(property);
        this.loading = false;
        
        // Track the property view
        this.viewTrackingService.trackPropertyView(property.id).subscribe();
        
        const seoData = this.seoService.generatePropertyPageMeta(property);
        this.seoService.updateMetaTags(seoData);
      } else {
        // Property not found, redirect to home
        this.router.navigate(['/']);
      }
    });
  }

  private loadRelatedProperties(currentProperty: Property) {
    this.propertyService.getPropertiesByCategory(currentProperty.category).subscribe(properties => {
      this.relatedProperties = properties
        .filter(p => p.id !== currentProperty.id)
        .slice(0, 3);
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
    // Implement booking logic
    // Booking property: this.property?.id
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
