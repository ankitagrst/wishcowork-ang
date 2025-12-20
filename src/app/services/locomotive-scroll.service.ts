import { Injectable, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

// NOTE: We purposely avoid static import of 'locomotive-scroll' to prevent
// the library from accessing `document` during server-side rendering or
// during Vite pre-bundling. The library is loaded dynamically only when
// running in the browser.

@Injectable({ providedIn: 'root' })
export class LocomotiveScrollService {
  private locomotiveScroll: any = null;
  private scrollProgressSubject = new BehaviorSubject<number>(0);
  public scrollProgress$ = this.scrollProgressSubject.asObservable();
  private isBrowser: boolean;
  private mutationObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private debounceTimer: any = null;
  private imageLoadHandler = (e: Event) => {
    const t = e.target as HTMLElement;
    if (t && t.tagName && t.tagName.toLowerCase() === 'img') {
      this.scheduleUpdate(120);
    }
  };
  private initAttempts = 0;

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Initialize Locomotive Scroll only in browser.
   * Uses dynamic import to avoid evaluating the module on the server.
   */
  async init(container: HTMLElement | string): Promise<void> {
    if (!this.isBrowser) {
      // Skip initialization on server
      return;
    }

    if (this.locomotiveScroll) {
      // already initialized
      return;
    }

    // dynamic import to prevent SSR/runtime issues
    try {
      this.initAttempts++;
      const mod = await import('locomotive-scroll');
      const LocomotiveScroll = mod && (mod.default || mod);

      // create instance outside Angular to avoid change detection storms
      this.ngZone.runOutsideAngular(() => {
        try {
          const elToUse: HTMLElement | null = typeof container === 'string' ? (document.querySelector(container) as HTMLElement | null) : (container as HTMLElement | null);
          this.locomotiveScroll = new LocomotiveScroll({
            el: elToUse,
            smooth: true,
            direction: 'vertical',
            gestureDirection: 'vertical',
            reloadOnContextChange: true,
            inertia: 0.8,
            class: 'is-reveal',
            scrollFromAnywhere: true,
            firefoxMultiplier: 50,
            touchMultiplier: 5,
            smartphone: { smooth: true, direction: 'vertical', gestureDirection: 'vertical' },
            tablet: { smooth: true, direction: 'vertical', gestureDirection: 'vertical' }
          });

          // listen to scroll events and publish progress back inside Angular
          this.locomotiveScroll.on && this.locomotiveScroll.on('scroll', (instance: any) => {
            const progress = instance && instance.progress != null ? instance.progress : 0;
            this.ngZone.run(() => this.scrollProgressSubject.next(progress));
          });

          // Attach a MutationObserver to watch for DOM changes within the scroll container
          try {
            if (elToUse && 'MutationObserver' in window) {
              this.mutationObserver && this.mutationObserver.disconnect();
              this.mutationObserver = new MutationObserver(() => this.scheduleUpdate(120));
              this.mutationObserver.observe(elToUse, { childList: true, subtree: true, attributes: true });
            }
          } catch (moErr) {
            console.warn('Failed to attach MutationObserver for Loco updates', moErr);
          }

          // Attach a ResizeObserver to watch for size changes
          try {
            if (elToUse && 'ResizeObserver' in window) {
              this.resizeObserver && this.resizeObserver.disconnect();
              this.resizeObserver = new ResizeObserver(() => this.scheduleUpdate(150));
              this.resizeObserver.observe(elToUse);
            }
          } catch (roErr) {
            console.warn('Failed to attach ResizeObserver for Loco updates', roErr);
          }

          // Listen for image load events inside the container to trigger an update
          try {
            if (elToUse && elToUse.addEventListener) {
              elToUse.addEventListener('load', this.imageLoadHandler, true);
            }
          } catch (imgErr) {
            console.warn('Failed to attach image load handler for Loco updates', imgErr);
          }

          // Ensure we schedule a first update after init so sizes are correct
          this.scheduleUpdate(120);
        } catch (err) {
          // If initialization fails, ensure locomotiveScroll remains null
          // and surface the error to console for debugging.
          console.error('Failed to initialize Locomotive Scroll:', err);
          this.locomotiveScroll = null;
          // Retry a few times with backoff
          if (this.initAttempts < 4) {
            setTimeout(() => this.init(container), 200 * this.initAttempts);
          }
        }
      });
    } catch (err) {
      console.error('Failed to import Locomotive Scroll module:', err);
      // retry importing a few times
      if (this.initAttempts < 4) {
        setTimeout(() => this.init(container), 200 * this.initAttempts);
      }
    }
  }

  private scheduleUpdate(delay = 100) {
    try {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.update(), delay);
    } catch (e) {
      // noop
    }
  }

  scrollTo(target: string | HTMLElement | number, options?: any): void {
    if (!this.isBrowser || !this.locomotiveScroll) return;
    this.ngZone.runOutsideAngular(() => {
      try {
        this.locomotiveScroll.scrollTo(target, options);
      } catch (e) {
        console.warn('Locomotive scrollTo failed', e);
      }
    });
  }

  update(): void {
    if (!this.isBrowser || !this.locomotiveScroll) return;
    try {
      this.locomotiveScroll.update && this.locomotiveScroll.update();
    } catch (e) {
      console.warn('Locomotive update failed', e);
    }
  }

  destroy(): void {
    if (!this.isBrowser || !this.locomotiveScroll) return;
    try {
      this.locomotiveScroll.destroy && this.locomotiveScroll.destroy();
    } catch (e) {
      console.warn('Locomotive destroy failed', e);
    }
    this.locomotiveScroll = null;
    this.scrollProgressSubject.next(0);
    try {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      // remove image load handler
      try { document.removeEventListener && document.removeEventListener('load', this.imageLoadHandler, true); } catch (e) { /* noop */ }
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      this.initAttempts = 0;
    } catch (e) {
      // noop
    }
  }

  getInstance(): any {
    return this.locomotiveScroll;
  }

  getScrollProgress(): number {
    return this.scrollProgressSubject.value;
  }
}
