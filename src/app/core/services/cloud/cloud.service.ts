import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private cloudName = 'dwmcbow10';
  private uploadPreset = 'ml_default';
  private apiKey = '341472675566573';
  private http = inject(HttpClient);

  private apiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('api_key', this.apiKey);

    return this.http
      .post(this.apiUrl, formData, {
        headers: new HttpHeaders().set('X-Requested-With', 'XMLHttpRequest'),
      })
      .pipe(
        map((response: any) => {
          if (response && response.secure_url) {
            return response.secure_url;
          }
          throw new Error('Failed to get image URL from response');
        })
      );
  }
}