import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { SettingsService } from '../../services/settings.service';
import { LocomotiveScrollService } from '../../services/locomotive-scroll.service';
import { Subscription } from 'rxjs';
import { Category, City } from '../../models/property.model';

@Component({
    selector: 'app-header',
    imports: [CommonModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  cities: City[] = [];
  isMobileMenuOpen = false;
  scrollProgress = 0; // percentage 0..100
  private scrollSubscription?: Subscription;

  appName = '';

  constructor(private propertyService: PropertyService, private locoService: LocomotiveScrollService, private settings: SettingsService) {
    this.appName = this.settings.getAppName();
  }

  ngOnInit() {
    // Load categories dynamically from actual database properties
    this.loadCategoriesFromDatabase();
    
    // Load cities dynamically from actual database properties
    this.loadCitiesFromDatabase();

    // subscribe to global scroll progress, if locomotive scroll is active
    this.scrollSubscription = this.locoService.scrollProgress$.subscribe(p => {
      // convert to percentage
      this.scrollProgress = Math.round((p || 0) * 100);
    });
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
      
      // console.log('Header categories loaded from database:', this.categories);
    });
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
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
      
      // console.log('Header cities loaded from database:', this.cities);
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

  /**
   * Handle logo image load error and fallback to gradient background
   */
  onLogoError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    // Hide the failed image
    imgElement.style.display = 'none';
    
    // Add fallback brand background to parent
    const logoContainer = imgElement.parentElement;
    if (logoContainer) {
      logoContainer.classList.add('bg-accent');
      logoContainer.classList.remove('bg-white', 'border', 'border-gray-200');
      
      // Add fallback text
      const fallbackSpan = document.createElement('span');
      fallbackSpan.className = 'text-black font-bold text-lg sm:text-xl';
      fallbackSpan.textContent = 'W';
      logoContainer.appendChild(fallbackSpan);
      
      // console.warn('Logo image failed to load, using fallback gradient');
    }
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
