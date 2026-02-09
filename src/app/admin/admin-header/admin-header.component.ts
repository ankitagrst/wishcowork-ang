import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.component.html'
})
export class AdminHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showView: boolean = true;
  @Input() showLogout: boolean = true;

  constructor(private router: Router, private auth: AuthService) {}

  viewWebsite() {
    this.router.navigate(['/']);
  }

  logout() {
    this.auth.logout();
  }
}
