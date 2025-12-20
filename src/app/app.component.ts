import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LocomotiveScrollService } from './services/locomotive-scroll.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'WishCowork - Premium Workspace Solutions';
  isAdminRoute = false;

  constructor(private router: Router, private locoService: LocomotiveScrollService) {
    // Listen to route changes to detect admin routes
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const newIsAdmin = event.url.startsWith('/admin');
      
      // If route type changed, apply necessary init/destroy for locomotive scroll
      if (this.isAdminRoute !== newIsAdmin) {
        this.isAdminRoute = newIsAdmin;
        if (this.isAdminRoute) {
          // Destroy Locomotive Scroll when entering admin
          try { this.locoService.destroy(); } catch(e) { /* noop */ }
        } else {
          // Re-initialize on non-admin route after navigation
          setTimeout(() => {
            try {
              const el = document.querySelector('[data-scroll-container]') as HTMLElement || document.body as HTMLElement;
              this.locoService.init(el)
                .then(() => setTimeout(() => this.locoService.update(), 200))
                .catch(err => console.warn('Loco re-init failed', err));
            } catch (err) {
              console.warn('Failed to re-init Locomotive Scroll:', err);
            }
          }, 100);
        }
      } else if (!this.isAdminRoute) {
        // If we stayed in non-admin, always trigger an update after navigation
        // to ensure the new page content is measured correctly.
        setTimeout(() => {
          try { 
            this.locoService.update();
            // Scroll to top on navigation
            this.locoService.scrollTo(0, { duration: 0, disableLerp: true });
          } catch (err) { /* noop */ }
        }, 200);
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialize locomotive scroll only on the client.
    // The service itself guards for platform and uses dynamic import.
    if (typeof document === 'undefined') return; // SSR guard
    try {
      if (!this.isAdminRoute) {
        const el = document.querySelector('[data-scroll-container]') as HTMLElement || document.body as HTMLElement;
        // Initialize and schedule an update to ensure sizes are correct after initial render
        this.locoService.init(el)
          .then(() => setTimeout(() => this.locoService.update(), 120))
          .catch(err => console.warn('Loco init failed', err));
        // Also update on window load/resize which can influence layout (images/fonts)
        window.addEventListener('load', () => setTimeout(() => this.locoService.update(), 120));
        window.addEventListener('resize', () => setTimeout(() => this.locoService.update(), 120));
      }
    } catch (err) {
      // document may be undefined during SSR or tests; ignore errors from server
      // initialization attempts while keeping the app functional.
      // The service will also guard this; this is defensive.
      console.warn('Failed to init Locomotive Scroll (possibly SSR path):', err);
    }
  }

  ngOnDestroy(): void {
    try {
      this.locoService.destroy();
    } catch (err) {
      console.warn('Failed to destroy Locomotive Scroll', err);
    }
    try {
      window.removeEventListener('load', () => setTimeout(() => this.locoService.update(), 120));
      window.removeEventListener('resize', () => setTimeout(() => this.locoService.update(), 120));
    } catch (e) { /* noop */ }
  }
}
