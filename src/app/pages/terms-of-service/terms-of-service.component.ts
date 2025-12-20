import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
    selector: 'app-terms-of-service',
    imports: [CommonModule, RouterModule],
    templateUrl: './terms-of-service.component.html'
})
export class TermsOfServiceComponent implements OnInit {
  lastUpdated = 'January 2024';
  appName = '';
  supportEmail = '';

  constructor(
    private settings: SettingsService,
    private seoService: SeoService
  ) {
    this.appName = this.settings.getAppName();
    this.supportEmail = this.settings.getSupportEmail();
  }

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: `Terms of Service | ${this.appName}`,
      description: `Read our terms of service to understand the rules and regulations for using our workspace solutions.`,
      keywords: 'terms of service, user agreement, wishcowork terms'
    });
  }
}