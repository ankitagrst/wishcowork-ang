import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  inquiryType: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  image: string;
  features: string[];
  coordinates: { lat: number; lng: number };
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 pt-24 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Ready to join our community or have questions about our services? 
            We're here to help you find the perfect workspace solution.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form & Info Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <!-- Contact Form -->
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            <form (ngSubmit)="submitForm()" #contactForm="ngForm" class="space-y-6">
              <!-- Inquiry Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  What can we help you with?
                </label>
                <select 
                  [(ngModel)]="formData.inquiryType" 
                  name="inquiryType" 
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select an option</option>
                  <option value="membership">Membership Inquiry</option>
                  <option value="tour">Schedule a Tour</option>
                  <option value="events">Host an Event</option>
                  <option value="partnership">Partnership</option>
                  <option value="support">Member Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Name and Email Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.name" 
                    name="name" 
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    [(ngModel)]="formData.email" 
                    name="email" 
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="john&#64;example.com"
                  />
                </div>
              </div>

              <!-- Phone and Company Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    [(ngModel)]="formData.phone" 
                    name="phone"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.company" 
                    name="company"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Your Company"
                  />
                </div>
              </div>

              <!-- Subject -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.subject" 
                  name="subject"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="How can we help you?"
                />
              </div>

              <!-- Message -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea 
                  [(ngModel)]="formData.message" 
                  name="message" 
                  required
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us more about your needs..."
                ></textarea>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                [disabled]="!contactForm.form.valid || isSubmitting"
                class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                <span *ngIf="!isSubmitting">Send Message</span>
                <span *ngIf="isSubmitting" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              </button>
            </form>

            <!-- Success Message -->
            <div *ngIf="isSubmitted" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p class="text-green-800 font-medium">Thank you! We'll get back to you within 24 hours.</p>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p class="text-gray-600 mb-8">
                We're here to answer your questions and help you find the perfect workspace solution. 
                Reach out to us through any of the channels below.
              </p>
            </div>

            <!-- Contact Methods -->
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="bg-primary-600 text-white p-3 rounded-xl mr-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Email Us</h3>
                  <p class="text-gray-600">info&#64;wishcowork.com</p>
                  <p class="text-gray-600">support&#64;wishcowork.com</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="bg-primary-600 text-white p-3 rounded-xl mr-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Call Us</h3>
                  <p class="text-gray-600">+91 1800-123-WISH</p>
                  <p class="text-gray-600">+91 98765-43210</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="bg-primary-600 text-white p-3 rounded-xl mr-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Visit Us</h3>
                  <p class="text-gray-600">Multiple locations across India</p>
                  <p class="text-gray-600">See all locations below</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="bg-primary-600 text-white p-3 rounded-xl mr-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Business Hours</h3>
                  <p class="text-gray-600">Monday - Friday: 8:00 AM - 8:00 PM</p>
                  <p class="text-gray-600">Saturday - Sunday: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div class="flex space-x-4">
                <a href="#" class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" class="bg-blue-800 hover:bg-blue-900 text-white p-3 rounded-xl transition-all duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" class="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-xl transition-all duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.1.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" class="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Locations Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Locations</h2>
          <p class="text-lg text-gray-600">Visit any of our premium coworking spaces across India</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let location of locations" 
            class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group"
          >
            <!-- Location Image -->
            <div class="relative overflow-hidden aspect-video">
              <img 
                [src]="location.image" 
                [alt]="location.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <!-- Location Details -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ location.name }}</h3>
              <p class="text-gray-600 mb-4">{{ location.address }}</p>

              <!-- Contact Info -->
              <div class="space-y-2 mb-4">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  {{ location.phone }}
                </div>
                
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  {{ location.email }}
                </div>

                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ location.hours }}
                </div>
              </div>

              <!-- Features -->
              <div class="mb-4">
                <h4 class="font-semibold text-gray-900 mb-2">Features:</h4>
                <div class="flex flex-wrap gap-2">
                  <span 
                    *ngFor="let feature of location.features.slice(0, 3)" 
                    class="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs"
                  >
                    {{ feature }}
                  </span>
                  <span 
                    *ngIf="location.features.length > 3"
                    class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                  >
                    +{{ location.features.length - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <button class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                  Schedule Tour
                </button>
                <button class="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p class="text-lg text-gray-600">Got questions? We've got answers.</p>
        </div>

        <div class="space-y-4">
          <div 
            *ngFor="let faq of faqs; let i = index" 
            class="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button 
              (click)="toggleFaq(i)"
              class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-200"
            >
              <span class="font-semibold text-gray-900">{{ faq.question }}</span>
              <svg 
                [class]="activeFaq === i ? 'rotate-180' : ''"
                class="w-5 h-5 text-gray-500 transition-transform duration-200"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <div 
              [class]="activeFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'"
              class="overflow-hidden transition-all duration-300"
            >
              <div class="px-6 pb-4 text-gray-600">
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ContactComponent {
  isSubmitting = false;
  isSubmitted = false;
  activeFaq: number | null = null;

  formData: ContactForm = {
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: ''
  };

  locations: Location[] = [
    {
      id: '1',
      name: 'WishCowork Connaught Place',
      address: 'Block A, Connaught Place, New Delhi 110001',
      phone: '+91 11-4567-8901',
      email: 'delhi@wishcowork.com',
      hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM',
      image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop&q=80',
      features: ['High-Speed WiFi', '24/7 Access', 'Meeting Rooms', 'Event Space', 'Parking'],
      coordinates: { lat: 28.6315, lng: 77.2167 }
    },
    {
      id: '2',
      name: 'WishCowork Bandra Kurla',
      address: 'G Block, Bandra Kurla Complex, Mumbai 400051',
      phone: '+91 22-9876-5432',
      email: 'mumbai@wishcowork.com',
      hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80',
      features: ['Premium Desks', 'Phone Booths', 'Café', 'Networking Events', 'Metro Access'],
      coordinates: { lat: 19.0596, lng: 72.8656 }
    },
    {
      id: '3',
      name: 'WishCowork Koramangala',
      address: '80 Feet Road, Koramangala 5th Block, Bangalore 560095',
      phone: '+91 80-1234-5678',
      email: 'bangalore@wishcowork.com',
      hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM',
      image: 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=300&fit=crop&q=80',
      features: ['Tech Hub', 'Gaming Zone', 'Rooftop Terrace', 'Mentorship', 'Startup Support'],
      coordinates: { lat: 12.9352, lng: 77.6245 }
    },
    {
      id: '4',
      name: 'WishCowork Cyber City',
      address: 'DLF Cyber City, Phase 2, Gurgaon 122002',
      phone: '+91 124-789-0123',
      email: 'gurgaon@wishcowork.com',
      hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM',
      image: 'https://images.unsplash.com/photo-1556761175-b816a6e2c7b8?w=400&h=300&fit=crop&q=80',
      features: ['Corporate Lounges', 'Video Conferencing', 'Business Center', 'Concierge', 'Gym Access'],
      coordinates: { lat: 28.4948, lng: 77.0869 }
    },
    {
      id: '5',
      name: 'WishCowork HITEC City',
      address: 'HITEC City, Madhapur, Hyderabad 500081',
      phone: '+91 40-5555-6666',
      email: 'hyderabad@wishcowork.com',
      hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop&q=80',
      features: ['Innovation Lab', 'Podcast Studio', 'Wellness Room', 'Food Court', 'Shuttle Service'],
      coordinates: { lat: 17.4435, lng: 78.3772 }
    },
    {
      id: '6',
      name: 'WishCowork Anna Salai',
      address: 'Express Avenue, Anna Salai, Chennai 600002',
      phone: '+91 44-7777-8888',
      email: 'chennai@wishcowork.com',
      hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM',
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop&q=80',
      features: ['Creative Studio', 'Library', 'Meditation Room', 'Cultural Events', 'Local Partnerships'],
      coordinates: { lat: 13.0827, lng: 80.2707 }
    }
  ];

  faqs = [
    {
      question: 'What membership plans do you offer?',
      answer: 'We offer flexible membership options including hot desks, dedicated desks, private offices, and virtual office services. Plans range from daily passes to annual memberships with various amenities included.'
    },
    {
      question: 'Can I visit the space before joining?',
      answer: 'Absolutely! We encourage prospective members to schedule a tour of our facilities. You can book a free tour through our website or by calling any of our locations directly.'
    },
    {
      question: 'What amenities are included in the membership?',
      answer: 'All memberships include high-speed WiFi, printing services, complimentary coffee/tea, access to common areas, and use of meeting rooms (with advance booking). Premium memberships include additional perks.'
    },
    {
      question: 'Do you offer meeting room rentals for non-members?',
      answer: 'Yes, we rent meeting rooms to non-members based on availability. Rates vary by location and room size. Members receive discounted rates and priority booking.'
    },
    {
      question: 'Is there parking available?',
      answer: 'Most of our locations offer parking facilities for members. Some locations provide complimentary parking while others charge a nominal fee. Please check with your specific location for details.'
    },
    {
      question: 'Can I access the space 24/7?',
      answer: 'Select membership plans include 24/7 access. Our premium and enterprise members have round-the-clock access to their designated areas, while basic memberships have access during business hours.'
    },
    {
      question: 'Do you host networking events?',
      answer: 'Yes! We regularly organize networking events, workshops, seminars, and social gatherings for our community members. These events are great opportunities to connect with fellow professionals.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Our cancellation policy varies by membership type. Monthly memberships require 30 days notice, while annual memberships may have different terms. Please refer to your membership agreement for specific details.'
    }
  ];

  submitForm(): void {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.isSubmitted = true;
      this.resetForm();
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        this.isSubmitted = false;
      }, 5000);
    }, 2000);
  }

  resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
      inquiryType: ''
    };
  }

  toggleFaq(index: number): void {
    this.activeFaq = this.activeFaq === index ? null : index;
  }
}