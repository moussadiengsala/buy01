// import {Component, inject} from '@angular/core';
// import {BrnDialogContentDirective, BrnDialogTriggerDirective} from '@spartan-ng/ui-dialog-brain';
// import {
//   HlmDialogComponent,
//   HlmDialogContentComponent,
//   HlmDialogDescriptionDirective,
//   HlmDialogFooterComponent,
//   HlmDialogHeaderComponent,
//   HlmDialogTitleDirective,
// } from '../../ui/ui-dialog-helm/src';
// import {HlmInputDirective} from '../../ui/ui-input-helm/src';
// import {HlmLabelDirective} from '../../ui/ui-label-helm/src';
// import {LucideAngularModule} from 'lucide-angular';
// import {ProductService} from "../../../services/product.service";
// import {MediaService} from "../../../services/media.service";
// import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
// // import {AuthService} from "../../../auth/auth.service";
// import {forkJoin} from 'rxjs';
// import {CloudinaryService} from "../../../services/cloudinary.service";
// import {CommonModule} from '@angular/common';
// import {HlmButtonDirective} from "../../ui/ui-button-helm/src";
//
// @Component({
//   selector: 'spartan-dialog-preview',
//   standalone: true,
//   imports: [
//     BrnDialogTriggerDirective,
//     BrnDialogContentDirective,
//     LucideAngularModule,
//     HlmDialogComponent,
//     HlmDialogContentComponent,
//     HlmDialogHeaderComponent,
//     HlmDialogFooterComponent,
//     HlmDialogTitleDirective,
//     HlmDialogDescriptionDirective,
//     HlmLabelDirective,
//     HlmInputDirective,
//     HlmButtonDirective,
//     ReactiveFormsModule,
//     CommonModule,
//   ],
//   template: `
//     <hlm-dialog #dialog>
//       <button class="bg-foreground hover:bg-muted-foreground" id="create-product" brnDialogTrigger hlmBtn>
//         Publier un nouveau produit
//       </button>
//       <hlm-dialog-content class="sm:max-w-[425px]" *brnDialogContent="let ctx">
//         <hlm-dialog-header>
//           <h3 hlmDialogTitle>Ajouter un produit</h3>
//           <p hlmDialogDescription>
//             Remplissez les informations pour créer un nouveau produit. Cliquez
//             sur "Publier" une fois terminé.
//           </p>
//         </hlm-dialog-header>
//         <form [formGroup]="ProductForm" (ngSubmit)="OnSubmit(dialog)">
//           <div class="py-4 grid gap-4">
//             <div class="items-center grid grid-cols-4 gap-4">
//               <input
//                 hlmInput
//                 id="product-name"
//                 placeholder="Nom du produit"
//                 formControlName="name"
//                 class="col-span-4"
//               />
//             </div>
//             <div class="items-center grid grid-cols-4 gap-4">
//               <input
//                 hlmInput
//                 id="product-price"
//                 type="number"
//                 placeholder="Prix du produit"
//                 formControlName="price"
//                 class="col-span-4"
//               />
//             </div>
//             <div class="items-center grid grid-cols-4 gap-4">
//               <input
//                 hlmInput
//                 id="product-quantity"
//                 type="number"
//                 placeholder="Quantité du produit"
//                 formControlName="quantity"
//                 class="col-span-4"
//               />
//             </div>
//             <div formArrayName="imageInputs" class="space-y-2">
//               <div *ngFor="let imageInput of imageInputs.controls; let i = index" class="flex items-center space-x-2">
//                 <input
//                   hlmInput
//                   type="file"
//                   accept="image/*"
//                   (change)="onFileChange($event, i)"
//                   class="flex-grow"
//                 />
//                 <button hlmBtn type="button" (click)="removeImageInput(i)" *ngIf="i > 0">
//                   <lucide-icon name="trash-2"></lucide-icon>
//                 </button>
//               </div>
//               <button hlmBtn type="button" (click)="addImageInput()" class="w-full">
//                 Ajouter une autre image
//               </button>
//             </div>
//           </div>
//           <div class="flex flex-col gap-4">
//             <input
//               hlmInput
//               id="product-description"
//               placeholder="Description du produit"
//               formControlName="description"
//               class="w-full"
//             />
//             <button
//               class="w-full space-x-2"
//               disabled
//               hlmBtn
//               type="button"
//             >
//               <span>Générer la description par AI</span>
//               <lucide-icon class="w-4 h-4" name="sparkles"></lucide-icon>
//             </button>
//           </div>
//           <hlm-dialog-footer>
//             <button variant="outline" hlmBtn type="submit" [disabled]="!ProductForm.valid || isSubmitting">
//               {{ isSubmitting ? 'Publication en cours...' : 'Publier' }}
//             </button>
//           </hlm-dialog-footer>
//         </form>
//       </hlm-dialog-content>
//     </hlm-dialog>
//   `,
// })
// export class DialogPreviewComponent {
//   productService = inject(ProductService);
//   mediaService = inject(MediaService);
//   // authService = inject(AuthService);
//   cloudinaryService = inject(CloudinaryService);
//   fb = inject(FormBuilder);
//   isSubmitting = false;
//   selectedFiles: (File | null)[] = [];
//
//   protected ProductForm: FormGroup;
//
//   constructor() {
//     this.ProductForm = this.fb.group({
//       name: ['', Validators.required],
//       description: ['', Validators.required],
//       price: ['', Validators.required],
//       quantity: ['', Validators.required],
//       imageInputs: this.fb.array([this.fb.control(null)])
//     });
//   }
//
//   get imageInputs() {
//     return this.ProductForm.get('imageInputs') as FormArray;
//   }
//
//   addImageInput() {
//     this.imageInputs.push(this.fb.control(null));
//     this.selectedFiles.push(null);
//   }
//
//   removeImageInput(index: number) {
//     this.imageInputs.removeAt(index);
//     this.selectedFiles.splice(index, 1);
//   }
//
//   onFileChange(event: Event, index: number) {
//     const element = event.target as HTMLInputElement;
//     if (element.files && element.files.length > 0) {
//       this.selectedFiles[index] = element.files[0];
//     } else {
//       this.selectedFiles[index] = null;
//     }
//   }
//
//   async OnSubmit(dialog: HlmDialogComponent) {
//     if (this.ProductForm.valid) {
//       this.isSubmitting = true;
//       try {
//         // First, create the product
//         const productResponse = await this.productService.createProduct({
//           ...this.ProductForm.value,
//           // ownerId: this.authService.getUserId()
//         }).toPromise();
//
//         if (productResponse && productResponse.id) {
//           // Filter out null values from selectedFiles
//           const filesToUpload = this.selectedFiles.filter((file): file is File => file !== null);
//
//           // Upload images to Cloudinary
//           const cloudinaryUploadObservables = filesToUpload.map(file =>
//             this.cloudinaryService.uploadImage(file)
//           );
//
//           forkJoin(cloudinaryUploadObservables).subscribe({
//             next: (cloudinaryUrls) => {
//               // Now use MediaService to associate Cloudinary URLs with the product
//               const mediaUploadObservables = cloudinaryUrls.map(url =>
//                 this.mediaService.uploadMedia(productResponse.id, url, 'product')
//               );
//
//               forkJoin(mediaUploadObservables).subscribe({
//                 next: (results) => {
//                   console.log('All images associated successfully', results);
//                   dialog.close('success');
//                   this.ProductForm.reset();
//                   this.selectedFiles = [null];
//                   this.resetImageInputs();
//                   this.productService.notifyProductChanged("create");
//                 },
//                 error: (error) => {
//                   console.error('Error associating images', error);
//                 },
//                 complete: () => {
//                   this.isSubmitting = false;
//                 }
//               });
//             },
//             error: (error) => {
//               console.error('Error uploading images to Cloudinary', error);
//               this.isSubmitting = false;
//             }
//           });
//         }
//       } catch (error) {
//         console.error('Error creating product', error);
//         this.isSubmitting = false;
//       }
//     }
//   }
//
//   resetImageInputs() {
//     while (this.imageInputs.length > 1) {
//       this.imageInputs.removeAt(1);
//     }
//     this.imageInputs.reset();
//   }
// }
