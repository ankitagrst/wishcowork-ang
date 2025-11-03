import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private titleService: Title,
    private metaService: Meta
  ) { }

  updateTitle(title: string) {
    this.titleService.setTitle(title);
  }

  updateMetaTags(config: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
  }) {
    if (config.title) {
      this.titleService.setTitle(config.title);
      this.metaService.updateTag({ property: 'og:title', content: config.title });
      this.metaService.updateTag({ name: 'twitter:title', content: config.title });
    }

    if (config.description) {
      this.metaService.updateTag({ name: 'description', content: config.description });
      this.metaService.updateTag({ property: 'og:description', content: config.description });
      this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    }

    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
      this.metaService.updateTag({ name: 'twitter:image', content: config.image });
    }

    if (config.url) {
      this.metaService.updateTag({ property: 'og:url', content: config.url });
    }

    // Set common meta tags
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  generateCategoryPageMeta(category: string, city: string) {
    const categoryNames: { [key: string]: string } = {
      'virtual-office': 'Virtual Office',
      'coworking': 'Coworking Space',
      'private-office': 'Private Office',
      'meeting-room': 'Meeting Room'
    };

    const categoryName = categoryNames[category] || category;
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);

    return {
      title: `${categoryName} in ${cityName} - Premium Workspace Solutions`,
      description: `Find the best ${categoryName.toLowerCase()} in ${cityName}. Professional workspace solutions with modern amenities, flexible terms, and prime locations.`,
      keywords: `${categoryName}, ${cityName}, workspace, office space, coworking, ${category}, ${city}`
    };
  }

  generatePropertyPageMeta(property: any) {
    return {
      title: `${property.title} - Book Now`,
      description: `${property.description} Located in ${property.address}. Starting from ₹${property.price}/${property.priceType}.`,
      keywords: `${property.title}, ${property.city}, ${property.category}, office space, workspace`
    };
  }
}