import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PricingService, Plan, AdditionalService, FAQ } from '../../services/pricing.service';
import { AuthService } from '../../services/auth.service';
import { LocomotiveScrollService } from '../../services/locomotive-scroll.service';

@Component({
    selector: 'app-admin-pricing',
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-pricing.component.html',
    styleUrls: ['./admin-pricing.component.css']
})
export class AdminPricingComponent implements OnInit {
  activeTab: 'plans' | 'services' | 'faqs' = 'plans';
  
  // Plans
  plans: Plan[] = [];
  selectedPlan: Plan | null = null;
  showPlanModal = false;
  
  // Services
  services: AdditionalService[] = [];
  selectedService: AdditionalService | null = null;
  showServiceModal = false;
  
  // FAQs
  faqs: FAQ[] = [];
  selectedFaq: FAQ | null = null;
  showFaqModal = false;
  
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private pricingService: PricingService,
    private router: Router,
    private authService: AuthService,
    private locomotiveScrollService: LocomotiveScrollService
  ) {}

  ngOnInit() {
    this.loadPlans();
    this.loadServices();
    this.loadFaqs();
  }

  public currentScrollY = 0;
  private scrollY = 0;

  private toggleBodyScroll(lock: boolean): void {
    if (typeof document === 'undefined') return;
    
    if (lock) {
      // Get scroll position from Locomotive Service for positioning the modal
      this.currentScrollY = this.locomotiveScrollService.getScrollY();
      
      this.scrollY = window.scrollY || window.pageYOffset;
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      this.locomotiveScrollService.stop();
    } else {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      window.scrollTo(0, this.scrollY);
      this.locomotiveScrollService.start();
    }
  }

  closeModal() {
    this.showPlanModal = false;
    this.showServiceModal = false;
    this.showFaqModal = false;
    this.toggleBodyScroll(false);
  }

  // Plans Methods
  loadPlans() {
    this.loading = true;
    this.pricingService.getPlans(true).subscribe({
      next: (data) => {
        this.plans = data.sort((a, b) => a.displayOrder - b.displayOrder);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load plans';
        this.loading = false;
      }
    });
  }

  openPlanModal(plan?: Plan) {
    if (plan) {
      this.selectedPlan = { ...plan };
    } else {
      this.selectedPlan = {
        name: '',
        description: '',
        category: 'coworking',
        price: 0,
        unit: 'month',
        features: [],
        isPopular: false,
        displayOrder: this.plans.length + 1,
        isActive: true
      };
    }
    this.showPlanModal = true;
    this.toggleBodyScroll(true);
  }

  savePlan() {
    if (!this.selectedPlan) return;
    
    this.loading = true;
    const operation = this.selectedPlan.id 
      ? this.pricingService.updatePlan(this.selectedPlan)
      : this.pricingService.createPlan(this.selectedPlan);
    
    operation.subscribe({
      next: () => {
        this.success = `Plan ${this.selectedPlan!.id ? 'updated' : 'created'} successfully`;
        this.closeModal();
        this.loadPlans();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to save plan';
        this.loading = false;
      }
    });
  }

  deletePlan(id: number) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    this.loading = true;
    this.pricingService.deletePlan(id).subscribe({
      next: () => {
        this.success = 'Plan deleted successfully';
        this.loadPlans();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete plan';
        this.loading = false;
      }
    });
  }

  addFeature() {
    if (this.selectedPlan && !this.selectedPlan.features) {
      this.selectedPlan.features = [];
    }
    this.selectedPlan?.features.push('');
  }

  removeFeature(index: number): void {
    if (this.selectedPlan && this.selectedPlan.features) {
      this.selectedPlan.features.splice(index, 1);
    }
  }

  // Track function for ngFor
  trackFeature(index: number, feature: string): number {
    return index;
  }

  // Services Methods
  loadServices(): void {
    this.loading = true;
    this.pricingService.getServices(true).subscribe({
      next: (data) => {
        this.services = data.sort((a, b) => a.displayOrder - b.displayOrder);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load services';
        this.loading = false;
      }
    });
  }

  openServiceModal(service?: AdditionalService) {
    if (service) {
      this.selectedService = { ...service };
    } else {
      this.selectedService = {
        name: '',
        description: '',
        price: 0,
        unit: 'hour',
        icon: '',
        displayOrder: this.services.length + 1,
        isActive: true
      };
    }
    this.showServiceModal = true;
    this.toggleBodyScroll(true);
  }

  saveService() {
    if (!this.selectedService) return;
    
    this.loading = true;
    const operation = this.selectedService.id 
      ? this.pricingService.updateService(this.selectedService)
      : this.pricingService.createService(this.selectedService);
    
    operation.subscribe({
      next: () => {
        this.success = `Service ${this.selectedService!.id ? 'updated' : 'created'} successfully`;
        this.closeModal();
        this.loadServices();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to save service';
        this.loading = false;
      }
    });
  }

  deleteService(id: number) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    this.loading = true;
    this.pricingService.deleteService(id).subscribe({
      next: () => {
        this.success = 'Service deleted successfully';
        this.loadServices();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete service';
        this.loading = false;
      }
    });
  }

  // FAQs Methods
  loadFaqs() {
    this.loading = true;
    this.pricingService.getFaqs(true).subscribe({
      next: (data) => {
        this.faqs = data.sort((a, b) => a.displayOrder - b.displayOrder);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load FAQs';
        this.loading = false;
      }
    });
  }

  openFaqModal(faq?: FAQ) {
    if (faq) {
      this.selectedFaq = { ...faq };
    } else {
      this.selectedFaq = {
        question: '',
        answer: '',
        displayOrder: this.faqs.length + 1,
        isActive: true
      };
    }
    this.showFaqModal = true;
    this.toggleBodyScroll(true);
  }

  saveFaq() {
    if (!this.selectedFaq) return;
    
    this.loading = true;
    const operation = this.selectedFaq.id 
      ? this.pricingService.updateFaq(this.selectedFaq)
      : this.pricingService.createFaq(this.selectedFaq);
    
    operation.subscribe({
      next: () => {
        this.success = `FAQ ${this.selectedFaq!.id ? 'updated' : 'created'} successfully`;
        this.closeModal();
        this.loadFaqs();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to save FAQ';
        this.loading = false;
      }
    });
  }

  deleteFaq(id: number) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    this.loading = true;
    this.pricingService.deleteFaq(id).subscribe({
      next: () => {
        this.success = 'FAQ deleted successfully';
        this.loadFaqs();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete FAQ';
        this.loading = false;
      }
    });
  }

  // Navigation Methods
  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
