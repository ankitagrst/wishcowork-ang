import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PropertyService } from '../../services/property.service';
import { SeoService } from '../../services/seo.service';
import { Property, Category, City } from '../../models/property.model';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';

@Component({
    selector: 'app-category',
    imports: [CommonModule, RouterModule, PropertyCardComponent],
    templateUrl: './category.component.html',
    styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  allProperties: Property[] = [];
  currentCategory: string = '';
  currentCity: string = '';
  searchQuery: string = '';
  categories: Category[] = [];
  cities: City[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    // Load all properties first
    this.loadAllProperties();
    
    combineLatest([
      this.route.params,
      this.route.queryParams
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        // Normalize category and city names to lowercase with hyphens
        // Priority: Route params > Query params
        const rawCategory = params['categoryName'] || queryParams['type'] || queryParams['category'];
        const rawCity = params['cityName'] || queryParams['city'];
        
        this.currentCategory = this.normalizeValue(rawCategory);
        this.currentCity = this.normalizeValue(rawCity);
        this.searchQuery = queryParams['q'] || queryParams['search'] || '';
        
        console.log('Route and Query params:', { 
          category: this.currentCategory, 
          city: this.currentCity,
          search: this.searchQuery
        });
        
        this.applyFilters();
        this.updateSEO();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllProperties() {
    this.loading = true;
    this.propertyService.getAllProperties()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (allProperties) => {
          console.log('All properties loaded:', allProperties.length);
          this.allProperties = allProperties;
          
          // Build dynamic filter lists from actual data
          this.buildFilterLists();
          
          // Apply filters
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading properties:', err);
          this.loading = false;
        }
      });
  }

  private buildFilterLists() {
    // Extract unique categories from properties
    const uniqueCategories = [...new Set(this.allProperties.map(p => this.normalizeValue(p.category)))];
    this.categories = uniqueCategories.map(slug => {
      // Create a display name from the slug
      const displayName = this.getDisplayName(slug);
      return {
        id: slug,
        name: displayName,
        slug: slug,
        description: '',
        icon: '',
        featured: true
      };
    });
    console.log('Built categories:', this.categories);
    
    // Extract unique cities from properties
    const uniqueCities = [...new Set(this.allProperties.map(p => this.normalizeValue(p.city)))];
    this.cities = uniqueCities.map(slug => {
      const displayName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
      return {
        id: slug,
        name: displayName,
        slug: slug,
        state: '',
        country: 'India',
        featured: true,
        coordinates: { lat: 0, lng: 0 }
      };
    });
    console.log('Built cities:', this.cities);
  }

  private getDisplayName(slug: string): string {
    const categoryNames: { [key: string]: string } = {
      'virtual-office': 'Virtual Office',
      'coworking': 'Coworking Space',
      'private-office': 'Private Office',
      'meeting-room': 'Meeting Room',
      'coworking-space': 'Coworking Space',
      'business-lounge': 'Business Lounge'
    };
    return categoryNames[slug] || slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private applyFilters() {
    if (!this.allProperties.length) {
      this.properties = [];
      return;
    }
    
    console.log('Applying filters - category:', this.currentCategory, 'city:', this.currentCity);
    
    // Filter properties based on current category and city
    this.properties = this.allProperties.filter(property => {
      // Normalize property values for comparison
      const propCategory = this.normalizeValue(property.category);
      const propCity = this.normalizeValue(property.city);
      
      const matchesCategory = !this.currentCategory || 
                             propCategory === this.normalizeValue(this.currentCategory);
      const matchesCity = !this.currentCity || 
                         propCity === this.normalizeValue(this.currentCity);
      
      const matchesSearch = !this.searchQuery || 
                           property.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           property.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           property.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return matchesCategory && matchesCity && matchesSearch;
    });
    
    console.log('Filtered properties:', this.properties.length, 'properties');
  }
  
  // Helper method to normalize values for comparison (like admin panel)
  private normalizeValue(value: string | undefined): string {
    if (!value) return '';
    return value.toLowerCase().replace(/\s+/g, '-');
  }

  private updateSEO() {
    if (this.currentCategory && this.currentCity) {
      const seoData = this.seoService.generateCategoryPageMeta(this.currentCategory, this.currentCity);
      this.seoService.updateMetaTags(seoData);
    } else if (this.currentCategory) {
      const categoryNames: { [key: string]: string } = {
        'virtual-office': 'Virtual Office',
        'coworking': 'Coworking Space',
        'private-office': 'Private Office',
        'meeting-room': 'Meeting Room'
      };
      const categoryName = categoryNames[this.currentCategory] || this.currentCategory;
      
      this.seoService.updateMetaTags({
        title: `${categoryName} - Find Premium Workspace Solutions`,
        description: `Discover the best ${categoryName.toLowerCase()} spaces across India. Professional workspace solutions with modern amenities and flexible terms.`,
        keywords: `${categoryName}, workspace, office space, ${this.currentCategory}`
      });
    }
  }

  get categoryDisplay(): string {
    const categoryNames: { [key: string]: string } = {
      'virtual-office': 'Virtual Office',
      'coworking': 'Coworking Space',
      'private-office': 'Private Office',
      'meeting-room': 'Meeting Room'
    };
    return categoryNames[this.currentCategory] || this.currentCategory;
  }

  get cityDisplay(): string {
    return this.currentCity ? this.currentCity.charAt(0).toUpperCase() + this.currentCity.slice(1) : '';
  }
}
