import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { WineService } from '../services/wine.service';
import { GalleryService } from '../services/gallery.service';
import { IonButton, IonToggle } from '@ionic/angular/standalone';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-add-review',
  templateUrl: 'add-review.component.html',
  styleUrls: ['add-review.component.scss'],
  imports: [CommonModule, FormsModule, IonButton, IonToggle, ReactiveFormsModule, TabComponent],
  standalone: true,
})
export class AddReviewComponent {
  galleryService = inject(GalleryService);
  wineService = inject(WineService);

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
      this.galleryService.addNewToGallery(review).then(() => {
        this.submitWineReview(review);
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
