import {Component, Input, OnInit} from '@angular/core';
import {MessageService} from "primeng/api";
import {CommonModule} from "@angular/common";
import {ToastModule} from "primeng/toast";
import {FileSelectEvent, FileUploadEvent, FileUploadModule} from 'primeng/fileupload';
import {MediaService} from "../../services/media/media.service";
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';
import {ACTION, Media, ProductMedia} from "../../types";

// Constants for validation
const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadEvent {
    originalEvent: Event;
    files: File[];
}

interface ValidationResult {
    isValid: boolean;
    message?: string;
}

@Component({
    selector: 'app-upload-images',
    standalone: true,
    imports: [FileUploadModule, ToastModule, CommonModule],
    templateUrl: './upload-images.component.html',
    styleUrls: ['./upload-images.component.css'],
    providers: [MessageService]
})
export class UploadImagesComponent implements OnInit {
    @Input({required: true}) action: ACTION = ACTION.CREATE;
    @Input() productMedia!: ProductMedia;
    @Input() mediaToUpdate: Media | null = null;

    uploadedFiles: File[] = [];
    isUploading = false;
    remainingSlots = MAX_FILES;

    constructor(
        private messageService: MessageService,
        private mediaService: MediaService
    ) {}

    ngOnInit() {
        this.updateRemainingSlots();
    }

    private updateRemainingSlots(): void {
        if (this.action != ACTION.CREATE) return;
        this.remainingSlots = MAX_FILES - (this.productMedia.media.length + this.uploadedFiles.length);
    }

    private validateFiles(files: File[]): ValidationResult {
        if (files.length > this.remainingSlots && this.action == ACTION.CREATE) {
            return {
                isValid: false,
                message: `Cannot upload more than ${MAX_FILES} files in total. ${this.remainingSlots} slots remaining.`
            };
        }

        for (const file of files) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                return {
                    isValid: false,
                    message: `File "${file.name}" exceeds maximum size of ${MAX_FILE_SIZE_MB}MB`
                };
            }

            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                return {
                    isValid: false,
                    message: `File "${file.name}" has unsupported type. Allowed types: JPG, PNG, WebP`
                };
            }
        }

        return { isValid: true };
    }

    onSelect(event: FileSelectEvent) {
        const validation = this.validateFiles(event.files);

        if (!validation.isValid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: validation.message
            });
            return;
        }

        this.uploadedFiles.push(...event.files);
        this.updateRemainingSlots();

        this.messageService.add({
            severity: 'info',
            summary: 'Files Selected',
            detail: `${event.files.length} file(s) ready for upload. Click Submit to proceed.`
        });
    }

    onRemove(event: { file: File }) {
        console.log(this.remainingSlots)
        this.uploadedFiles = this.uploadedFiles.filter(file => file !== event.file);
        this.updateRemainingSlots();
    }

    onSubmit(event: FileUploadEvent) {
        if (!this.uploadedFiles.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Files',
                detail: 'Please select at least one file before submitting.'
            });
            return;
        }

        this.isUploading = true;
        const formData = new FormData();
        this.uploadedFiles.forEach(file => formData.append("files", file));

        if (this.action == ACTION.UPDATE) this.update(formData)
        else this.create(formData)
    }

    create(formData: FormData) {
        this.mediaService.createMedia(this.productMedia.product.id, formData).pipe(
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
                this.isUploading = false;
            })
        ).subscribe((response) => {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Files successfully uploaded!'
            });
            this.uploadedFiles = [];
            this.updateRemainingSlots();

        });
    }

    update(formData: FormData) {
        if (!this.mediaToUpdate) {
            console.error("need the media first!")
            return;
        }

        this.mediaService.updateMedia(this.mediaToUpdate.id, formData).pipe(
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
                this.isUploading = false;
            })
        ).subscribe((response) => {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Files successfully uploaded!'
            });
            this.uploadedFiles = [];
            this.updateRemainingSlots();

        });
    }

}