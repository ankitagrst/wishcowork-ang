import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
    selector: 'app-privacy-policy',
    imports: [CommonModule, RouterModule],
    templateUrl: './privacy-policy.component.html'
})
export class PrivacyPolicyComponent implements OnInit {
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
      title: `Privacy Policy | ${this.appName}`,
      description: `Read our privacy policy to understand how we collect, use, and protect your personal information.`,
      keywords: 'privacy policy, data protection, wishcowork privacy'
    });
  }
}