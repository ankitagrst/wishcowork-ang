import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface TeamMember {
  name: string;
  position: string;
  image: string;
  bio: string;
  linkedin?: string;
}

interface Statistic {
  number: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 pt-24 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Revolutionizing the Way <span class="text-primary-600">India Works</span>
            </h1>
            <p class="text-xl text-gray-600 mb-8 leading-relaxed">
              At WishCowork, we're building more than workspaces – we're creating communities where 
              entrepreneurs, freelancers, and businesses thrive together in India's most dynamic cities.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <button class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300">
                Join Our Community
              </button>
              <button class="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-bold py-3 px-8 rounded-xl transition-all duration-300">
                Schedule a Tour
              </button>
            </div>
          </div>
          <div class="relative">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=500&fit=crop&q=80" 
              alt="Modern WishCowork Office"
              class="rounded-2xl shadow-2xl"
            />
            <div class="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600">10,000+</div>
                <div class="text-sm text-gray-600">Happy Members</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p class="text-lg text-gray-600 mb-6 leading-relaxed">
              To democratize access to premium workspace solutions across India, empowering businesses 
              of all sizes to focus on what they do best while we take care of their workspace needs.
            </p>
            <p class="text-lg text-gray-600 leading-relaxed">
              We believe that great work happens when people have the right environment, tools, and 
              community around them. That's why we've created flexible, inspiring spaces that adapt 
              to your business needs.
            </p>
          </div>
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <p class="text-lg text-gray-600 mb-6 leading-relaxed">
              To become India's most trusted and innovative coworking platform, connecting entrepreneurs, 
              freelancers, and businesses across 100+ cities by 2030.
            </p>
            <p class="text-lg text-gray-600 leading-relaxed">
              We envision a future where geography doesn't limit opportunity, where every professional 
              has access to world-class workspace solutions, and where communities of innovators 
              collaborate to build tomorrow's success stories.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">WishCowork by the Numbers</h2>
          <p class="text-lg text-gray-600">Our journey so far in transforming India's workspace landscape</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div *ngFor="let stat of statistics" class="text-center">
            <div class="text-4xl font-bold text-primary-600 mb-2">{{ stat.number }}</div>
            <div class="text-lg font-semibold text-gray-900 mb-1">{{ stat.label }}</div>
            <div class="text-sm text-gray-600">{{ stat.description }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Story -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p class="text-lg text-gray-600">How WishCowork began and where we're heading</p>
        </div>
        
        <div class="space-y-12">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">2020 - The Beginning</h3>
              <p class="text-gray-600 mb-4">
                Founded in Jaipur by a team of entrepreneurs who experienced firsthand the challenges 
                of finding flexible, affordable workspace solutions in India. What started as a single 
                location has grown into a nationwide network.
              </p>
              <p class="text-gray-600">
                Our founders, coming from diverse backgrounds in technology, real estate, and hospitality, 
                combined their expertise to create something unique in the Indian market.
              </p>
            </div>
            <div class="bg-primary-50 rounded-2xl p-8">
              <div class="text-center">
                <div class="text-3xl font-bold text-primary-600 mb-2">1</div>
                <div class="text-gray-900 font-semibold">Location</div>
                <div class="text-sm text-gray-600 mt-2">Jaipur, Rajasthan</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="md:order-2">
              <h3 class="text-2xl font-bold text-gray-900 mb-4">2022 - Rapid Expansion</h3>
              <p class="text-gray-600 mb-4">
                Expanded to 15 locations across 8 cities, serving over 2,000 members. Introduced 
                virtual office services and premium private office solutions. Launched our mobile 
                app for seamless booking and community interaction.
              </p>
              <p class="text-gray-600">
                This year marked our entry into major metropolitan markets including Delhi NCR, 
                Mumbai, and Bangalore.
              </p>
            </div>
            <div class="md:order-1 bg-blue-50 rounded-2xl p-8">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600 mb-2">15</div>
                <div class="text-gray-900 font-semibold">Locations</div>
                <div class="text-sm text-gray-600 mt-2">8 Cities</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">2025 - Present Day</h3>
              <p class="text-gray-600 mb-4">
                Today, we operate 50+ locations across 15+ cities, serving over 10,000 members. 
                We've become one of India's most trusted coworking brands, known for our 
                premium amenities, flexible solutions, and vibrant communities.
              </p>
              <p class="text-gray-600">
                Our focus remains on innovation, sustainability, and creating spaces where 
                businesses of all sizes can thrive.
              </p>
            </div>
            <div class="bg-green-50 rounded-2xl p-8">
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600 mb-2">50+</div>
                <div class="text-gray-900 font-semibold">Locations</div>
                <div class="text-sm text-gray-600 mt-2">15+ Cities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          <p class="text-lg text-gray-600">The principles that guide everything we do</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Community First</h3>
            <p class="text-gray-600">
              We believe that great businesses are built through meaningful connections and 
              collaborative communities.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
            <p class="text-gray-600">
              We continuously evolve our spaces, services, and technology to meet the changing 
              needs of modern businesses.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
            <p class="text-gray-600">
              We maintain the highest standards in everything we do, from our spaces to our 
              customer service.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Flexibility</h3>
            <p class="text-gray-600">
              We understand that every business is unique, so we offer flexible solutions that 
              adapt to your needs.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Sustainability</h3>
            <p class="text-gray-600">
              We're committed to creating environmentally responsible workspaces for a 
              sustainable future.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Transparency</h3>
            <p class="text-gray-600">
              We believe in honest, transparent relationships with our members, partners, 
              and communities.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Leadership Team -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Meet Our Leadership Team</h2>
          <p class="text-lg text-gray-600">The visionaries behind WishCowork's success</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let member of teamMembers" class="bg-white rounded-2xl p-8 shadow-lg text-center group hover:shadow-2xl transition-all duration-300">
            <div class="relative mb-6">
              <img 
                [src]="member.image" 
                [alt]="member.name"
                class="w-24 h-24 rounded-full mx-auto object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ member.name }}</h3>
            <p class="text-primary-600 font-semibold mb-4">{{ member.position }}</p>
            <p class="text-gray-600 text-sm">{{ member.bio }}</p>
            <a 
              *ngIf="member.linkedin" 
              [href]="member.linkedin" 
              target="_blank"
              class="inline-flex items-center mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white mb-4">Ready to Join the WishCowork Family?</h2>
        <p class="text-primary-100 mb-8 text-lg">
          Discover how our workspace solutions can transform your business. Schedule a tour today.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button routerLink="/contact" class="bg-white text-primary-600 hover:bg-gray-50 font-bold py-3 px-8 rounded-xl transition-all duration-300">
            Get in Touch
          </button>
          <button routerLink="/plans" class="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-3 px-8 rounded-xl transition-all duration-300">
            View Our Plans
          </button>
        </div>
      </div>
    </section>
  `
})
export class AboutComponent {
  statistics: Statistic[] = [
    {
      number: '50+',
      label: 'Locations',
      description: 'Across India'
    },
    {
      number: '15+',
      label: 'Cities',
      description: 'And Growing'
    },
    {
      number: '10,000+',
      label: 'Members',
      description: 'Active Community'
    },
    {
      number: '98%',
      label: 'Satisfaction',
      description: 'Client Rating'
    }
  ];

  teamMembers: TeamMember[] = [
    {
      name: 'Rajesh Kumar',
      position: 'CEO & Co-Founder',
      image: 'https://i.pravatar.cc/200?img=10',
      bio: 'Serial entrepreneur with 15+ years in real estate and technology. Passionate about creating innovative workspace solutions.',
      linkedin: 'https://linkedin.com/in/rajeshkumar'
    },
    {
      name: 'Priya Sharma',
      position: 'COO & Co-Founder',
      image: 'https://i.pravatar.cc/200?img=15',
      bio: 'Operations expert with extensive experience in hospitality and customer experience. Ensures every WishCowork location exceeds expectations.',
      linkedin: 'https://linkedin.com/in/priyasharma'
    },
    {
      name: 'Amit Patel',
      position: 'CTO',
      image: 'https://i.pravatar.cc/200?img=20',
      bio: 'Technology leader with expertise in scalable platforms and mobile applications. Drives WishCowork\'s digital innovation.',
      linkedin: 'https://linkedin.com/in/amitpatel'
    },
    {
      name: 'Sneha Gupta',
      position: 'Head of Community',
      image: 'https://i.pravatar.cc/200?img=25',
      bio: 'Community builder who creates engaging experiences and networking opportunities for our members across all locations.',
      linkedin: 'https://linkedin.com/in/snehagupta'
    },
    {
      name: 'Vikram Singh',
      position: 'Head of Real Estate',
      image: 'https://i.pravatar.cc/200?img=30',
      bio: 'Real estate veteran with deep market knowledge. Identifies and develops premium locations for WishCowork expansion.',
      linkedin: 'https://linkedin.com/in/vikramsingh'
    },
    {
      name: 'Anita Desai',
      position: 'Head of Customer Success',
      image: 'https://i.pravatar.cc/200?img=35',
      bio: 'Customer success expert dedicated to ensuring every member has an exceptional WishCowork experience.',
      linkedin: 'https://linkedin.com/in/anitadesai'
    }
  ];
}