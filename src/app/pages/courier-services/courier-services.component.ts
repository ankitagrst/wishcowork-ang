import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  couriers = [
    { name: 'DHL Express', logo: 'assets/images/couriers/dhl.png', description: 'Global shipping and delivery services.' },
    { name: 'Blue Dart', logo: 'assets/images/couriers/bluedart.png', description: 'Premier express air and integrated transportation.' },
    { name: 'FedEx', logo: 'assets/images/couriers/fedex.png', description: 'Fast, reliable delivery to more than 220 countries.' },
    { name: 'Delhivery', logo: 'assets/images/couriers/delhivery.png', description: 'Supply chain services and e-commerce logistics.' }
  ];

  constructor(private fb: FormBuilder) {
    this.courierForm = this.fb.group({
      name: ['', Validators.required],
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
    // Simulate API call
    setTimeout(() => {
      this.submitting = false;
      this.submitSuccess = true;
      this.courierForm.reset({ courierPartner: 'DHL Express' });
      setTimeout(() => this.submitSuccess = false, 5000);
    }, 1500);
  }
}
