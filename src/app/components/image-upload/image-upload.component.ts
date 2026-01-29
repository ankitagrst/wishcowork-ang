import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ]
})
export class ImageUploadComponent implements ControlValueAccessor {
  @Input() label: string = 'Upload Image';
  @Input() preview: boolean = true;
  @Input() aspectRatio: string = '1/1'; // For square, or '16/9' etc
  @Input() multiple: boolean = false;

  imageUrl: string = '';
  isUploading: boolean = false;
  error: string = '';

  private onChange: any = () => {};
  private onTouched: any = () => {};

  constructor(private fileService: FileService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      this.error = 'Please upload an image file';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'File size should be less than 5MB';
      return;
    }

    this.isUploading = true;
    this.error = '';

    this.fileService.uploadImage(file).subscribe({
      next: (res) => {
        if (res.success) {
          this.imageUrl = res.url;
          this.onChange(this.imageUrl);
        } else {
          this.error = res.error || 'Upload failed';
        }
        this.isUploading = false;
      },
      error: (err) => {
        this.error = 'Upload error. Please check your connection.';
        this.isUploading = false;
      }
    });
  }

  removeImage(): void {
    this.imageUrl = '';
    this.onChange(this.imageUrl);
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.imageUrl = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }
}
