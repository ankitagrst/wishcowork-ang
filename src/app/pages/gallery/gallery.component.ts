import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  location: string;
  title: string;
  description: string;
}

interface Location {
  name: string;
  city: string;
  slug: string;
  featured: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 pt-24 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Explore Our Premium Workspaces
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Take a virtual tour of our thoughtfully designed coworking spaces, private offices, 
          and meeting rooms across India's major cities.
        </p>
        
        <!-- Filter Buttons -->
        <div class="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            *ngFor="let category of categories" 
            (click)="selectedCategory = category.value"
            [class]="selectedCategory === category.value ? 
              'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
            class="px-6 py-3 rounded-xl font-medium transition-all duration-200 border shadow-sm"
          >
            {{ category.label }}
          </button>
        </div>

        <!-- Location Filter -->
        <div class="flex flex-wrap justify-center gap-3">
          <button 
            *ngFor="let location of locations" 
            (click)="selectedLocation = location.slug"
            [class]="selectedLocation === location.slug ? 
              'bg-primary-100 text-primary-800 border-primary-300' : 'bg-white text-gray-600 hover:bg-gray-50'"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
          >
            {{ location.name }}, {{ location.city }}
          </button>
        </div>
      </div>
    </section>

    <!-- Gallery Grid -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            *ngFor="let image of getFilteredImages(); trackBy: trackByImageId" 
            class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            (click)="openModal(image)"
          >
            <div class="aspect-square overflow-hidden">
              <img 
                [src]="image.src" 
                [alt]="image.alt"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 class="font-semibold text-lg mb-1">{{ image.title }}</h3>
                <p class="text-sm text-gray-200 mb-2">{{ image.location }}</p>
                <p class="text-xs text-gray-300">{{ image.description }}</p>
              </div>
            </div>

            <!-- Category Badge -->
            <div class="absolute top-3 left-3">
              <span 
                [class]="getCategoryColor(image.category)"
                class="px-3 py-1 rounded-full text-xs font-medium text-white"
              >
                {{ getCategoryLabel(image.category) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="text-center mt-12" *ngIf="hasMoreImages">
          <button 
            (click)="loadMoreImages()"
            class="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Load More Images
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Locations -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Featured Locations</h2>
          <p class="text-lg text-gray-600">
            Discover our premium workspace locations across India
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let location of getFeaturedLocations()" 
            class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer"
            (click)="selectedLocation = location.slug; scrollToGallery()"
          >
            <div class="aspect-video overflow-hidden">
              <img 
                [src]="getLocationImage(location.slug)" 
                [alt]="location.name + ' Location'"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ location.name }}</h3>
              <p class="text-gray-600 mb-4">{{ location.city }}</p>
              <div class="flex items-center text-primary-600 font-medium">
                <span>View Gallery</span>
                <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Virtual Tour CTA -->
    <section class="py-16 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white mb-4">Want to See More?</h2>
        <p class="text-primary-100 mb-8 text-lg">
          Schedule a virtual or in-person tour to experience our workspaces firsthand.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button routerLink="/contact" class="bg-white text-primary-600 hover:bg-gray-50 font-bold py-3 px-8 rounded-xl transition-all duration-300">
            Schedule a Tour
          </button>
          <button routerLink="/plans" class="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-3 px-8 rounded-xl transition-all duration-300">
            View Our Plans
          </button>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <div 
      *ngIf="selectedImage" 
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      (click)="closeModal()"
    >
      <div class="relative max-w-4xl max-h-full" (click)="$event.stopPropagation()">
        <img 
          [src]="selectedImage.src" 
          [alt]="selectedImage.alt"
          class="max-w-full max-h-full object-contain rounded-lg"
        />
        
        <!-- Close Button -->
        <button 
          (click)="closeModal()"
          class="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Image Info -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-6 rounded-b-lg">
          <h3 class="text-xl font-bold mb-2">{{ selectedImage.title }}</h3>
          <p class="text-gray-200 mb-1">{{ selectedImage.location }}</p>
          <p class="text-gray-300 text-sm">{{ selectedImage.description }}</p>
        </div>

