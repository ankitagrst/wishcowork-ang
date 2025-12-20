import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { SettingsService } from '../../services/settings.service';

@Component({
    selector: 'app-business-services',
    imports: [CommonModule, RouterModule],
    templateUrl: './business-services.component.html'
})
export class BusinessServicesComponent implements OnInit {
  constructor(
    private seoService: SeoService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    const appName = this.settingsService.getAppName();
    this.seoService.updateMetaTags({
      title: `Business Services - Support for Your Growth | ${appName}`,
      description: `Explore our range of business services including incorporation, tax, accounting, and legal support to help your business grow.`,
      keywords: 'business services, company registration, tax filing, legal support'
    });
  }

  services = [
    {
      title: 'Incorporation Services',
      description: 'Complete business registration and incorporation services with legal compliance.',
      icon: '🏢',
      features: ['Company Registration', 'GST Registration', 'PAN/TAN Application', 'Legal Documentation'],
      price: 'Starting from ₹5,999'
    },
    {
      title: 'Tax and Accounting',
      description: 'Professional accounting and tax filing services for businesses and individuals.',
      icon: '📊',
      features: ['Monthly Accounting', 'GST Filing', 'Income Tax Filing', 'Financial Statements'],
      price: 'Starting from ₹2,999/month'
    },
    {
      title: 'Visa and Work Permits',
      description: 'Complete visa processing and work permit assistance for international clients.',
      icon: '✈️',
      features: ['Business Visa', 'Work Permits', 'Documentation', 'Consultation'],
      price: 'Starting from ₹15,999'
    },
    {
      title: 'Legal Services',
      description: 'Comprehensive legal support for business operations and compliance.',
      icon: '⚖️',
      features: ['Contract Drafting', 'Legal Consultation', 'Compliance Support', 'Documentation'],
      price: 'Starting from ₹3,999'
    }
  ];
}