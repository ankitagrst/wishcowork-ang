import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface AppSettings {
  apiUrl: string;
  useMockAPI: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsKey = 'wishcowork_settings';
  private defaultSettings: AppSettings = {
    apiUrl: 'http://wishapi',
    useMockAPI: false  // Use real API by default
  };

  private settingsSubject = new BehaviorSubject<AppSettings>(this.defaultSettings);
  public settings$ = this.settingsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadSettings();
  }

  private loadSettings(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = localStorage.getItem(this.settingsKey);
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        this.settingsSubject.next({ ...this.defaultSettings, ...settings });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }

  getSettings(): AppSettings {
    return this.settingsSubject.value;
  }

  updateSettings(settings: Partial<AppSettings>): void {
    const currentSettings = this.settingsSubject.value;
    const newSettings = { ...currentSettings, ...settings };
    
    this.settingsSubject.next(newSettings);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.settingsKey, JSON.stringify(newSettings));
    }
  }

  getApiUrl(): string {
    return this.settingsSubject.value.apiUrl;
  }

  setApiUrl(url: string): void {
    this.updateSettings({ apiUrl: url });
  }

  isUsingMockAPI(): boolean {
    return this.settingsSubject.value.useMockAPI;
  }

  toggleMockAPI(useMock: boolean): void {
    this.updateSettings({ useMockAPI: useMock });
  }

  resetToDefaults(): void {
    this.settingsSubject.next(this.defaultSettings);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.settingsKey);
    }
  }
}
