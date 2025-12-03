import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import {
  IonImg,
  IonCol,
  IonRow,
  IonGrid,
  IonContent,
  IonItem,
  IonButton,
  IonTextarea,
  IonToggle,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@components/header/header.component';
import { GalleryService, WinePhoto } from '@services/gallery.service';
import { ActivatedRoute, Data } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { WineService } from '@services/wine.service';

@Component({
  selector: 'app-edit-review',
  templateUrl: 'edit-review.component.html',
  imports: [FormsModule, HeaderComponent, IonButton, IonContent, IonImg, IonRow, IonTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditReviewComponent implements OnInit {
  galleryService = inject(GalleryService);
  route = inject(ActivatedRoute);
  toastService = inject(ToastService);
  wineService = inject(WineService);

  private data: Signal<Data | undefined> = toSignal(this.route.data);

  // Resolver guarantees photo is present
  photo = computed(() => this.data()?.['photo'] as WinePhoto);

  notes: string = '';
  notesCreatedYet = false;

  async submitReview() {
    console.log('Submitting review:', this.notes);

    await this.galleryService.updatePhotoNotes(this.photo().id, this.notes);

    if (!this.notesCreatedYet) {
      this.wineService.addWineReview(this.notes);
    }

    this.toastService.showToast('Wine notes updated');
  }

  ngOnInit(): void {
    const originalNotes = this.photo().wineDetails;

    if (originalNotes && originalNotes.length > 0) {
      this.notesCreatedYet = true;
    } else {
      this.notesCreatedYet = false;
    }

    this.notes = this.photo().wineDetails ?? '';
  }
}
