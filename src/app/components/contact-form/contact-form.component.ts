import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <!-- Contact Form Section -->
    <section [class]="sectionClass">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12 sm:mb-16" *ngIf="showHeader">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{{ title }}</h2>
          <p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {{ subtitle }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <!-- Contact Information -->
          <div class="mb-8 lg:mb-0">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6" *ngIf="!showHeader">{{ title }}</h3>
            
            <!-- Contact Details -->
            <div class="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <div class="flex items-start space-x-3 sm:space-x-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Our Locations</h4>
                  <p class="text-gray-600 text-sm sm:text-base">Multiple premium locations across Delhi, Mumbai, Bangalore, and Gurgaon</p>
                </div>
              </div>

              <div class="flex items-start space-x-3 sm:space-x-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Call Us</h4>
                  <p class="text-gray-600 text-sm sm:text-base">+91 98765 43210</p>
                  <p class="text-gray-600 text-xs sm:text-sm">Available 24/7 for support</p>
                </div>
              </div>

              <div class="flex items-start space-x-3 sm:space-x-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Email Us</h4>
                  <p class="text-gray-600 text-sm sm:text-base">info&#64;wishcowork.com</p>
                  <p class="text-gray-600 text-xs sm:text-sm">We'll respond within 24 hours</p>
                </div>
              </div>
            </div>

            <!-- Business Hours -->
            <div class="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h4 class="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Business Hours</h4>
              <div class="space-y-2 text-xs sm:text-sm text-gray-600">
                <div class="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 8:00 PM</span>
                </div>
                <div class="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
                <div class="flex justify-between">
                  <span>Sunday</span>
                  <span>11:00 AM - 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    formControlName="firstName"
                    class="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm sm:text-base"
                    placeholder="Enter your first name"
                  >
                  <div *ngIf="contactForm.get('firstName')?.touched && contactForm.get('firstName')?.errors" class="text-red-500 text-sm mt-1">
                    First name is required
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    formControlName="lastName"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="Enter your last name"
                  >
                  <div *ngIf="contactForm.get('lastName')?.touched && contactForm.get('lastName')?.errors" class="text-red-500 text-sm mt-1">
                    Last name is required
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="Enter your email"
                  >
                  <div *ngIf="contactForm.get('email')?.touched && contactForm.get('email')?.errors" class="text-red-500 text-sm mt-1">
                    <span *ngIf="contactForm.get('email')?.errors?.['required']">Email is required</span>
                    <span *ngIf="contactForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    formControlName="phone"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="Enter your phone number"
                  >
                  <div *ngIf="contactForm.get('phone')?.touched && contactForm.get('phone')?.errors" class="text-red-500 text-sm mt-1">
                    Phone number is required
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select 
                  formControlName="subject"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="booking">Workspace Booking</option>
                  <option value="tour">Schedule a Tour</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="support">Customer Support</option>
                </select>
                <div *ngIf="contactForm.get('subject')?.touched && contactForm.get('subject')?.errors" class="text-red-500 text-sm mt-1">
                  Please select a subject
                </div>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea 
                  formControlName="message"
                  rows="5"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-none"
                  placeholder="Tell us about your workspace requirements..."
                ></textarea>
                <div *ngIf="contactForm.get('message')?.touched && contactForm.get('message')?.errors" class="text-red-500 text-sm mt-1">
                  Message is required
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                [disabled]="!contactForm.valid || isSubmitting"
                class="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
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
                <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-green-800 font-medium">Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ContactFormComponent {
  @Input() title: string = 'Request a Consultation';
  @Input() subtitle: string = 'Get in touch with our workspace experts to find the perfect solution for your business needs.';
  @Input() sectionClass: string = 'py-20 bg-gray-50';
  @Input() showHeader: boolean = true;

  contactForm: FormGroup;
  isSubmitting = false;
  isSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.isSubmitted = false;
        }, 5000);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}