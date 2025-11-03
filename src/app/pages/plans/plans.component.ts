import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../../services/settings.service';

interface Plan {
  id?: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  isPopular: boolean;
  features: string[];
  category: 'coworking' | 'private' | 'virtual' | 'meeting';
  displayOrder?: number;
  isActive?: boolean;
}

interface AdditionalService {
  id?: number;
  name: string;
  price: number;
  unit: string;
  description: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface FAQ {
  id?: number;
  question: string;
  answer: string;
  displayOrder?: number;
  isActive?: boolean;
}

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Flexible Workspace Plans & Pricing
          </h1>
          <p class="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8">
            Simple, transparent pricing for every business need. From day passes to private offices, 
            find the perfect workspace solution at WishCowork with no hidden fees.
          </p>
          
          <!-- Plan Categories Filter -->
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <button 
              *ngFor="let category of categories" 
              (click)="selectedCategory = category.value"
              [class]="selectedCategory === category.value ? 
                'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              class="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 border text-sm sm:text-base touch-manipulation active:scale-95"
            >
              {{ category.label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Plans Grid -->
    <section class="py-12 sm:py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-gray-600">Loading plans...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="text-center py-12">
          <p class="text-red-600">{{ error }}</p>
        </div>

        <!-- Plans Grid -->
        <div *ngIf="!loading && !error" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <div 
            *ngFor="let plan of filteredPlans" 
            class="relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group"
            [class.ring-4]="plan.isPopular"
            [class.ring-primary-500]="plan.isPopular"
          >
            <!-- Popular Badge -->
            <div 
              *ngIf="plan.isPopular" 
              class="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-bl-xl sm:rounded-bl-2xl text-xs sm:text-sm font-bold"
            >
              MOST POPULAR
            </div>

            <!-- Plan Header -->
            <div class="p-4 sm:p-6 md:p-8 pb-0">
              <div [class]="'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 ' + getCategoryColor(plan.category)">
                <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="plan.category === 'coworking'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  <path *ngIf="plan.category === 'private'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  <path *ngIf="plan.category === 'virtual'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  <path *ngIf="plan.category === 'meeting'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                </svg>
              </div>
              
              <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{{ plan.name }}</h3>
              <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{{ plan.description }}</p>
              
              <div class="mb-4 sm:mb-6">
                <span class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">₹{{ plan.price | number }}</span>
                <span class="text-sm sm:text-base text-gray-600">/{{ plan.unit }}</span>
              </div>
            </div>

            <!-- Features List -->
            <div class="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
              <ul class="space-y-2 sm:space-y-3">
                <li *ngFor="let feature of plan.features" class="flex items-start space-x-2 sm:space-x-3">
                  <div class="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <span class="text-xs sm:text-sm text-gray-700">{{ feature }}</span>
                </li>
              </ul>
              
              <!-- CTA Button -->
              <button 
                routerLink="/contact"
                class="w-full mt-6 sm:mt-8 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 active:scale-95 shadow-lg text-sm sm:text-base touch-manipulation"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Additional Services Section -->
    <section class="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Additional Services & Add-ons</h2>
          <p class="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Enhance your workspace experience with our premium add-on services and flexible options.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div *ngFor="let service of additionalServices" class="text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">{{ service.name }}</h3>
            <div class="text-2xl sm:text-3xl font-bold text-primary-600 mb-3 sm:mb-4">
              ₹{{ service.price | number }}<span class="text-sm sm:text-base text-gray-600">/{{ service.unit }}</span>
            </div>
            <p class="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">{{ service.description }}</p>
            <button routerLink="/contact" class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base touch-manipulation active:scale-95">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-12 sm:py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8 sm:mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Frequently Asked Questions</h2>
          <p class="text-sm sm:text-base text-gray-600">Get answers to common questions about our workspace plans.</p>
        </div>
        
        <div class="space-y-4 sm:space-y-6">
          <div *ngFor="let faq of faqs" class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
            <h4 class="font-semibold text-sm sm:text-base text-gray-900 mb-2">{{ faq.question }}</h4>
            <p class="text-xs sm:text-sm text-gray-600">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="py-12 sm:py-16 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Need a Custom Plan?</h2>
        <p class="text-sm sm:text-base md:text-lg text-primary-100 mb-6 sm:mb-8">
          Contact our workspace experts to create a tailored solution for your business needs.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button routerLink="/contact" class="bg-white text-primary-600 hover:bg-gray-50 font-bold py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base touch-manipulation active:scale-95">
            Contact Sales
          </button>
          <button routerLink="/contact" class="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base touch-manipulation active:scale-95">
            Schedule Tour
          </button>
        </div>
      </div>
    </section>
  `
})
export class PlansComponent implements OnInit {
  selectedCategory: string = 'all';
  plans: Plan[] = [];
  additionalServices: AdditionalService[] = [];
  faqs: FAQ[] = [];
  loading: boolean = true;
  error: string | null = null;

  private get apiUrl(): string {
    return this.settingsService.getApiUrl();
  }

  categories = [
    { label: 'All Plans', value: 'all' },
    { label: 'Coworking', value: 'coworking' },
    { label: 'Private Office', value: 'private' },
    { label: 'Virtual Office', value: 'virtual' },
    { label: 'Meeting Rooms', value: 'meeting' }
  ];

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.loadPlans();
    this.loadServices();
    this.loadFaqs();
  }

  loadPlans() {
    this.http.get<Plan[]>(`${this.apiUrl}/pricing/plans`)
      .subscribe({
        next: (data) => {
          this.plans = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading plans:', err);
          this.error = 'Failed to load plans';
          this.loading = false;
        }
      });
  }

  loadServices() {
    this.http.get<AdditionalService[]>(`${this.apiUrl}/pricing/services`)
      .subscribe({
        next: (data) => {
          this.additionalServices = data;
        },
        error: (err) => {
          console.error('Error loading services:', err);
        }
      });
  }

  loadFaqs() {
    this.http.get<FAQ[]>(`${this.apiUrl}/pricing/faqs`)
      .subscribe({
        next: (data) => {
          this.faqs = data;
        },
        error: (err) => {
          console.error('Error loading FAQs:', err);
        }
      });
  }

  get filteredPlans() {
    if (this.selectedCategory === 'all') {
      return this.plans;
    }
    return this.plans.filter(plan => plan.category === this.selectedCategory);
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'coworking': 'bg-green-500',
      'private': 'bg-blue-500',
      'virtual': 'bg-purple-500',
      'meeting': 'bg-orange-500'
    };
    return colors[category] || 'bg-gray-500';
  }
}
