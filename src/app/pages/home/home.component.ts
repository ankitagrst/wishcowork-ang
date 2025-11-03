import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { SeoService } from '../../services/seo.service';
import { Property, Category, City } from '../../models/property.model';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PropertyCardComponent, ContactFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredProperties: Property[] = [];
  categories: Category[] = [];
  cities: City[] = [];
  searchQuery = '';

  constructor(
    private propertyService: PropertyService,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'WishCowork - Premium Workspace Solutions | Virtual Office, Coworking, Meeting Rooms',
      description: 'Find your perfect workspace in India. Premium virtual offices, coworking spaces, private offices, and meeting rooms across Delhi, Mumbai, Bangalore, and more.',
      keywords: 'coworking space, virtual office, private office, meeting room, workspace, Delhi, Mumbai, Bangalore'
    });

    this.loadData();
  }

  private loadData() {
    this.propertyService.getFeaturedProperties().subscribe(properties => {
      // Show only first 3 featured properties on homepage
      this.featuredProperties = properties.slice(0, 3);
    });

    this.propertyService.getCategories().subscribe(categories => {
      this.categories = categories.filter(c => c.featured);
    });

    this.propertyService.getCities().subscribe(cities => {
      this.cities = cities.filter(c => c.featured);
    });
  }

  onSearch() {
    // Implement search functionality
    // Searching for: this.searchQuery
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-avatar.svg';
  }
}
