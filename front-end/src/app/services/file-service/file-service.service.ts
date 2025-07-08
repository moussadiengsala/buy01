
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FileData {
  file: File;
  fileName: string;
  preview: string | ArrayBuffer | null;
  size: number;
  type: string;
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private fileDataSubject = new BehaviorSubject<FileData | null>(null);
  public fileData$ = this.fileDataSubject.asObservable();

  private defaultValidationOptions: FileValidationOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
  };

  /**
   * Validates a file against the provided options
   */
  validateFile(file: File, options?: FileValidationOptions): FileValidationResult {
    const validationOptions = { ...this.defaultValidationOptions, ...options };
    const errors: string[] = [];

    // Check file size
    if (validationOptions.maxSize && file.size > validationOptions.maxSize) {
      const maxSizeMB = validationOptions.maxSize / (1024 * 1024);
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }

    // Check file type
    if (validationOptions.allowedTypes && !validationOptions.allowedTypes.includes(file.type)) {
      const typesList = validationOptions.allowedTypes.join(', ');
      errors.push(`File type not allowed. Allowed types: ${typesList}`);
    }

    // Check file extension
    if (validationOptions.allowedExtensions) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validationOptions.allowedExtensions.includes(fileExtension)) {
        const extensionsList = validationOptions.allowedExtensions.join(', ');
        errors.push(`File extension not allowed. Allowed extensions: ${extensionsList}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Processes a file selection event
   */
  async onFileSelected(event: Event, validationOptions?: FileValidationOptions): Promise<FileValidationResult> {
    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files[0]) {
      return { isValid: false, errors: ['No file selected'] };
    }

    const file = input.files[0];
    const validation = this.validateFile(file, validationOptions);

    if (!validation.isValid) {
      return validation;
    }

    try {
      const preview = await this.createPreview(file);
      const fileData: FileData = {
        file,
        fileName: file.name,
        preview,
        size: file.size,
        type: file.type
      };

      this.fileDataSubject.next(fileData);
      return { isValid: true, errors: [] };
    } catch (error) {
      return { isValid: false, errors: ['Failed to process file'] };
    }
  }

  /**
   * Creates a preview of the file (base64 data URL)
   */
  private createPreview(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        resolve(e.target?.result || null);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Removes the current file
   */
  removeFile(): void {
    this.fileDataSubject.next(null);
  }

  /**
   * Resets a file input element
   */
  resetFileInput(inputId: string): void {
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Gets the current file data
   */
  getCurrentFileData(): FileData | null {
    return this.fileDataSubject.value;
  }

  /**
   * Checks if a file is currently selected
   */
  hasFile(): boolean {
    return this.fileDataSubject.value !== null;
  }

  /**
   * Gets the file preview URL
   */
  getPreviewUrl(): string | ArrayBuffer | null {
    const fileData = this.getCurrentFileData();
    return fileData ? fileData.preview : null;
  }

  /**
   * Gets the selected file
   */
  getFile(): File | null {
    const fileData = this.getCurrentFileData();
    return fileData ? fileData.file : null;
  }

  /**
   * Gets the file name
   */
  getFileName(): string | null {
    const fileData = this.getCurrentFileData();
    return fileData ? fileData.fileName : null;
  }

  /**
   * Formats file size to human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Converts file to base64 string
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix if present
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to convert file to base64'));
      reader.readAsDataURL(file);
    });
  }
}


// @Injectable({
//   providedIn: 'root'
// })
// export class FileServiceComponent {
//   avatarPreview: string | ArrayBuffer | null = null;
//   avatarFileName: string | null = null;
//   avatarFile: File | null = null;
//
//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files[0]) {
//       const file = input.files[0];
//
//       // Validate file type
//       if (!file.type.match(/image\/(jpeg|png|gif)$/)) {
//         alert('Please select a valid image file (JPEG, PNG, or GIF)');
//         return;
//       }
//
//       // Validate file size (10MB max)
//       if (file.size > 10 * 1024 * 1024) {
//         alert('File size must be less than 10MB');
//         return;
//       }
//
//       this.avatarFile = file;
//       this.avatarFileName = file.name;
//
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (e: ProgressEvent<FileReader>) => {
//         this.avatarPreview = e.target?.result as string;
//       };
//       reader.readAsDataURL(file);
//     }
//   }
//
//   removeAvatar(): void {
//     this.avatarFile = null;
//     this.avatarPreview = null;
//     this.avatarFileName = null;
//
//     // Reset the file input
//     const fileInput = document.getElementById('avatar') as HTMLInputElement;
//     if (fileInput) {
//       fileInput.value = '';
//     }
//   }
// }
