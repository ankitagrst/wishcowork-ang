import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { SettingsService } from '../../services/settings.service';

@Component({
    selector: 'app-cookie-policy',
    imports: [CommonModule, RouterModule],
    templateUrl: './cookie-policy.component.html'
})
export class CookiePolicyComponent implements OnInit {
  lastUpdated = 'January 2024';

  constructor(
    private seoService: SeoService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    const appName = this.settingsService.getAppName();
    this.seoService.updateMetaTags({
      title: `Cookie Policy | ${appName}`,
      description: `Learn about how we use cookies to improve your experience on our website.`,
      keywords: 'cookie policy, cookies, wishcowork cookies'
    });
  }
}