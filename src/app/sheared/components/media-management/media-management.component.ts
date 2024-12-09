import { Component } from '@angular/core';
import { MediaService } from '../../../core/services/api/media.service';

@Component({
  selector: 'app-media-management',
  standalone: true,
  imports: [],
  templateUrl: './media-management.component.html',
  styleUrl: './media-management.component.css'
})
export class MediaManagementComponent {
  mediaFiles: any[] = [];

  constructor(private mediaService: MediaService) { }

  uploadMedia(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.mediaService.uploadMedia(files).subscribe((response: any) => {
        this.mediaFiles.push(...response);
      });
    }
  }

  deleteMedia(mediaId: string) {
    this.mediaService.deleteMedia(mediaId).subscribe(() => {
      this.mediaFiles = this.mediaFiles.filter(m => m.id !== mediaId);
    });
  }
}
