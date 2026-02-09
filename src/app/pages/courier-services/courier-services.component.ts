import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-courier-services',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './courier-services.component.html',
  styleUrls: ['./courier-services.component.scss']
})
export class CourierServicesComponent {
  courierForm: FormGroup;
  submitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';

  couriers = [
    { name: 'DHL Express', logo: 'assets/images/couriers/dhl.png', description: 'Global shipping and delivery services.' },
    { name: 'Blue Dart', logo: 'assets/images/couriers/bluedart.png', description: 'Premier express air and integrated transportation.' },
    { name: 'FedEx', logo: 'assets/images/couriers/fedex.png', description: 'Fast, reliable delivery to more than 220 countries.' },
    { name: 'Delhivery', logo: 'assets/images/couriers/delhivery.png', description: 'Supply chain services and e-commerce logistics.' }
  ];

  constructor(private fb: FormBuilder, private propertyService: PropertyService) {
    this.courierForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      pickupAddress: ['', Validators.required],
      destinationAddress: ['', Validators.required],
      courierPartner: ['DHL Express', Validators.required],
      weight: ['', Validators.required],
      packageDetails: ['']
    });
  }

  onSubmit() {
    if (this.courierForm.invalid) {
      this.courierForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = false;
    this.submitSuccess = false;

    const formValue = this.courierForm.value;
    const payload = {
      type: 'courier',
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      message: `Pickup: ${formValue.pickupAddress}\nDestination: ${formValue.destinationAddress}\nPartner: ${formValue.courierPartner}\nWeight: ${formValue.weight} kg\nDetails: ${formValue.packageDetails || 'N/A'}`
    };

    this.propertyService.submitEnquiry(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.submitSuccess = true;
        this.courierForm.reset({ courierPartner: 'DHL Express' });
        setTimeout(() => this.submitSuccess = false, 5000);
      },
      error: (err) => {
        console.error('Failed to submit courier enquiry:', err);
        this.submitting = false;
        this.submitError = true;
        this.errorMessage = 'Failed to submit your request. Please try again or contact support.';
        setTimeout(() => this.submitError = false, 5000);
      }
    });
  }
}
