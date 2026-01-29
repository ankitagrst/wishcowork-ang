import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { City } from '../../models/property.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingsService } from '../../services/settings.service';

@Component({
    selector: 'app-footer',
    imports: [CommonModule, RouterModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  cities: City[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private propertyService: PropertyService,
    private router: Router
    , private settings: SettingsService
  ) {
    this.appName = this.settings.getAppName();
    this.supportEmail = this.settings.getSupportEmail();
    this.supportPhone = this.settings.getSettings().supportPhone || '+91-9555730319';
  }

  appName = '';
  supportEmail = '';
  supportPhone = '';

  ngOnInit(): void {
    this.loadCities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCities(): void {
    this.propertyService.getCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        cities => {
          this.cities = cities;
        },
        error => {
          console.error('Error loading cities:', error);
          this.cities = [];
        }
      );
  }

  navigateToCityWorkspace(city: City, type: string): void {
    const citySlug = city.slug || city.name.toLowerCase().replace(/\s+/g, '-');
    const typeMap: Record<string, string> = {
      'coworking': 'coworking-space',
      'day-pass': 'day-pass',
      'virtual-office': 'virtual-office'
    };
    const typeSlug = typeMap[type] || type;
    this.router.navigate(['/properties'], {
      queryParams: {
        city: citySlug,
        type: typeSlug
      }
    });
  }
}
