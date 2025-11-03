import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingsService } from './settings.service';

export interface Plan {
  id?: number;
  name: string;
  description: string;
  category: 'coworking' | 'private' | 'virtual' | 'meeting';
  price: number;
  unit: string;
  features: string[];
  isPopular: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface AdditionalService {
  id?: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FAQ {
  id?: number;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  
  private get apiUrl(): string {
    return this.settingsService.getApiUrl();
  }

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  // Plans CRUD
  getPlans(includeInactive = false): Observable<Plan[]> {
    const url = `${this.apiUrl}/pricing/plans?active=${!includeInactive}`;
    return this.http.get<Plan[]>(url);
  }

  createPlan(plan: Plan): Observable<any> {
    return this.http.post(`${this.apiUrl}/pricing/plans`, plan);
  }

  updatePlan(plan: Plan): Observable<any> {
    return this.http.put(`${this.apiUrl}/pricing/plans`, plan);
  }

  deletePlan(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pricing/plans?id=${id}`);
  }

  // Services CRUD
  getServices(includeInactive = false): Observable<AdditionalService[]> {
    const url = `${this.apiUrl}/pricing/services?active=${!includeInactive}`;
    return this.http.get<AdditionalService[]>(url);
  }

  createService(service: AdditionalService): Observable<any> {
    return this.http.post(`${this.apiUrl}/pricing/services`, service);
  }

  updateService(service: AdditionalService): Observable<any> {
    return this.http.put(`${this.apiUrl}/pricing/services`, service);
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pricing/services?id=${id}`);
  }

  // FAQs CRUD
  getFaqs(includeInactive = false): Observable<FAQ[]> {
    const url = `${this.apiUrl}/pricing/faqs?active=${!includeInactive}`;
    return this.http.get<FAQ[]>(url);
  }

  createFaq(faq: FAQ): Observable<any> {
    return this.http.post(`${this.apiUrl}/pricing/faqs`, faq);
  }

  updateFaq(faq: FAQ): Observable<any> {
    return this.http.put(`${this.apiUrl}/pricing/faqs`, faq);
  }

  deleteFaq(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pricing/faqs?id=${id}`);
  }
}
