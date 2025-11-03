import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Category, City } from '../../models/property.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  categories: Category[] = [];
  cities: City[] = [];
  isMobileMenuOpen = false;

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    // Load categories dynamically from actual database properties
    this.loadCategoriesFromDatabase();
    
    // Load cities dynamically from actual database properties
    this.loadCitiesFromDatabase();
  }
  
  private loadCategoriesFromDatabase() {
    this.propertyService.getAllProperties().subscribe(properties => {
      // Extract unique categories from actual properties
      const uniqueCategories = [...new Set(properties.map(p => this.normalizeValue(p.category)))];
      
      // Build category objects with proper display names and icons
      this.categories = uniqueCategories.map(slug => ({
        id: slug,
        name: this.getDisplayName(slug),
        slug: slug,
        description: this.getCategoryDescription(slug),
        icon: this.getCategoryIcon(slug),
        featured: true
      }));
      
      console.log('Header categories loaded from database:', this.categories);
    });
  }
  
  private loadCitiesFromDatabase() {
    this.propertyService.getAllProperties().subscribe(properties => {
      // Extract unique cities from actual properties
      const uniqueCities = [...new Set(properties.map(p => this.normalizeValue(p.city)))];
      
      // Build city objects
      this.cities = uniqueCities.map(slug => ({
        id: slug,
        name: this.getCityDisplayName(slug),
        slug: slug,
        state: '',
        country: 'India',
        featured: true,
        coordinates: { lat: 0, lng: 0 }
      }));
      
      console.log('Header cities loaded from database:', this.cities);
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Prevent body scroll when mobile menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
  
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }
  
  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s+/g, '-');
  }
  
  private getDisplayName(slug: string): string {
    const names: { [key: string]: string } = {
      'virtual-office': 'Virtual Office',
      'coworking': 'Coworking',
      'coworking-space': 'Coworking Space',
      'private-office': 'Private Office',
      'meeting-room': 'Meeting Room',
      'business-lounge': 'Business Lounge'
    };
    return names[slug] || slug.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  }
  
  private getCategoryDescription(slug: string): string {
    const descriptions: { [key: string]: string } = {
      'virtual-office': 'Professional business address with GST registration',
      'coworking': 'Shared workspace with flexible seating',
      'coworking-space': 'Shared workspace with flexible seating',
      'private-office': 'Dedicated private workspace',
      'meeting-room': 'Professional meeting and conference rooms',
      'business-lounge': 'Executive lounge with premium amenities'
    };
    return descriptions[slug] || 'Premium workspace solution';
  }
  
  private getCategoryIcon(slug: string): string {
    const icons: { [key: string]: string } = {
      'virtual-office': '🏢',
      'coworking': '👥',
      'coworking-space': '👥',
      'private-office': '🏠',
      'meeting-room': '🤝',
      'business-lounge': '💼'
    };
    return icons[slug] || '📍';
  }
  
  private getCityDisplayName(slug: string): string {
    // Convert slug to proper city name (delhi -> Delhi, new-delhi -> New Delhi)
    return slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}
