// import {Component, inject} from '@angular/core';
// import {BrnDialogContentDirective, BrnDialogTriggerDirective,} from '@spartan-ng/ui-dialog-brain';
// import {
//   HlmDialogComponent,
//   HlmDialogContentComponent,
//   HlmDialogDescriptionDirective,
//   HlmDialogFooterComponent,
//   HlmDialogHeaderComponent,
//   HlmDialogTitleDirective,
// } from '../../ui/ui-dialog-helm/src';
// import {LucideAngularModule} from 'lucide-angular';
// import {CloudinaryService} from '../../../services/cloudinary.service';
// import {CommonModule} from '@angular/common';
// import {MediaService} from "../../../services/media.service";
// // import {AuthService} from "../../../auth/auth.service";
// import {HlmInputDirective} from "../../ui/ui-input-helm/src";
// import {HlmLabelDirective} from "../../ui/ui-label-helm/src";
// import {HlmButtonDirective} from "../../ui/ui-button-helm/src";
//
// @Component({
//   selector: 'spartan-dialog-previe',
//   standalone: true,
//   imports: [
//     CommonModule,
//     BrnDialogTriggerDirective,
//     BrnDialogContentDirective,
//     LucideAngularModule,
//     HlmDialogComponent,
//     HlmDialogContentComponent,
//     HlmDialogHeaderComponent,
//     HlmDialogFooterComponent,
//     HlmDialogTitleDirective,
//     HlmDialogDescriptionDirective,
//
//     HlmLabelDirective,
//     HlmInputDirective,
//     HlmButtonDirective,
//   ],
//   template: `
//     <hlm-dialog>
//       <button class="space-x-2" id="edit-profile" brnDialogTrigger hlmBtn>
//         <lucide-icon name="square-user-round"></lucide-icon>
//         Ajouter/modifier avatar
//       </button>
//       <hlm-dialog-content class="sm:max-w-[425px]" *brnDialogContent="let ctx">
//         <hlm-dialog-header>
//           <h3 hlmDialogTitle>Edit profile</h3>
//           <p hlmDialogDescription>
//             Make changes to your profile here. Click save when you're done.
//           </p>
//         </hlm-dialog-header>
//         <input
//           type="file"
//           (change)="onFileSelected($event)"
//           accept="image/*"
//           id="avatar"
//           hlmInput
//         />
//         <div class="items-center grid grid-cols-4 gap-4">
//           <label hlmLabel for="avatar" class="text-right">Avatar</label>
//           <div class="col-span-3">
//
//
//           </div>
//         </div>
//         <hlm-dialog-footer>
//           <button hlmBtn (click)="uploadAvatar()" [disabled]="!selectedFile">
//             Upload Avatar
//           </button>
//         </hlm-dialog-footer>
//       </hlm-dialog-content>
//     </hlm-dialog>
//   `,
// })
// export class AvatarDialogComponent {
//   selectedFile: File | null = null;
//   avatarUrl: string | null = null;
//   // authService = inject(AuthService);
//   cloudinaryService = inject(CloudinaryService);
//   mediaService = inject(MediaService);  // Inject the MediaService
//   onFileSelected(event: any): void {
//     this.selectedFile = event.target.files[0] as File;
//   }
//
//   uploadAvatar(): void {
//     if (this.selectedFile) {
//       this.cloudinaryService.uploadImage(this.selectedFile).subscribe(
//         (url) => {
//           this.avatarUrl = url;
//           this.uploadAvatarUrlToServer(url);
//           console.log('Avatar uploaded successfully. Image URL:', url);
//         },
//         (error) => {
//           console.error('Error uploading avatar:', error);
//         }
//       );
//     }
//   }
//
//   uploadAvatarUrlToServer(url: string): void {
//     if (this.selectedFile) {
//       // this.mediaService.uploadMedia(this.authService.getUserId(), url, "avatar").subscribe(
//       //   (response) => {
//       //     console.log('Avatar URL uploaded to server successfully:', response);
//       //   },
//       //   (error) => {
//       //     console.error('Error uploading avatar URL to server:', error);
//       //   }
//       // );
//     }
//   }
//   saveChanges(): void {
//     // Implement save logic here, including the new avatar URL
//     console.log('Saving changes with new avatar URL:', this.avatarUrl);
//     // Close the dialog or perform other actions as needed
//   }
// }
