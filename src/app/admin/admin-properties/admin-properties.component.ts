import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-properties',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-properties.component.html',
  styleUrls: ['./admin-properties.component.scss']
})
export class AdminPropertiesComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  searchTerm: string = '';
  filterCategory: string = 'all';
  filterCity: string = 'all';

  categories: string[] = ['All'];
  cities: string[] = ['All'];

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.propertyService.getAllProperties().subscribe(properties => {
      this.properties = properties;
      this.filteredProperties = properties;
      
      // Dynamically populate categories from actual data
      const uniqueCategories = [...new Set(properties.map(p => p.category))];
      this.categories = ['All', ...uniqueCategories];
      
      // Dynamically populate cities from actual data
      const uniqueCities = [...new Set(properties.map(p => p.city))];
      this.cities = ['All', ...uniqueCities];
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.applyFilters();
  }

  onFilterCategory(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterCategory = target.value;
    this.applyFilters();
  }

  onFilterCity(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterCity = target.value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(this.searchTerm) ||
                           property.address.toLowerCase().includes(this.searchTerm);
      const matchesCategory = this.filterCategory.toLowerCase() === 'all' || 
                             property.category.toLowerCase() === this.filterCategory.toLowerCase();
      const matchesCity = this.filterCity.toLowerCase() === 'all' || 
                         property.city.toLowerCase() === this.filterCity.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesCity;
    });
  }

  editProperty(id: string): void {
    this.router.navigate(['/admin/properties/edit', id]);
  }

  deleteProperty(id: string, title: string): void {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      this.propertyService.deleteProperty(id).subscribe({
        next: () => {
          alert('Property deleted successfully!');
          // Refresh the properties list
          this.loadProperties();
        },
        error: (error) => {
          console.error('Error deleting property:', error);
          alert('Failed to delete property. Please try again.');
        }
      });
    }
  }

  togglePropertyStatus(property: Property): void {
    alert(`Toggle status feature coming soon! Property: ${property.title}`);
    // In a real app: property.availability = property.availability === 'available' ? 'unavailable' : 'available'
  }

  viewProperty(property: Property): void {
    const url = this.propertyService.getPropertyUrl(property);
    this.router.navigate([url]);
  }

  addNewProperty(): void {
    this.router.navigate(['/admin/properties/new']);
  }

  logout(): void {
    this.authService.logout();
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
