export interface Property {
  id: string;
  title: string;
  slug: string; // SEO-friendly URL slug
  category: string;
  city: string;
  address: string;
  price: number;
  priceType: 'hourly' | 'daily' | 'monthly';
  amenities: string[];
  photos: string[];
  description: string;
  featured: boolean;
  availability: 'available' | 'busy' | 'unavailable';
  rating: number;
  reviews: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  // Optional pricing fields
  includeServiceFee?: boolean; // Whether to show service fee in breakdown
  includeTax?: boolean; // Whether to show tax in breakdown
  serviceFeePercent?: number; // Service fee percentage (default: 10)
  taxPercent?: number; // Tax percentage (default: 18 for GST)
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  featured: boolean;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  country: string;
  featured: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  requirements?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}