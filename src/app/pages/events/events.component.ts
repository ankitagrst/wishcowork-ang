import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventsService, Event as ApiEvent } from '../../services/events.service';

interface Event {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  price: number;
  maxAttendees: number;
  currentAttendees: number;
  featured: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
  organizer: string;
  tags: string[];
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 pt-24 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Events & Networking
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join our vibrant community events, workshops, and networking sessions. 
            Connect with like-minded professionals and grow your business network.
          </p>
          
          <!-- Event Filters -->
          <div class="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              *ngFor="let category of categories" 
              (click)="selectedCategory = category.value"
              [class]="selectedCategory === category.value ? 
                'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              class="px-6 py-3 rounded-xl font-medium transition-all duration-200 border shadow-sm"
            >
              {{ category.label }}
            </button>
          </div>

          <!-- Status Filter -->
          <div class="flex flex-wrap justify-center gap-3">
            <button 
              *ngFor="let status of statusFilters" 
              (click)="selectedStatus = status.value"
              [class]="selectedStatus === status.value ? 
                'bg-primary-100 text-primary-800 border-primary-300' : 'bg-white text-gray-600 hover:bg-gray-50'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
            >
              {{ status.label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Event -->
    <section class="py-16 bg-white" *ngIf="getFeaturedEvent()">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl overflow-hidden shadow-2xl">
          <div class="grid grid-cols-1 lg:grid-cols-2">
            <div class="p-8 lg:p-12 text-white">
              <div class="inline-block bg-white bg-opacity-20 rounded-full px-4 py-2 text-sm font-medium mb-4">
                Featured Event
              </div>
              <h2 class="text-3xl lg:text-4xl font-bold mb-4">{{ getFeaturedEvent()?.title }}</h2>
              <p class="text-primary-100 mb-6 text-lg">{{ getFeaturedEvent()?.description }}</p>
              
              <div class="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <div class="text-primary-200 text-sm">Date & Time</div>
                  <div class="font-semibold">{{ getFeaturedEvent()?.date }}</div>
                  <div class="font-semibold">{{ getFeaturedEvent()?.time }}</div>
                </div>
                <div>
                  <div class="text-primary-200 text-sm">Location</div>
                  <div class="font-semibold">{{ getFeaturedEvent()?.location }}</div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-4">
                <button class="bg-white text-primary-600 hover:bg-gray-50 font-bold py-3 px-8 rounded-xl transition-all duration-300">
                  Register Now
                </button>
                <button class="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-3 px-8 rounded-xl transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
            
            <div class="relative">
              <img 
                [src]="getFeaturedEvent()?.image" 
                [alt]="getFeaturedEvent()?.title"
                class="w-full h-full object-cover"
              />
              <div class="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {{ getFeaturedEvent()?.currentAttendees }}/{{ getFeaturedEvent()?.maxAttendees }} Attending
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Events Grid -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">All Events</h2>
          <p class="text-lg text-gray-600">Discover events that match your interests</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let event of getFilteredEvents(); trackBy: trackByEventId" 
            class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group"
          >
            <!-- Event Image -->
            <div class="relative overflow-hidden aspect-video">
              <img 
                [src]="event.image" 
                [alt]="event.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              <!-- Status Badge -->
              <div class="absolute top-4 left-4">
                <span 
                  [class]="getStatusColor(event.status)"
                  class="px-3 py-1 rounded-full text-xs font-medium text-white"
                >
                  {{ getStatusLabel(event.status) }}
                </span>
              </div>

              <!-- Price Badge -->
              <div class="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1">
                <span class="text-sm font-bold text-gray-900">
                  {{ event.price === 0 ? 'Free' : '₹' + event.price }}
                </span>
              </div>
            </div>

            <!-- Event Content -->
            <div class="p-6">
              <!-- Category -->
              <div class="mb-3">
                <span 
                  [class]="getCategoryColor(event.category)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ getCategoryLabel(event.category) }}
                </span>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                {{ event.title }}
              </h3>
              
              <p class="text-gray-600 mb-4 line-clamp-2">{{ event.description }}</p>

              <!-- Event Details -->
              <div class="space-y-2 mb-4">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {{ event.date }} at {{ event.time }}
                </div>
                
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {{ event.location }}
                </div>

                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                  {{ event.currentAttendees }}/{{ event.maxAttendees }} attending
                </div>
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span 
                  *ngFor="let tag of event.tags.slice(0, 3)" 
                  class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- Action Button -->
              <button 
                [disabled]="event.status === 'completed' || event.currentAttendees >= event.maxAttendees"
                [class]="event.status === 'completed' || event.currentAttendees >= event.maxAttendees ? 
                  'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'"
                class="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                <span *ngIf="event.status === 'completed'">Event Completed</span>
                <span *ngIf="event.status !== 'completed' && event.currentAttendees >= event.maxAttendees">Fully Booked</span>
                <span *ngIf="event.status !== 'completed' && event.currentAttendees < event.maxAttendees">
                  {{ event.price === 0 ? 'Register Free' : 'Register for ₹' + event.price }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div class="text-center mt-12" *ngIf="hasMoreEvents">
          <button 
            (click)="loadMoreEvents()"
            class="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Load More Events
          </button>
        </div>
      </div>
    </section>

    <!-- Event Hosting CTA -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Want to Host Your Own Event?</h2>
        <p class="text-lg text-gray-600 mb-8">
          Use our premium spaces and professional support to host memorable events for your community.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button routerLink="/contact" class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300">
            Host an Event
          </button>
          <button class="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-bold py-3 px-8 rounded-xl transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>
    </section>
  `
})
export class EventsComponent implements OnInit {
  selectedCategory: string = 'all';
  selectedStatus: string = 'all';
  displayedEventsCount: number = 9;
  hasMoreEvents: boolean = true;
  loading: boolean = true;
  events: Event[] = [];

  categories = [
    { label: 'All Events', value: 'all' },
    { label: 'Networking', value: 'Networking' },
    { label: 'Workshops', value: 'Workshop' },
    { label: 'Tech Talk', value: 'Tech Talk' },
    { label: 'Social', value: 'Social' },
    { label: 'Summit', value: 'Summit' }
  ];

  statusFilters = [
    { label: 'All Status', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Completed', value: 'completed' }
  ];

  constructor(private eventsService: EventsService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventsService.getEvents(false).subscribe({
      next: (apiEvents) => {
        // Convert API events to component format
        this.events = apiEvents.map(event => this.convertApiEventToEvent(event));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.loading = false;
        // Keep empty array on error
        this.events = [];
      }
    });
  }

  private convertApiEventToEvent(apiEvent: ApiEvent): Event {
    const eventDate = new Date(apiEvent.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
    if (eventDate < today) {
      status = 'completed';
    } else if (eventDate.toDateString() === today.toDateString()) {
      status = 'ongoing';
    }

    return {
      id: apiEvent.id?.toString() || '',
      title: apiEvent.title,
      description: apiEvent.description,
      fullDescription: apiEvent.description,
      date: this.formatDate(apiEvent.eventDate),
      time: this.formatTime(apiEvent.eventTime),
      location: apiEvent.location,
      category: apiEvent.category.toLowerCase(),
      image: apiEvent.image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop&q=80',
      price: 0,
      maxAttendees: apiEvent.maxAttendees || 100,
      currentAttendees: apiEvent.currentAttendees,
      featured: apiEvent.isFeatured,
      status: status,
      organizer: 'WishCowork Community',
      tags: [apiEvent.category]
    };
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  private formatTime(timeString: string): string {
    if (!timeString) return 'TBA';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Keep existing events array as fallback (remove hardcoded data)
  /*events: Event[] = [
    {
      id: '1',
      title: 'Startup Networking Night',
      description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts in a relaxed evening setting.',
      fullDescription: 'Join us for an evening of meaningful connections and conversations with the startup community. Meet potential co-founders, investors, mentors, and collaborators while enjoying refreshments and a welcoming atmosphere.',
      date: '2025-10-15',
      time: '6:00 PM - 9:00 PM',
      location: 'Connaught Place, Delhi',
      category: 'networking',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop&q=80',
      price: 0,
      maxAttendees: 50,
      currentAttendees: 32,
      featured: true,
      status: 'upcoming',
      organizer: 'WishCowork Community Team',
      tags: ['Networking', 'Startups', 'Entrepreneurship', 'Business']
    },
    {
      id: '2',
      title: 'Digital Marketing Workshop',
      description: 'Learn the latest digital marketing strategies from industry experts to grow your business online.',
      fullDescription: 'A comprehensive workshop covering SEO, social media marketing, content strategy, and paid advertising. Perfect for business owners and marketing professionals looking to enhance their digital presence.',
      date: '2025-10-18',
      time: '10:00 AM - 4:00 PM',
      location: 'Cyber City, Gurgaon',
      category: 'workshop',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&q=80',
      price: 1999,
      maxAttendees: 30,
      currentAttendees: 18,
      featured: false,
      status: 'upcoming',
      organizer: 'Digital Marketing Institute',
      tags: ['Digital Marketing', 'SEO', 'Social Media', 'Workshop']
    },
    {
      id: '3',
      title: 'Women in Tech Meetup',
      description: 'Empowering women in technology through meaningful discussions and professional networking.',
      fullDescription: 'A monthly meetup focused on supporting and empowering women in the technology industry. Share experiences, learn from successful women leaders, and build lasting professional relationships.',
      date: '2025-10-22',
      time: '7:00 PM - 9:30 PM',
      location: 'Bandra Kurla, Mumbai',
      category: 'networking',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&q=80',
      price: 0,
      maxAttendees: 40,
      currentAttendees: 28,
      featured: false,
      status: 'upcoming',
      organizer: 'Women in Tech Community',
      tags: ['Women in Tech', 'Technology', 'Career', 'Networking']
    },
    {
      id: '4',
      title: 'Financial Planning Seminar',
      description: 'Expert insights on personal and business financial planning strategies for long-term success.',
      fullDescription: 'Learn from certified financial planners about investment strategies, tax planning, retirement planning, and business financial management. Includes Q&A session and personalized advice.',
      date: '2025-10-25',
      time: '2:00 PM - 5:00 PM',
      location: 'Koramangala, Bangalore',
      category: 'seminar',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&q=80',
      price: 999,
      maxAttendees: 60,
      currentAttendees: 45,
      featured: false,
      status: 'upcoming',
      organizer: 'Financial Advisors Association',
      tags: ['Finance', 'Investment', 'Planning', 'Business']
    },
    {
      id: '5',
      title: 'Coworking Happy Hour',
      description: 'Unwind and connect with your fellow coworkers in a fun, relaxed atmosphere.',
      fullDescription: 'Join us every Friday for our weekly happy hour. Great food, drinks, music, and the perfect opportunity to meet new people and strengthen existing connections within our community.',
      date: '2025-10-11',
      time: '5:30 PM - 8:00 PM',
      location: 'Jan Path, Jaipur',
      category: 'social',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop&q=80',
      price: 0,
      maxAttendees: 80,
      currentAttendees: 65,
      featured: false,
      status: 'upcoming',
      organizer: 'WishCowork Jaipur',
      tags: ['Social', 'Networking', 'Community', 'Fun']
    },
    {
      id: '6',
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on workshop exploring practical applications of AI and ML in business.',
      fullDescription: 'A comprehensive workshop covering the fundamentals of AI and ML, with practical examples and hands-on exercises. Learn how to implement AI solutions in your business and stay ahead of the curve.',
      date: '2025-09-20',
      time: '9:00 AM - 5:00 PM',
      location: 'HITEC City, Hyderabad',
      category: 'workshop',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop&q=80',
      price: 2999,
      maxAttendees: 25,
      currentAttendees: 25,
      featured: false,
      status: 'completed',
      organizer: 'AI Research Institute',
      tags: ['AI', 'Machine Learning', 'Technology', 'Innovation']
    },
    {
      id: '7',
      title: 'Product Launch Event',
      description: 'Join us for the exclusive launch of an innovative productivity app built by our community member.',
      fullDescription: 'Celebrate the launch of TaskFlow Pro, a revolutionary productivity app developed by one of our community members. Meet the founder, see a live demo, and be among the first to try the app.',
      date: '2025-09-15',
      time: '4:00 PM - 7:00 PM',
      location: 'Anna Salai, Chennai',
      category: 'business',
      image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop&q=80',
      price: 0,
      maxAttendees: 100,
      currentAttendees: 87,
      featured: false,
      status: 'completed',
      organizer: 'TaskFlow Technologies',
      tags: ['Product Launch', 'Technology', 'Innovation', 'Startup']
    },
    {
      id: '8',
      title: 'Freelancer Success Workshop',
      description: 'Essential strategies for building a successful freelancing career and growing your client base.',
      fullDescription: 'Learn the secrets of successful freelancing from experienced professionals. Topics include client acquisition, pricing strategies, time management, and building long-term client relationships.',
      date: '2025-10-30',
      time: '1:00 PM - 6:00 PM',
      location: 'Hinjewadi, Pune',
      category: 'workshop',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&q=80',
      price: 1499,
      maxAttendees: 35,
      currentAttendees: 12,
      featured: false,
      status: 'upcoming',
      organizer: 'Freelancers Guild India',
      tags: ['Freelancing', 'Career', 'Business', 'Success']
    },
    {
      id: '9',
      title: 'Mindfulness & Productivity',
      description: 'Discover how mindfulness practices can enhance your productivity and work-life balance.',
      fullDescription: 'A unique seminar combining mindfulness techniques with productivity strategies. Learn meditation practices, stress management techniques, and how to maintain focus in a busy work environment.',
      date: '2025-11-05',
      time: '11:00 AM - 2:00 PM',
      location: 'Connaught Place, Delhi',
      category: 'seminar',
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&q=80',
      price: 799,
      maxAttendees: 45,
      currentAttendees: 8,
      featured: false,
      status: 'upcoming',
      organizer: 'Wellness at Work Institute',
      tags: ['Mindfulness', 'Productivity', 'Wellness', 'Balance']
    }
  ];*/

  getFilteredEvents(): Event[] {
    let filtered = this.events;
    
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }
    
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(event => event.status === this.selectedStatus);
    }
    
    // Sort by date (upcoming first, then by date)
    filtered.sort((a, b) => {
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
      if (b.status === 'upcoming' && a.status !== 'upcoming') return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    this.hasMoreEvents = filtered.length > this.displayedEventsCount;
    return filtered.slice(0, this.displayedEventsCount);
  }

  getFeaturedEvent(): Event | undefined {
    return this.events.find(event => event.featured && event.status === 'upcoming');
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'upcoming': 'bg-green-500',
      'ongoing': 'bg-blue-500',
      'completed': 'bg-gray-500'
    };
    return colorMap[status] || 'bg-gray-500';
  }

  getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      'upcoming': 'Upcoming',
      'ongoing': 'Live',
      'completed': 'Completed'
    };
    return labelMap[status] || status;
  }

  getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      'networking': 'bg-blue-100 text-blue-800',
      'workshop': 'bg-green-100 text-green-800',
      'seminar': 'bg-purple-100 text-purple-800',
      'social': 'bg-orange-100 text-orange-800',
      'business': 'bg-red-100 text-red-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  }

  getCategoryLabel(category: string): string {
    const labelMap: { [key: string]: string } = {
      'networking': 'Networking',
      'workshop': 'Workshop',
      'seminar': 'Seminar',
      'social': 'Social',
      'business': 'Business'
    };
    return labelMap[category] || category;
  }

  trackByEventId(index: number, event: Event): string {
    return event.id;
  }

  loadMoreEvents(): void {
    this.displayedEventsCount += 9;
    const filtered = this.getFilteredEvents();
    this.hasMoreEvents = filtered.length > this.displayedEventsCount;
  }
}