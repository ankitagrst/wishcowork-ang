import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './careers.component.html'
})
export class CareersComponent {
  openPositions = [
    {
      title: 'Community Manager',
      department: 'Operations',
      location: 'Mumbai',
      type: 'Full-time',
      experience: '2-4 years',
      description: 'Lead community engagement and member experience across our coworking spaces.'
    },
    {
      title: 'Business Development Executive',
      department: 'Sales',
      location: 'Delhi',
      type: 'Full-time',
      experience: '1-3 years',
      description: 'Drive business growth by acquiring new clients and expanding existing partnerships.'
    },
    {
      title: 'Frontend Developer',
      department: 'Technology',
      location: 'Bangalore',
      type: 'Full-time',
      experience: '3-5 years',
      description: 'Build and maintain our web applications using modern frontend technologies.'
    },
    {
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      experience: '2-4 years',
      description: 'Create and execute marketing campaigns to promote our workspace solutions.'
    }
  ];

  benefits = [
    'Competitive salary packages',
    'Health insurance coverage',
    'Free workspace access',
    'Professional development opportunities',
    'Flexible working hours',
    'Team outings and events'
  ];
}