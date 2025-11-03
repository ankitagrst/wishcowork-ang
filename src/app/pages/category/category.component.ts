import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { SeoService } from '../../services/seo.service';
import { Property, Category, City } from '../../models/property.model';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule, PropertyCardComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {
  properties: Property[] = [];
  allProperties: Property[] = [];
  currentCategory: string = '';
  currentCity: string = '';
  categories: Category[] = [];
  cities: City[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    // Load all properties first
    this.loadAllProperties();
    
    this.route.params.subscribe(params => {
      // Normalize category and city names to lowercase with hyphens
      this.currentCategory = params['categoryName'];
      this.currentCity = params['cityName'];
      console.log('Route params:', { categoryName: params['categoryName'], cityName: params['cityName'] });
      this.applyFilters();
      this.updateSEO();
    });
  }

  private loadAllProperties() {
    this.loading = true;
    this.propertyService.getAllProperties().subscribe(allProperties => {
      console.log('All properties loaded:', allProperties.length);
      this.allProperties = allProperties;
      
      // Build dynamic filter lists from actual data
      this.buildFilterLists();
      
      // Apply filters
      this.applyFilters();
      this.loading = false;
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
      
      return matchesCategory && matchesCity;
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
