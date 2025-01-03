import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {MenuModule} from 'primeng/menu';
import {ACTION, Media, ProductMedia} from "../../types";
import {UploadImagesComponent} from "../upload-images/upload-images.component";
import {MediaService} from "../../services/media/media.service";
import {catchError, finalize} from "rxjs/operators";
import {of} from "rxjs";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-media-layout',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule, UploadImagesComponent],
  templateUrl: './media-layout.component.html',
  styleUrl: './media-layout.component.css'
})

export class MediaLayoutComponent {
    @Input() productMedia!: ProductMedia;
    @Input() media!: Media;
    @Input({required: true}) action: ACTION = ACTION.CREATE;
    isVisible: boolean = false;
    ACTION = ACTION;
    isLoading: boolean = false

    constructor(private mediaService: MediaService, private messageService: MessageService) {}

    deleteMedia() {
        this.mediaService.deleteMedia(this.media.id).pipe(
            catchError((error) => {
                console.error('Upload failed:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Upload Failed',
                    detail: error
                });
                return of(error);
            }),
            finalize(() => {
                this.isLoading = false;
            })
        ).subscribe((response) => {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Files successfully uploaded!'
            });

        });
    }


    toggle() {this.isVisible = !this.isVisible}
}
