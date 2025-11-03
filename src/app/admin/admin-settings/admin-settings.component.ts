import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss'
})
export class AdminSettingsComponent implements OnInit {
  apiUrl: string = '';
  useMockAPI: boolean = true;
  saveMessage: string = '';
  testingConnection: boolean = false;
  connectionStatus: 'idle' | 'success' | 'error' = 'idle';

  constructor(
    private settingsService: SettingsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const settings = this.settingsService.getSettings();
    this.apiUrl = settings.apiUrl;
    this.useMockAPI = settings.useMockAPI;
  }

  saveSettings(): void {
    // Trim and validate URL
    this.apiUrl = this.apiUrl.trim();
    
    if (!this.apiUrl) {
      this.showMessage('Please enter a valid API URL', 'error');
      return;
    }

    // Remove trailing slash if present
    if (this.apiUrl.endsWith('/')) {
      this.apiUrl = this.apiUrl.slice(0, -1);
    }

    // Update settings
    this.settingsService.updateSettings({
      apiUrl: this.apiUrl,
      useMockAPI: this.useMockAPI
    });

    this.showMessage('Settings saved successfully! Please refresh to apply changes.', 'success');
  }

  testConnection(): void {
    this.testingConnection = true;
    this.connectionStatus = 'idle';

    // Try to fetch from the API
    fetch(`${this.apiUrl}/`)
      .then(response => response.json())
      .then(data => {
        this.testingConnection = false;
        this.connectionStatus = 'success';
        this.showMessage('Connection successful! API is reachable.', 'success');
      })
      .catch(error => {
        this.testingConnection = false;
        this.connectionStatus = 'error';
        this.showMessage('Connection failed. Please check the URL.', 'error');
      });
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset to default settings?')) {
      this.settingsService.resetToDefaults();
      const settings = this.settingsService.getSettings();
      this.apiUrl = settings.apiUrl;
      this.useMockAPI = settings.useMockAPI;
      this.showMessage('Settings reset to defaults', 'success');
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.saveMessage = message;
    setTimeout(() => {
      this.saveMessage = '';
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
