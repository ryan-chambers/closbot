import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { IonButton, IonContent, IonTextarea, IonToggle } from '@ionic/angular/standalone';
import { HeaderComponent } from '@components/header/header.component';
import { GalleryService } from '@services/gallery.service';
import { WineService } from '@services/wine.service';
import { ToastService } from '@services/toast.service';

function isValidReview(review?: string): boolean {
  return (review ?? '').trim().length > 0;
}

@Component({
  selector: 'app-add-review',
  templateUrl: 'add-review.component.html',
  styleUrl: 'add-review.component.scss',
  imports: [
    FormsModule,
    HeaderComponent,
    IonButton,
    IonContent,
    IonTextarea,
    IonToggle,
    ReactiveFormsModule,
  ],
})
export class AddReviewComponent {
  galleryService = inject(GalleryService);
  wineService = inject(WineService);
  toastService = inject(ToastService);

  reviewForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group(
      {
        review: '',
        includePhoto: [true],
        includeReview: [true],
      },
      {
        validators: (formGroup: AbstractControl): ValidationErrors | null => {
          const includeReview = formGroup.get('includeReview')?.value;
          const includePhoto = formGroup.get('includePhoto')?.value;

          const reviewValue = formGroup.get('review')?.value;

          if (!includePhoto && !includeReview) {
            return { requireAtLeastOne: true };
          } else if (includeReview && !isValidReview(reviewValue)) {
            return { reviewRequired: true };
          }

          return null;
        },
      },
    );
  }

  // Use cases:
  // 1. Photo toggle on, photo submitted, review : save photo with review, then submit review to RAG
  // 2. Photo toggle off, review only: submit review to RAG
  // 3. Photo toggle on, photo submitted, not review: save photo with empty review, do not submit to RAG
  // 4. Photo toggle on, no photo submitted: error case: show toast
  submitReview() {
    const review = this.reviewForm.controls['review'].value;
    const includePhoto: boolean = this.reviewForm.controls['includePhoto'].value;
    const includeReview: boolean = this.reviewForm.controls['includeReview'].value;

    // should this logic (save photo, upsert notes) be consolidated in the wine service instead?
    if (includePhoto) {
      this.galleryService.addNewToGallery(review).then((savedPhoto) => {
        if (savedPhoto) {
          if (includeReview) {
            this.upsertWineReview(review);
          } else {
            // review can be added later - do nothing for now
            this.toastService.showToast('Wine photo saved.');
          }
          return;
        } else {
          this.toastService.showToast('Since no photo was taken, review was not submitted.');
        }
      });
    } else if (includeReview) {
      this.upsertWineReview(review);
    } else {
      // should not be possible due to validation
      console.warn(`Neither photo nor review included; nothing to submit.`);
    }
  }

  async upsertWineReview(review: string): Promise<void> {
    this.wineService.addWineReview(review).then(() => {
      this.reviewForm.reset();
      this.reviewForm.controls['includePhoto'].setValue(true);
      this.reviewForm.controls['includeReview'].setValue(true);
    });
  }
}
