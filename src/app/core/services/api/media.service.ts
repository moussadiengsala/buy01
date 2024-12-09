import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = '/api/media';  // URL to Media Microservice

  constructor(private http: HttpClient) { }

  uploadMedia(files: FileList) {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  deleteMedia(mediaId: string) {
    return this.http.delete(`${this.apiUrl}/${mediaId}`);
  }
}
