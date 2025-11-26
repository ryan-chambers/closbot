import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonButton, IonContent, IonTextarea, IonToggle } from '@ionic/angular/standalone';
import { HeaderComponent } from '@components/header/header.component';
import { GalleryService } from '@services/gallery.service';
import { WineService } from '@services/wine.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-add-review',
  templateUrl: 'add-review.component.html',
  imports: [
    FormsModule,
    HeaderComponent,
    IonButton,
    IonContent,
    IonTextarea,
    IonToggle,
    ReactiveFormsModule,
  ],
  standalone: true,
})
export class AddReviewComponent {
  galleryService = inject(GalleryService);
  wineService = inject(WineService);
  toastService = inject(ToastService);

  reviewForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      review: ['', Validators.required],
      includePhoto: [true],
    });
  }

  submitReview() {
    const review = this.reviewForm.controls['review'].value;
    if (this.reviewForm.controls['includePhoto'].value) {
      this.galleryService.addNewToGallery(review).then((savedPhoto) => {
        if (savedPhoto) {
          this.submitWineReview(review);
          return;
        } else {
          this.toastService.showToast('Since no photo was taken, review was not submitted.');
        }
      });
    } else {
      this.submitWineReview(review);
    }
  }

  async submitWineReview(review: string): Promise<void> {
    this.wineService.addWineReview(review).then(() => {
      this.reviewForm.reset();
      this.reviewForm.controls['includePhoto'].setValue(true);
    });
  }
}