        <!-- Navigation Arrows -->
        <button 
          *ngIf="canNavigatePrevious()"
          (click)="navigateImage(-1)"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <button 
          *ngIf="canNavigateNext()"
          (click)="navigateImage(1)"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class GalleryComponent {
  selectedCategory: string = 'all';
  selectedLocation: string = 'all';
  selectedImage: GalleryImage | null = null;
  currentImageIndex: number = 0;
  displayedImagesCount: number = 16;
  hasMoreImages: boolean = true;

  categories = [
    { label: 'All Spaces', value: 'all' },
    { label: 'Coworking Areas', value: 'coworking' },
    { label: 'Private Offices', value: 'private-office' },
    { label: 'Meeting Rooms', value: 'meeting-room' },
    { label: 'Common Areas', value: 'common-area' },
    { label: 'Reception & Lobby', value: 'reception' }
  ];

  locations: Location[] = [
    { name: 'All Locations', city: '', slug: 'all', featured: false },
    { name: 'Connaught Place', city: 'Delhi', slug: 'cp-delhi', featured: true },
    { name: 'Cyber City', city: 'Gurgaon', slug: 'cyber-city-gurgaon', featured: true },
    { name: 'Bandra Kurla', city: 'Mumbai', slug: 'bkc-mumbai', featured: true },
    { name: 'Koramangala', city: 'Bangalore', slug: 'koramangala-bangalore', featured: true },
    { name: 'Hinjewadi', city: 'Pune', slug: 'hinjewadi-pune', featured: false },
    { name: 'Anna Salai', city: 'Chennai', slug: 'anna-salai-chennai', featured: false },
    { name: 'HITEC City', city: 'Hyderabad', slug: 'hitec-city-hyderabad', featured: false },
    { name: 'Jan Path', city: 'Jaipur', slug: 'jan-path-jaipur', featured: true }
  ];

  galleryImages: GalleryImage[] = [
    // Coworking Areas
    {
      id: '1',
      src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&q=80',
      alt: 'Modern Coworking Space',
      category: 'coworking',
      location: 'Connaught Place, Delhi',
      title: 'Open Coworking Area',
      description: 'Spacious open-plan workspace with modern furniture and natural lighting'
    },
    {
      id: '2',
      src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=400&fit=crop&q=80',
      alt: 'Collaborative Workspace',
      category: 'coworking',
      location: 'Cyber City, Gurgaon',
      title: 'Collaborative Zone',
      description: 'Designed for teamwork and creative collaboration'
    },
    {
      id: '3',
      src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop&q=80',
      alt: 'Hot Desk Area',
      category: 'coworking',
      location: 'Bandra Kurla, Mumbai',
      title: 'Hot Desk Section',
      description: 'Flexible seating arrangement for hot desk members'
    },
    {
      id: '4',
      src: 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=400&fit=crop&q=80',
      alt: 'Focused Work Area',
      category: 'coworking',
      location: 'Koramangala, Bangalore',
      title: 'Quiet Work Zone',
      description: 'Dedicated area for focused individual work'
    },

    // Private Offices
    {
      id: '5',
      src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop&q=80',
      alt: 'Executive Private Office',
      category: 'private-office',
      location: 'Connaught Place, Delhi',
      title: 'Executive Suite',
      description: 'Premium private office with executive amenities'
    },
    {
      id: '6',
      src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80',
      alt: 'Team Private Office',
      category: 'private-office',
      location: 'Cyber City, Gurgaon',
      title: 'Team Office',
      description: 'Spacious private office for teams of 5-8 people'
    },
    {
      id: '7',
      src: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400&h=400&fit=crop&q=80',
      alt: 'Startup Private Office',
      category: 'private-office',
      location: 'Bandra Kurla, Mumbai',
      title: 'Startup Suite',
      description: 'Perfect for growing startups and small teams'
    },
    {
      id: '8',
      src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&q=80',
      alt: 'Corporate Private Office',
      category: 'private-office',
      location: 'Koramangala, Bangalore',
      title: 'Corporate Office',
      description: 'Professional setup for established businesses'
    },

    // Meeting Rooms
    {
      id: '9',
      src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&q=80',
      alt: 'Board Room',
      category: 'meeting-room',
      location: 'Connaught Place, Delhi',
      title: 'Executive Boardroom',
      description: 'Elegant boardroom for high-level meetings'
    },
    {
      id: '10',
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&q=80',
      alt: 'Conference Room',
      category: 'meeting-room',
      location: 'Cyber City, Gurgaon',
      title: 'Conference Hall',
      description: 'Large conference room with advanced AV equipment'
    },
    {
      id: '11',
      src: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&h=400&fit=crop&q=80',
      alt: 'Small Meeting Room',
      category: 'meeting-room',
      location: 'Bandra Kurla, Mumbai',
      title: 'Huddle Room',
      description: 'Intimate meeting space for small team discussions'
    },
    {
      id: '12',
      src: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=400&fit=crop&q=80',
      alt: 'Video Call Room',
      category: 'meeting-room',
      location: 'Koramangala, Bangalore',
      title: 'Video Conference Room',
      description: 'Equipped with professional video conferencing setup'
    },

    // Common Areas
    {
      id: '13',
      src: 'https://images.unsplash.com/photo-1586888451013-d5f9dffbcf43?w=400&h=400&fit=crop&q=80',
      alt: 'Lounge Area',
      category: 'common-area',
      location: 'Connaught Place, Delhi',
      title: 'Executive Lounge',
      description: 'Comfortable lounge area for relaxation and informal meetings'
    },
    {
      id: '14',
      src: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop&q=80',
      alt: 'Coffee Bar',
      category: 'common-area',
      location: 'Cyber City, Gurgaon',
      title: 'Coffee Station',
      description: 'Premium coffee bar with barista service'
    },
    {
      id: '15',
      src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80',
      alt: 'Break Area',
      category: 'common-area',
      location: 'Bandra Kurla, Mumbai',
      title: 'Recreation Zone',
      description: 'Fun break area with games and comfortable seating'
    },
    {
      id: '16',
      src: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400&h=400&fit=crop&q=80',
      alt: 'Kitchen Area',
      category: 'common-area',
      location: 'Koramangala, Bangalore',
      title: 'Community Kitchen',
      description: 'Fully equipped kitchen for member use'
    },

    // Reception Areas
    {
      id: '17',
      src: 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=400&h=400&fit=crop&q=80',
      alt: 'Modern Reception',
      category: 'reception',
      location: 'Connaught Place, Delhi',
      title: 'Main Reception',
      description: 'Welcoming reception area with professional staff'
    },
    {
      id: '18',
      src: 'https://images.unsplash.com/photo-1586889505897-4d9b3e8b0c70?w=400&h=400&fit=crop&q=80',
      alt: 'Lobby Area',
      category: 'reception',
      location: 'Cyber City, Gurgaon',
      title: 'Grand Lobby',
      description: 'Impressive lobby with modern design elements'
    },
    {
      id: '19',
      src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80',
      alt: 'Waiting Area',
      category: 'reception',
      location: 'Bandra Kurla, Mumbai',
      title: 'Guest Lounge',
      description: 'Comfortable waiting area for visitors'
    },
    {
      id: '20',
      src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&q=80',
      alt: 'Entrance Hall',
      category: 'reception',
      location: 'Koramangala, Bangalore',
      title: 'Main Entrance',
      description: 'Stylish entrance with brand elements'
    }
  ];

  getFilteredImages(): GalleryImage[] {
    let filtered = this.galleryImages;
    
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === this.selectedCategory);
    }
    
