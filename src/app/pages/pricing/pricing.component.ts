import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  buttonText: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pricing.component.html'
})
export class PricingComponent {
  pricingPlans: PricingPlan[] = [
    {
      name: 'Day Pass',
      price: 25,
      period: 'day',
      description: 'Perfect for occasional visits',
      features: [
        'Access to shared workspace',
        'High-speed WiFi',
        'Printing services',
        'Coffee and tea',
        'Meeting room access (2 hours)',
        'Reception services'
      ],
      highlighted: false,
      buttonText: 'Buy Day Pass'
    },
    {
      name: 'Hot Desk',
      price: 199,
      period: 'month',
      description: 'Flexible workspace solution',
      features: [
        'All Day Pass benefits',
        'Unlimited access 24/7',
        'Mail handling services',
        'Meeting room credits (10 hours)',
        'Networking events access',
        'Phone booth access',
        'Storage locker'
      ],
      highlighted: true,
      buttonText: 'Start Free Trial'
    },
    {
      name: 'Dedicated Desk',
      price: 399,
      period: 'month',
      description: 'Your own permanent workspace',
      features: [
        'All Hot Desk benefits',
        'Reserved desk space',
        'Dual monitor setup',
        'Under-desk storage',
        'Meeting room credits (20 hours)',
        'Priority booking',
        'Guest day passes (5/month)'
      ],
      highlighted: false,
      buttonText: 'Reserve Desk'
    },
    {
      name: 'Private Office',
      price: 799,
      period: 'month',
      description: 'Complete privacy and customization',
      features: [
        'All Dedicated Desk benefits',
        'Private lockable office',
        'Customizable workspace',
        'Team collaboration space',
        'Unlimited meeting room access',
        'Dedicated phone line',
        'Company signage'
      ],
      highlighted: false,
      buttonText: 'Book Tour'
    }
  ];

  additionalServices = [
    {
      name: 'Virtual Office',
      price: 99,
      description: 'Professional business address and mail handling'
    },
    {
      name: 'Meeting Room',
      price: 35,
      description: 'Per hour for external bookings'
    },
    {
      name: 'Event Space',
      price: 150,
      description: 'Per hour for workshops and events'
    }
  ];
}