import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventsService, Event } from '../../services/events.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.css']
})
export class AdminEventsComponent implements OnInit {
  events: Event[] = [];
  selectedEvent: Event | null = null;
  showEventModal = false;
  
  loading = false;
  error: string | null = null;
  success: string | null = null;

  categories = ['Networking', 'Workshop', 'Tech Talk', 'Social', 'Summit', 'General'];

  constructor(
    private eventsService: EventsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventsService.getEvents(true).subscribe({
      next: (data) => {
        this.events = data.sort((a, b) => a.displayOrder - b.displayOrder);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events';
        console.error(err);
        this.loading = false;
      }
    });
  }

  openEventModal(event?: Event): void {
    if (event) {
      this.selectedEvent = { ...event };
    } else {
      this.selectedEvent = {
        title: '',
        description: '',
        eventDate: '',
        eventTime: '00:00',
        location: '',
        image: '',
        category: 'General',
        registrationLink: '',
        isFeatured: false,
        isActive: true,
        displayOrder: this.events.length + 1,
        maxAttendees: 0,
        currentAttendees: 0
      };
    }
    this.showEventModal = true;
  }

  saveEvent(): void {
    if (!this.selectedEvent) return;

    // Validation
    if (!this.selectedEvent.title || !this.selectedEvent.description || !this.selectedEvent.eventDate) {
      this.error = 'Please fill in all required fields';
      setTimeout(() => this.error = null, 3000);
      return;
    }

    this.loading = true;

    const operation = this.selectedEvent.id
      ? this.eventsService.updateEvent(this.selectedEvent)
      : this.eventsService.createEvent(this.selectedEvent);

    operation.subscribe({
      next: () => {
        this.success = this.selectedEvent!.id
          ? 'Event updated successfully'
          : 'Event created successfully';
        this.showEventModal = false;
        this.selectedEvent = null;
        this.loadEvents();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to save event';
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteEvent(id: number): void {
    if (!confirm('Are you sure you want to delete this event?')) return;

    this.loading = true;
    this.eventsService.deleteEvent(id).subscribe({
      next: () => {
        this.success = 'Event deleted successfully';
        this.loadEvents();
        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete event';
        console.error(err);
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'TBA';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  isUpcoming(dateString: string): boolean {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }

  getAvailableSeats(event: Event): number {
    if (!event.maxAttendees) return 0;
    return event.maxAttendees - event.currentAttendees;
  }

  // Navigation Methods
  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
