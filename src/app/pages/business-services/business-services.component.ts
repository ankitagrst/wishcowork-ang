import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-business-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './business-services.component.html'
})
export class BusinessServicesComponent {
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