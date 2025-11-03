import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Property, Category, City, Booking } from '../models/property.model';
import { environment } from '@env';
import { SettingsService } from './settings.service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private propertiesSubject = new BehaviorSubject<Property[]>([]);
  properties$ = this.propertiesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Always load mock data initially (for SSR and initial page load)
    this.loadMockData();
    
    // Only try to load from API in browser after initial load
    if (isPlatformBrowser(this.platformId)) {
      const settings = this.settingsService.getSettings();
      if (!settings.useMockAPI) {
        this.getAllProperties().subscribe({
          next: (properties) => {
            if (properties && properties.length > 0) {
              this.propertiesSubject.next(properties);
            }
          },
          error: (err) => {
            console.error('Failed to load properties from API:', err);
            // Keep using mock data
          }
        });
      }
    }
  }

  private get apiUrl(): string {
    return this.settingsService.getApiUrl();
  }

  private get useMockAPI(): boolean {
    return this.settingsService.isUsingMockAPI();
  }

  private loadMockData() {
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Premium Virtual Office - Connaught Place',
        slug: 'premium-virtual-office-connaught-place',
        category: 'virtual-office',
        city: 'delhi',
        address: 'Connaught Place, New Delhi, Delhi 110001',
        price: 2999,
        priceType: 'monthly',
        amenities: ['GST Registration', 'Business Address', 'Mail Handling', 'Phone Support', 'Meeting Room Access'],
        photos: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://picsum.photos/800/600?random=1'
        ],
        description: 'Premium virtual office solution in the heart of Delhi with GST registration, business address, and comprehensive support services. Perfect for startups and established businesses looking for a prestigious address.',
        featured: true,
        availability: 'available',
        rating: 4.8,
        reviews: 156,
        coordinates: { lat: 28.6304, lng: 77.2177 }
      },
      {
        id: '2',
        title: 'Modern Coworking Space - Bandra',
        slug: 'modern-coworking-space-bandra',
        category: 'coworking',
        city: 'mumbai',
        address: 'Bandra West, Mumbai, Maharashtra 400050',
        price: 899,
        priceType: 'daily',
        amenities: ['High-Speed WiFi', 'Printing Services', 'Coffee', 'Meeting Rooms', '24/7 Access'],
        photos: [
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
          'https://picsum.photos/800/600?random=2'
        ],
        description: 'Vibrant coworking space in Bandra with modern amenities and a creative community of professionals. Features flexible seating, meeting rooms, and networking opportunities.',
        featured: true,
        availability: 'available',
        rating: 4.6,
        reviews: 243,
        coordinates: { lat: 19.0596, lng: 72.8295 }
      },
      {
        id: '3',
        title: 'Executive Private Office - Koramangala',
        slug: 'executive-private-office-koramangala',
        category: 'private-office',
        city: 'bangalore',
        address: 'Koramangala, Bangalore, Karnataka 560095',
        price: 25000,
        priceType: 'monthly',
        amenities: ['Dedicated Desk', 'Storage Cabinet', 'High-Speed Internet', 'Parking', 'Reception Services'],
        photos: [
          'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop',
          'https://picsum.photos/800/600?random=3'
        ],
        description: 'Fully furnished private office in Bangalore\'s tech hub with dedicated amenities and professional environment. Ideal for teams of 4-8 people with privacy and flexibility.',
        featured: false,
        availability: 'available',
        rating: 4.7,
        reviews: 89,
        coordinates: { lat: 12.9352, lng: 77.6245 }
      },
      {
        id: '4',
        title: 'Conference Room - Cyber City',
        slug: 'conference-room-cyber-city',
        category: 'meeting-room',
        city: 'gurgaon',
        address: 'Cyber City, Gurgaon, Haryana 122002',
        price: 1200,
        priceType: 'hourly',
        amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'Catering Service', 'AC'],
        photos: [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=600&fit=crop',
          'https://picsum.photos/800/600?random=4'
        ],
        description: 'Professional conference room equipped with latest technology for successful business meetings. Accommodates up to 12 people with state-of-the-art AV equipment.',
        featured: false,
        availability: 'available',
        rating: 4.5,
        reviews: 67,
        coordinates: { lat: 28.4595, lng: 77.0266 }
      },
      {
        id: '5',
        title: 'Luxury Coworking Hub - Powai',
        slug: 'luxury-coworking-hub-powai',
        category: 'coworking',
        city: 'mumbai',
        address: 'Powai, Mumbai, Maharashtra 400076',
        price: 1299,
        priceType: 'daily',
        amenities: ['Premium WiFi', '24/7 Access', 'Game Zone', 'Rooftop Cafe', 'Parking', 'Gym Access'],
        photos: [
          'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=800&h=600&fit=crop',
          'https://picsum.photos/800/600?random=5'
        ],
        description: 'Premium coworking space with luxury amenities in Mumbai\'s IT hub. Features modern design, recreational facilities, and excellent networking opportunities.',
        featured: true,
        availability: 'available',
        rating: 4.9,
        reviews: 312,
        coordinates: { lat: 19.1176, lng: 72.9060 }
      },
      {
        id: '6',
        title: 'Creative Studio Space - Indiranagar',
        slug: 'creative-studio-space-indiranagar',
        category: 'private-office',
        city: 'bangalore',
        address: 'Indiranagar, Bangalore, Karnataka 560038',
        price: 18000,
        priceType: 'monthly',
        amenities: ['Natural Light', 'High Ceilings', 'Creative Setup', 'Meeting Room', 'Terrace Access'],
        photos: [
          'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
          'https://picsum.photos/800/600?random=6'
        ],
        description: 'Inspiring private office space perfect for creative teams. Features abundant natural light, flexible layout, and artistic environment in trendy Indiranagar.',
        featured: true,
        availability: 'available',
        rating: 4.6,
        reviews: 127,
        coordinates: { lat: 12.9719, lng: 77.6412 }
      },
      {
        id: '7',
        title: 'Tech Startup Office - Sector 44',
        slug: 'tech-startup-office-sector-44',
        category: 'private-office',
        city: 'gurgaon',
        address: 'Sector 44, Gurgaon, Haryana 122003',
        price: 35000,
        priceType: 'monthly',
        amenities: ['IT Infrastructure', 'Server Room', 'Secure Access', 'Backup Power', 'Fiber Internet'],
        photos: [
          'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
          'https://picsum.photos/800/600?random=7'
        ],
        description: 'State-of-the-art private office designed for tech startups. Features dedicated IT infrastructure, server facilities, and high-security measures.',
        featured: false,
        availability: 'available',
        rating: 4.8,
        reviews: 94,
        coordinates: { lat: 28.4486, lng: 77.0647 }
      },
      {
        id: '8',
        title: 'Premium Meeting Suite - Vasant Kunj',
        slug: 'premium-meeting-suite-vasant-kunj',
        category: 'meeting-room',
        city: 'delhi',
        address: 'Vasant Kunj, New Delhi, Delhi 110070',
        price: 1800,
        priceType: 'hourly',
        amenities: ['Executive Setup', 'Premium AV', 'Catering', 'Valet Parking', 'Concierge'],
        photos: [
          'https://images.unsplash.com/photo-1565843708714-887b18ddedb6?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571717065521-874adb1c4ecf?w=800&h=600&fit=crop',
          'https://picsum.photos/800/600?random=8'
        ],
        description: 'Luxurious meeting suite for executive presentations and high-profile client meetings. Premium amenities and professional service included.',
        featured: false,
        availability: 'available',
        rating: 4.9,
        reviews: 73,
        coordinates: { lat: 28.5355, lng: 77.1580 }
      }
    ];

    this.propertiesSubject.next(mockProperties);
  }

  getCategories(): Observable<Category[]> {
    const categories: Category[] = [
      {
        id: '1',
        name: 'Virtual Office',
        slug: 'virtual-office',
        description: 'Professional business address with GST registration',
        icon: '🏢',
        featured: true
      },
      {
        id: '2',
        name: 'Coworking',
        slug: 'coworking',
        description: 'Shared workspace with flexible seating',
        icon: '👥',
        featured: true
      },
      {
        id: '3',
        name: 'Private Office',
        slug: 'private-office',
        description: 'Dedicated private workspace',
        icon: '🏠',
        featured: true
      },
      {
        id: '4',
        name: 'Meeting Room',
        slug: 'meeting-room',
        description: 'Professional meeting and conference rooms',
        icon: '🤝',
        featured: true
      }
    ];
    return of(categories);
  }

  getCities(): Observable<City[]> {
    const cities: City[] = [
      {
        id: '1',
        name: 'Delhi',
        slug: 'delhi',
        state: 'Delhi',
        country: 'India',
        featured: true,
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      {
        id: '2',
        name: 'Mumbai',
        slug: 'mumbai',
        state: 'Maharashtra',
        country: 'India',
        featured: true,
        coordinates: { lat: 19.0760, lng: 72.8777 }
      },
      {
        id: '3',
        name: 'Bangalore',
        slug: 'bangalore',
        state: 'Karnataka',
        country: 'India',
        featured: true,
        coordinates: { lat: 12.9716, lng: 77.5946 }
      },
      {
        id: '4',
        name: 'Gurgaon',
        slug: 'gurgaon',
        state: 'Haryana',
        country: 'India',
        featured: true,
        coordinates: { lat: 28.4595, lng: 77.0266 }
      }
    ];
    return of(cities);
  }

  getAllProperties(): Observable<Property[]> {
    if (this.useMockAPI) {
      return this.properties$;
    }
    
    return this.http.get<any>(`${this.apiUrl}/properties`).pipe(
      map(response => {
        // Handle both response formats: {data: [...]} or {properties: [...]}
        const properties = response.data || response.properties || [];
        return properties;
      }),
      tap(properties => this.propertiesSubject.next(properties)),
      catchError((error) => {
        console.error('Failed to load properties from API:', error);
        return this.properties$;
      })
    );
  }

  getPropertiesByCategory(category: string): Observable<Property[]> {
    if (this.useMockAPI) {
      const properties = this.propertiesSubject.value;
      return of(properties.filter(p => p.category === category));
    }
    
    const params = new HttpParams().set('category', category);
    return this.http.get<any>(`${this.apiUrl}/properties`, { params }).pipe(
      map(response => {
        const properties = response.data || response.properties || [];
        console.log('Category filter response:', { category, count: properties.length, properties });
        return properties;
      }),
      catchError((error) => {
        console.error('Error fetching properties by category:', error);
        return of([]);
      })
    );
  }

  getPropertiesByCity(city: string): Observable<Property[]> {
    if (this.useMockAPI) {
      const properties = this.propertiesSubject.value;
      return of(properties.filter(p => p.city === city));
    }
    
    const params = new HttpParams().set('city', city);
    return this.http.get<any>(`${this.apiUrl}/properties`, { params }).pipe(
      map(response => response.data || response.properties || []),
      catchError(() => of([]))
    );
  }

  getPropertiesByCategoryAndCity(category: string, city: string): Observable<Property[]> {
    if (this.useMockAPI) {
      const properties = this.propertiesSubject.value;
      return of(properties.filter(p => p.category === category && p.city === city));
    }
    
    const params = new HttpParams()
      .set('category', category)
      .set('city', city);
    return this.http.get<any>(`${this.apiUrl}/properties`, { params }).pipe(
      map(response => response.data || response.properties || []),
      catchError(() => of([]))
    );
  }

  getPropertyById(id: string): Observable<Property | undefined> {
    if (this.useMockAPI) {
      const properties = this.propertiesSubject.value;
      return of(properties.find(p => p.id === id));
    }
    
    const params = new HttpParams().set('id', id);
    return this.http.get<any>(`${this.apiUrl}/properties`, { params }).pipe(
      map(response => response.data || response.property),
      catchError(() => of(undefined))
    );
  }

  // Get property by SEO-friendly URL
  getPropertyByUrl(city: string, category: string, slug: string): Observable<Property | undefined> {
    if (this.useMockAPI) {
      const properties = this.propertiesSubject.value;
      return of(properties.find(p => 
        p.city.toLowerCase() === city.toLowerCase() && 
        p.category.toLowerCase() === category.toLowerCase() && 
        p.slug === slug
      ));
    }
    
    const params = new HttpParams()
      .set('slug', slug);
    return this.http.get<any>(`${this.apiUrl}/properties`, { params }).pipe(
      map(response => response.data || response.property),
      catchError(() => of(undefined))
    );
  }

  // Generate SEO-friendly URL for a property
  getPropertyUrl(property: Property): string {
    const city = property.city.toLowerCase().replace(/\s+/g, '-');
    const category = property.category.toLowerCase().replace(/\s+/g, '-');
    return `/${city}/${category}/${property.slug}`;
  }

  getFeaturedProperties(): Observable<Property[]> {
    if (this.useMockAPI) {
      const properties = this.propertiesSubject.value;
      return of(properties.filter(p => p.featured));
    }
    
    const params = new HttpParams().set('featured', 'true');
    return this.http.get<any>(`${this.apiUrl}/properties`, { params }).pipe(
      map(response => response.data || response.properties || []),
      catchError(() => of([]))
    );
  }

  searchProperties(query: string): Observable<Property[]> {
    if (this.useMockAPI) {
      const properties = this.propertiesSubject.value;
      const searchTerm = query.toLowerCase();
      return of(properties.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.city.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      ));
    }
    
    const params = new HttpParams().set('search', query);
    return this.http.get<any>(`${this.apiUrl}/properties`, { params }).pipe(
      map(response => response.data || response.properties || []),
      catchError(() => of([]))
    );
  }
  
  // Admin Methods
  createProperty(property: Partial<Property>): Observable<Property | null> {
    return this.http.post<any>(`${this.apiUrl}/properties`, property).pipe(
      map(response => {
        console.log('API Response:', response);
        // API returns: {success: true, message: string, propertyId: string}
        if (response.success && response.propertyId) {
          // Refresh properties list
          this.refreshProperties();
          // Return a property object with at least the ID
          return { id: response.propertyId, ...property } as Property;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Failed to create property:', error);
        return of(null);
      })
    );
  }
  
  updateProperty(id: string, property: Partial<Property>): Observable<boolean> {
    const params = new HttpParams().set('id', id);
    return this.http.put<any>(`${this.apiUrl}/properties`, property, { params }).pipe(
      map(response => {
        console.log('Update API Response:', response);
        // API returns: {success: true, message: string}
        if (response.success) {
          // Refresh properties list
          this.refreshProperties();
          return true;
        }
        return false;
      }),
      catchError((error) => {
        console.error('Failed to update property:', error);
        return of(false);
      })
    );
  }
  
  deleteProperty(id: string): Observable<boolean> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<any>(`${this.apiUrl}/properties`, { params }).pipe(
      map(response => {
        console.log('Delete API Response:', response);
        // API returns: {success: true, message: string}
        if (response.success) {
          // Refresh properties list
          this.refreshProperties();
          return true;
        }
        return false;
      }),
      catchError((error) => {
        console.error('Failed to delete property:', error);
        return of(false);
      })
    );
  }
  
  toggleAvailability(id: string, availability: 'available' | 'unavailable'): Observable<boolean> {
    return this.updateProperty(id, { availability });
  }
  
  private refreshProperties() {
    if (isPlatformBrowser(this.platformId)) {
      this.getAllProperties().subscribe({
        next: (properties) => this.propertiesSubject.next(properties),
        error: (err) => console.error('Failed to refresh properties:', err)
      });
    }
  }
}