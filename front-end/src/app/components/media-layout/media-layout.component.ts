import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {MenuModule} from 'primeng/menu';
import {ACTION, Media, ProductMedia, ToastMessage} from "../../types";
import {UploadImagesComponent} from "../upload-images/upload-images.component";
import {MediaService} from "../../services/media/media.service";
import {catchError, finalize} from "rxjs/operators";
import {of} from "rxjs";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {DialogModule} from "primeng/dialog";
import {ModalComponent} from "../modal/modal.component";

@Component({
    selector: 'app-media-layout',
    standalone: true,
    imports: [CommonModule, ModalComponent, MenuModule, ButtonModule, UploadImagesComponent, ToastModule, DialogModule],
    templateUrl: './media-layout.component.html',
    styleUrl: './media-layout.component.css'
})

export class MediaLayoutComponent {
    @Input() productMedia!: ProductMedia;
    @Input() media!: Media;
    @Input({required: true}) action: ACTION = ACTION.CREATE;
    @Output() isComplete = new EventEmitter<ToastMessage>()

    isVisible: boolean = false;
    ACTION = ACTION;
    isLoading: boolean = false;

    constructor(private mediaService: MediaService, private messageService: MessageService) {}

    deleteMedia() {
        this.mediaService.deleteMedia(this.media.id).pipe(
            catchError((error) => {
                this.toggle()
                this.isComplete.emit({
                    severity: 'error',
                    summary: 'Delete Failed',
                    detail: error?.error?.message,
                    status: "FAILED"
                });
                return of(error);
            }),
            finalize(() => {
                this.isLoading = false;
            })
        ).subscribe((response) => {
            this.toggle()
            this.isComplete.emit({
                severity: 'success',
                summary: 'Success',
                detail: response?.message || 'Files successfully deleted!',
                status: "OK"
            });
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }


    handleEvent(event: ToastMessage) {
        console.log(event)
        if (event.status == "OK") {
            this.toggle()
            this.isComplete.emit(event)
            return;
        }
        this.messageService.add(event)
    }

    getDialogHeader(): string {
        switch (this.action) {
            case ACTION.CREATE:
                return 'Create Media';
            case ACTION.UPDATE:
                return 'Update Media';
            case ACTION.DELETE:
                return 'Delete Media';
            default:
                return 'Edit Media';
        }
    }
}
