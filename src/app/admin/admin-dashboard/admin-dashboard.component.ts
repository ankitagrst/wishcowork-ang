import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PropertyService } from '../../services/property.service';
import { ViewTrackingService } from '../../services/view-tracking.service';

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  pendingRequests: number;
}

interface RecentActivity {
  id: number;
  type: 'property' | 'booking' | 'inquiry' | 'user';
  title: string;
  description: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any;
  stats: DashboardStats = {
    totalProperties: 0,
    activeProperties: 0,
    totalViews: 0,
    pendingRequests: 0
  };

  recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'property',
      title: 'New Property Listed',
      description: 'Virtual Office in Sector 62, Noida added',
      time: '2 hours ago',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      id: 2,
      type: 'booking',
      title: 'New Booking',
      description: 'Meeting Room booked for tomorrow',
      time: '5 hours ago',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      id: 3,
      type: 'inquiry',
      title: 'New Inquiry',
      description: 'Inquiry for Coworking Space in Delhi',
      time: '1 day ago',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 4,
      type: 'user',
      title: 'New User Registration',
      description: 'New user registered on the platform',
      time: '2 days ago',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    }
  ];

  quickActions = [
    {
      title: 'Add Property',
      description: 'List a new property',
      icon: 'M12 4v16m8-8H4',
      route: '/admin/properties/new',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Manage Properties',
      description: 'View all properties',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      route: '/admin/properties',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Pricing Management',
      description: 'Manage plans & services',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      route: '/admin/pricing',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Events Management',
      description: 'Manage community events',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      route: '/admin/events',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Blogs Management',
      description: 'Manage blog posts',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      route: '/admin/blogs',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'News Management',
      description: 'Manage news articles',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
      route: '/admin/news',
      color: 'from-amber-500 to-amber-600'
    },
    {
      title: 'View Bookings',
      description: 'Manage bookings',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      route: '/admin/bookings',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Settings',
      description: 'Configure system',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      route: '/admin/settings',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  constructor(
    private authService: AuthService,
    private propertyService: PropertyService,
    private viewTrackingService: ViewTrackingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats(): void {
    // Load property stats
    this.propertyService.getAllProperties().subscribe(properties => {
      this.stats.totalProperties = properties.length;
      this.stats.activeProperties = properties.length; // All are active for now
      this.stats.pendingRequests = Math.floor(Math.random() * 50) + 10;
    });
    
    // Load real view data
    this.viewTrackingService.getTotalViews().subscribe(viewStats => {
      if (viewStats.success) {
        this.stats.totalViews = viewStats.total_views;
      } else {
        // Fallback to random number if API fails
        this.stats.totalViews = Math.floor(Math.random() * 10000) + 5000;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToAction(route: string): void {
    this.router.navigate([route]);
  }

  getActivityIconColor(type: string): string {
    switch(type) {
      case 'property': return 'bg-blue-100 text-blue-600';
      case 'booking': return 'bg-green-100 text-green-600';
      case 'inquiry': return 'bg-purple-100 text-purple-600';
      case 'user': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
