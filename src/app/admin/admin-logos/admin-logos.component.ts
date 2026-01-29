import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { EnterpriseLogo } from '../../models/property.model';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-logos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './admin-logos.component.html',
  styleUrl: './admin-logos.component.scss'
})
export class AdminLogosComponent implements OnInit, OnDestroy {
  logos: EnterpriseLogo[] = [];
  logoForm: FormGroup;
  isEditing = false;
  currentLogoId: string | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private propertyService: PropertyService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.logoForm = this.fb.group({
      name: ['', [Validators.required]],
      logoUrl: ['', [Validators.required]],
      displayOrder: [0]
    });
  }

  ngOnInit(): void {
    this.loadLogos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLogos(): void {
    this.loading = true;
    this.propertyService.getEnterpriseLogos(false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logos) => {
          this.logos = logos;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading logos:', error);
          this.errorMessage = 'Failed to load logos';
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.logoForm.invalid) return;

    this.loading = true;
    const logoData = this.logoForm.value;

    if (this.isEditing && this.currentLogoId) {
      const updatedLogo = { ...logoData, id: this.currentLogoId };
      this.propertyService.updateEnterpriseLogo(updatedLogo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.successMessage = 'Logo updated successfully';
              this.resetForm();
              this.loadLogos();
            } else {
              this.errorMessage = 'Failed to update logo';
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error updating logo:', error);
            this.errorMessage = 'Failed to update logo';
            this.loading = false;
          }
        });
    } else {
      this.propertyService.addEnterpriseLogo(logoData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.successMessage = 'Logo added successfully';
              this.resetForm();
              this.loadLogos();
            } else {
              this.errorMessage = 'Failed to add logo';
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error adding logo:', error);
            this.errorMessage = 'Failed to add logo';
            this.loading = false;
          }
        });
    }
  }

  editLogo(logo: EnterpriseLogo): void {
    this.isEditing = true;
    this.currentLogoId = logo.id;
    this.logoForm.patchValue({
      name: logo.name,
      logoUrl: logo.logoUrl,
      displayOrder: logo.displayOrder || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteLogo(id: string): void {
    if (confirm('Are you sure you want to delete this logo?')) {
      this.loading = true;
      this.propertyService.deleteEnterpriseLogo(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.successMessage = 'Logo deleted successfully';
              this.loadLogos();
            } else {
              this.errorMessage = 'Failed to delete logo';
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error deleting logo:', error);
            this.errorMessage = 'Failed to delete logo';
            this.loading = false;
          }
        });
    }
  }

  resetForm(): void {
    this.logoForm.reset({ displayOrder: 0 });
    this.isEditing = false;
    this.currentLogoId = null;
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
