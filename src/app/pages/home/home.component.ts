import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { PricingService, FAQ } from '../../services/pricing.service';
import { SeoService } from '../../services/seo.service';
import { SettingsService } from '../../services/settings.service';
import { Category, City, EnterpriseLogo } from '../../models/property.model';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-home',
    imports: [CommonModule, RouterModule, FormsModule, ContactFormComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  categories: Category[] = [];
  cities: City[] = [];
  faqs: FAQ[] = [];
  enterpriseLogos: EnterpriseLogo[] = [];
  searchQuery = '';
  suggestions: string[] = ['Mumbai', 'Bengaluru', 'Delhi', 'Gurgaon', 'Pune', 'Hyderabad', 'Chennai'];
  filteredSuggestions: string[] = [];
  highlightedSuggestionIndex: number = -1;
  expandedFAQ: number | null = null;
  loadingFAQs = false;
  showAllFAQs = false;
  maxFAQsToShow = 6;
  private destroy$ = new Subject<void>();

  // Hero search state
  heroTabs = [
    { key: 'long', label: 'Long-term Leasing' },
    { key: 'ondemand', label: 'On-demand' },
    { key: 'virtual', label: 'Virtual Office' }
  ];
  selectedHeroTab = 'long';

  heroCategories = [
    { key: 'coworking', label: 'Coworking Space' },
    { key: 'managed', label: 'Managed Office' },
    { key: 'office', label: 'Office/Commercial', comingSoonIn: 'Jaipur' }
  ];
  selectedHeroCategory = 'coworking';
  selectedCity = 'Jaipur';

  // Carousel state
  @ViewChild('carouselTrack') carouselTrack: ElementRef | undefined;
  @ViewChild('blogCarousel') blogCarouselTrack: ElementRef | undefined;
  @ViewChild('bookingCarousel') bookingCarouselTrack: ElementRef | undefined;
  @ViewChild('rentCarousel') rentCarouselTrack: ElementRef | undefined;
  currentSlide = 0;
  currentBlogSlide = 0;
  currentBookingSlide = 0;
  currentRentSlide = 0;
  cardsPerView = 3;

  constructor(
    private propertyService: PropertyService,
    private pricingService: PricingService,
    private seoService: SeoService,
    private settingsService: SettingsService,
    private router: Router
  ) {}

  ngOnInit() {
    const appName = this.settingsService.getAppName();
    this.seoService.updateMetaTags({
      title: `${appName} - Premium Workspace Solutions | Virtual Office, Coworking, Meeting Rooms`,
      description: 'Find your perfect workspace in India. Premium virtual offices, coworking spaces, private offices, and meeting rooms across major cities.',
      keywords: 'coworking space, virtual office, private office, meeting room, workspace'
    });

    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    if (this.carouselTrack) {
      const element = this.carouselTrack.nativeElement;
      element.addEventListener('scroll', () => {
        const scrollLeft = element.scrollLeft;
        const cardWidth = 400; // Approximate width
        this.currentSlide = Math.round(scrollLeft / cardWidth);
        if (this.currentSlide > 2) this.currentSlide = 2;
      });
    }

    // Setup blog carousel scroll listener
    if (this.blogCarouselTrack) {
      const element = this.blogCarouselTrack.nativeElement;
      element.addEventListener('scroll', () => {
        const scrollLeft = element.scrollLeft;
        const cardWidth = element.children[0]?.offsetWidth || 300;
        this.currentBlogSlide = Math.round(scrollLeft / (cardWidth + 24)); // 24px gap
        if (this.currentBlogSlide > 2) this.currentBlogSlide = 2;
      });
    }

    // Setup booking carousel scroll listener
    if (this.bookingCarouselTrack) {
      const element = this.bookingCarouselTrack.nativeElement;
      element.addEventListener('scroll', () => {
        const scrollLeft = element.scrollLeft;
        const cardWidth = element.children[0]?.offsetWidth || 300;
        this.currentBookingSlide = Math.round(scrollLeft / (cardWidth + 24)); // 24px gap
        if (this.currentBookingSlide > 3) this.currentBookingSlide = 3;
      });
    }

    // Setup rent carousel scroll listener
    if (this.rentCarouselTrack) {
      const element = this.rentCarouselTrack.nativeElement;
      element.addEventListener('scroll', () => {
        const scrollLeft = element.scrollLeft;
        const cardWidth = element.children[0]?.offsetWidth || 300;
        this.currentRentSlide = Math.round(scrollLeft / (cardWidth + 24)); // 24px gap
        if (this.currentRentSlide > 3) this.currentRentSlide = 3;
      });
    }
  }

  private loadData() {
    // Categories and Cities (featured only)
    this.propertyService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories.filter(c => c.featured);
        },
        error: (err) => console.error('Error loading categories:', err)
      });

    this.propertyService.getCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cities) => {
          this.cities = cities.filter(c => c.featured);
        },
        error: (err) => console.error('Error loading cities:', err)
      });

    // Load enterprise logos
    this.propertyService.getEnterpriseLogos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logos) => {
          this.enterpriseLogos = logos;
        },
        error: (err) => console.error('Error loading logos:', err)
      });

    // Load FAQs from admin
    this.loadFAQs();
  }

  /**
   * Load FAQs from the API
   */
  private loadFAQs(): void {
    this.loadingFAQs = true;
    this.pricingService.getFaqs(false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (faqs) => {
          // Sort by display order
          this.faqs = (faqs || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          this.loadingFAQs = false;
        },
        error: (error) => {
          console.error('Error loading FAQs:', error);
          this.faqs = [];
          this.loadingFAQs = false;
        }
      });
  }

  onSearch() {
    // Implement search functionality
    if (this.searchQuery.trim()) {
      // Navigate to properties page with search query
      this.router.navigate(['/properties'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }

  onSearchKeyup() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredSuggestions = [];
      this.highlightedSuggestionIndex = -1;
      return;
    }
    this.filteredSuggestions = this.suggestions.filter(item => item.toLowerCase().includes(q)).slice(0, 5);
    this.highlightedSuggestionIndex = -1;
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.filteredSuggestions = [];
    this.onSearch();
  }

  // Keyboard navigation for suggestions
  onSearchKeydown(e: KeyboardEvent) {
    if (!this.filteredSuggestions || this.filteredSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlightedSuggestionIndex = Math.min(this.highlightedSuggestionIndex + 1, this.filteredSuggestions.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlightedSuggestionIndex = Math.max(this.highlightedSuggestionIndex - 1, 0);
    } else if (e.key === 'Enter') {
      if (this.highlightedSuggestionIndex >= 0) {
        this.selectSuggestion(this.filteredSuggestions[this.highlightedSuggestionIndex]);
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      this.filteredSuggestions = [];
      this.highlightedSuggestionIndex = -1;
    }
  }

  /**
   * Navigate to category page
   */
  navigateToCategory(categorySlug: string): void {
    // Example: navigate to category listing
    console.log('Navigate to category:', categorySlug);
  }

  /**
   * Navigate to booking page
   */
  bookWorkspace(type: string): void {
    this.router.navigate(['/contact'], { queryParams: { interest: type } });
  }

  /**
   * Explore office spaces
   */
  exploreOfficeSpaces(): void {
    this.router.navigate(['/properties']);
  }

  /**
   * Contact support
   */
  contactSupport(): void {
    this.router.navigate(['/contact']);
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-avatar.svg';
  }

  /**
   * Toggle FAQ accordion
   */
  toggleFAQ(index: number): void {
    this.expandedFAQ = this.expandedFAQ === index ? null : index;
  }

  /**
   * Toggle showing all FAQs or just the first few
   */
  toggleShowAllFAQs(): void {
    this.showAllFAQs = !this.showAllFAQs;
    // Reset expanded FAQ when toggling
    this.expandedFAQ = null;
  }

  /**
   * Get the FAQs to display based on showAllFAQs state
   */
  get displayedFAQs(): FAQ[] {
    return this.showAllFAQs ? this.faqs : this.faqs.slice(0, this.maxFAQsToShow);
  }

  /**
   * Hero search interactions
   */
  selectHeroTab(key: string): void {
    this.selectedHeroTab = key;
  }

  onHeroTabKeydown(e: KeyboardEvent, idx: number) {
    const len = this.heroTabs.length;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1) % len;
      this.selectedHeroTab = this.heroTabs[next].key;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + len) % len;
      this.selectedHeroTab = this.heroTabs[prev].key;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.selectedHeroTab = this.heroTabs[idx].key;
    }
  }

  selectHeroCategory(key: string): void {
    this.selectedHeroCategory = key;
  }

  selectCity(city: string | undefined): void {
    if (city) this.selectedCity = city;
  }

  scrollCarousel(direction: 'left' | 'right'): void {
    if (!this.carouselTrack) return;
    
    const element = this.carouselTrack.nativeElement;
    const scrollAmount = 400; // Adjust based on card width + gap
    
    if (direction === 'left') {
      element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      this.currentSlide = Math.max(0, this.currentSlide - 1);
    } else {
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      this.currentSlide = Math.min(2, this.currentSlide + 1); // Max 3 slides for indicators
    }
  }

  goToSlide(slideIndex: number): void {
    if (!this.carouselTrack) return;
    
    const element = this.carouselTrack.nativeElement;
    const scrollAmount = slideIndex * 400;
    element.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    this.currentSlide = slideIndex;
  }

  goToBlogSlide(slideIndex: number): void {
    if (!this.blogCarouselTrack) return;
    
    const element = this.blogCarouselTrack.nativeElement;
    const cardWidth = element.children[0]?.offsetWidth || 300;
    const scrollAmount = slideIndex * (cardWidth + 24); // 24px gap
    element.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    this.currentBlogSlide = slideIndex;
  }

  goToBookingSlide(slideIndex: number): void {
    if (!this.bookingCarouselTrack) return;
    
    const element = this.bookingCarouselTrack.nativeElement;
    const cardWidth = element.children[0]?.offsetWidth || 300;
    const scrollAmount = slideIndex * (cardWidth + 24); // 24px gap
    element.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    this.currentBookingSlide = slideIndex;
  }

  goToRentSlide(slideIndex: number): void {
    if (!this.rentCarouselTrack) return;
    
    const element = this.rentCarouselTrack.nativeElement;
    const cardWidth = element.children[0]?.offsetWidth || 300;
    const scrollAmount = slideIndex * (cardWidth + 24); // 24px gap
    element.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    this.currentRentSlide = slideIndex;
  }

  searchFromHero(): void {
    const params: any = {};
    if (this.searchQuery && this.searchQuery.trim()) params.q = this.searchQuery.trim();
    if (this.selectedCity) params.city = this.selectedCity;
    if (this.selectedHeroCategory) params.category = this.selectedHeroCategory;
    if (this.selectedHeroTab) params.type = this.selectedHeroTab;

    this.router.navigate(['/properties'], { queryParams: params });
  }

  navigateToPricing(): void {
    this.router.navigate(['/pricing']);
  }
}
