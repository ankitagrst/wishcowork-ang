import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.scss'
})
export class PropertyFormComponent implements OnInit {
  propertyForm!: FormGroup;
  isEditMode = false;
  propertyId: string | null = null;
  loading = false;
  error = '';
  success = '';

  categories = [
    { value: 'virtual-office', label: 'Virtual Office' },
    { value: 'coworking', label: 'Coworking Space' },
    { value: 'private-office', label: 'Private Office' },
    { value: 'meeting-room', label: 'Meeting Room' }
  ];

  // Cities are now free-form text input - user can enter any city name

  priceTypes = [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'daily', label: 'Per Day' },
    { value: 'monthly', label: 'Per Month' }
  ];

  availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Check if editing existing property
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.propertyId = params['id'];
        this.loadProperty(params['id']);
      }
    });
  }

  initForm(): void {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      category: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      priceType: ['monthly', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      amenities: this.fb.array([]),
      photos: this.fb.array([]),
      featured: [false],
      availability: ['available', Validators.required],
      rating: [0, [Validators.min(0), Validators.max(5)]],
      reviews: [0, [Validators.min(0)]],
      latitude: [0, Validators.required],
      longitude: [0, Validators.required],
      // Pricing options
      includeServiceFee: [false],
      serviceFeePercent: [10, [Validators.min(0), Validators.max(100)]],
      includeTax: [false],
      taxPercent: [18, [Validators.min(0), Validators.max(100)]]
    });

    // Add at least one amenity and photo field
    this.addAmenity();
    this.addPhoto();
  }

  get amenities(): FormArray {
    return this.propertyForm.get('amenities') as FormArray;
  }

  get photos(): FormArray {
    return this.propertyForm.get('photos') as FormArray;
  }

  addAmenity(): void {
    this.amenities.push(this.fb.control('', Validators.required));
  }

  removeAmenity(index: number): void {
    if (this.amenities.length > 1) {
      this.amenities.removeAt(index);
    }
  }

  addPhoto(): void {
    this.photos.push(this.fb.control('', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]));
  }

  removePhoto(index: number): void {
    if (this.photos.length > 1) {
      this.photos.removeAt(index);
    }
  }

  loadProperty(id: string): void {
    this.loading = true;
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        if (property) {
          // Clear existing amenities and photos
          while (this.amenities.length) {
            this.amenities.removeAt(0);
          }
          while (this.photos.length) {
            this.photos.removeAt(0);
          }

          // Populate form
          this.propertyForm.patchValue({
            title: property.title,
            category: property.category,
            city: property.city,
            address: property.address,
            price: property.price,
            priceType: property.priceType,
            description: property.description,
            featured: property.featured,
            availability: property.availability,
            rating: property.rating || 0,
            reviews: property.reviews || 0,
            latitude: property.coordinates?.lat || 0,
            longitude: property.coordinates?.lng || 0,
            // Pricing options
            includeServiceFee: property.includeServiceFee || false,
            serviceFeePercent: property.serviceFeePercent || 10,
            includeTax: property.includeTax || false,
            taxPercent: property.taxPercent || 18
          });

          // Add amenities
          property.amenities?.forEach(amenity => {
            this.amenities.push(this.fb.control(amenity, Validators.required));
          });

          // Add photos
          property.photos?.forEach(photo => {
            this.photos.push(this.fb.control(photo, [Validators.required, Validators.pattern(/^https?:\/\/.+/)]));
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load property';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      this.error = 'Please fill all required fields correctly';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formValue = this.propertyForm.value;
    
    // Prepare property data to match API expectations
    const propertyData: any = {
      title: formValue.title,
      slug: this.generateSlug(formValue.title),
      category: formValue.category,
      city: formValue.city,
      address: formValue.address,
      price: parseFloat(formValue.price),
      price_type: formValue.priceType, // Match API field name
      description: formValue.description,
      amenities: formValue.amenities.filter((a: string) => a.trim()),
      photos: formValue.photos.filter((p: string) => p.trim()),
      featured: formValue.featured,
      availability: formValue.availability,
      rating: parseFloat(formValue.rating) || 0,
      reviews: parseInt(formValue.reviews) || 0,
      latitude: parseFloat(formValue.latitude), // Send as separate fields
      longitude: parseFloat(formValue.longitude), // Send as separate fields
      // Pricing options
      include_service_fee: formValue.includeServiceFee,
      service_fee_percent: parseFloat(formValue.serviceFeePercent) || 10,
      include_tax: formValue.includeTax,
      tax_percent: parseFloat(formValue.taxPercent) || 18
    };
    
    console.log('Sending property data to API:', propertyData);

    if (this.isEditMode && this.propertyId) {
      // Update existing property
      this.propertyService.updateProperty(this.propertyId, propertyData).subscribe({
        next: (success) => {
          if (success) {
            this.success = 'Property updated successfully!';
            setTimeout(() => {
              this.router.navigate(['/admin/properties']);
            }, 1500);
          } else {
            this.error = 'Failed to update property';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to update property';
          this.loading = false;
        }
      });
    } else {
      // Create new property
      this.propertyService.createProperty(propertyData).subscribe({
        next: (property) => {
          if (property) {
            this.success = 'Property created successfully!';
            setTimeout(() => {
              this.router.navigate(['/admin/properties']);
            }, 1500);
          } else {
            this.error = 'Failed to create property';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to create property';
          this.loading = false;
        }
      });
    }
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  cancel(): void {
    this.router.navigate(['/admin/properties']);
  }
}
