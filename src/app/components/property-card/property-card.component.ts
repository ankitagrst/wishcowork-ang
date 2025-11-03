import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Property } from '../../models/property.model';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss'
})
export class PropertyCardComponent {
  @Input() property!: Property;

  constructor(private propertyService: PropertyService) {}

  getPropertyUrl(): string {
    return this.propertyService.getPropertyUrl(this.property);
  }

  get categoryDisplay(): string {
    const categoryNames: { [key: string]: string } = {
      'virtual-office': 'Virtual Office',
      'coworking': 'Coworking Space',
      'private-office': 'Private Office',
      'meeting-room': 'Meeting Room'
    };
    return categoryNames[this.property.category] || this.property.category;
  }

  get cityDisplay(): string {
    return this.property.city.charAt(0).toUpperCase() + this.property.city.slice(1);
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/workspace-placeholder.svg';
  }
}