    if (this.selectedLocation !== 'all') {
      const location = this.locations.find(loc => loc.slug === this.selectedLocation);
      if (location) {
        filtered = filtered.filter(img => img.location.includes(location.name));
      }
    }
    
    this.hasMoreImages = filtered.length > this.displayedImagesCount;
    return filtered.slice(0, this.displayedImagesCount);
  }

  getFeaturedLocations(): Location[] {
    return this.locations.filter(loc => loc.featured);
  }

  getLocationImage(slug: string): string {
    const imageMap: { [key: string]: string } = {
      'cp-delhi': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80',
      'cyber-city-gurgaon': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop&q=80',
      'bkc-mumbai': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop&q=80',
      'koramangala-bangalore': 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=300&fit=crop&q=80',
      'jan-path-jaipur': 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop&q=80'
    };
    return imageMap[slug] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80';
  }

  getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      'coworking': 'bg-green-500',
      'private-office': 'bg-blue-500',
      'meeting-room': 'bg-purple-500',
      'common-area': 'bg-orange-500',
      'reception': 'bg-red-500'
    };
    return colorMap[category] || 'bg-gray-500';
  }

  getCategoryLabel(category: string): string {
    const labelMap: { [key: string]: string } = {
      'coworking': 'Coworking',
      'private-office': 'Private Office',
      'meeting-room': 'Meeting Room',
      'common-area': 'Common Area',
      'reception': 'Reception'
    };
    return labelMap[category] || category;
  }

  trackByImageId(index: number, image: GalleryImage): string {
    return image.id;
  }

  loadMoreImages(): void {
    this.displayedImagesCount += 16;
    const filtered = this.getFilteredImages();
    this.hasMoreImages = filtered.length > this.displayedImagesCount;
  }

  openModal(image: GalleryImage): void {
    this.selectedImage = image;
    const filtered = this.getFilteredImages();
    this.currentImageIndex = filtered.findIndex(img => img.id === image.id);
  }

  closeModal(): void {
    this.selectedImage = null;
  }

  canNavigatePrevious(): boolean {
    return this.currentImageIndex > 0;
  }

  canNavigateNext(): boolean {
    const filtered = this.getFilteredImages();
    return this.currentImageIndex < filtered.length - 1;
  }

  navigateImage(direction: number): void {
    const filtered = this.getFilteredImages();
    const newIndex = this.currentImageIndex + direction;
    
    if (newIndex >= 0 && newIndex < filtered.length) {
      this.currentImageIndex = newIndex;
      this.selectedImage = filtered[newIndex];
    }
  }

  scrollToGallery(): void {
    // Scroll to gallery section after location selection
    setTimeout(() => {
      const element = document.querySelector('.py-16.bg-white');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
}