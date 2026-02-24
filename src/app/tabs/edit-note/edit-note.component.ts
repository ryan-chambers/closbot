import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { IonImg, IonRow, IonContent, IonButton, IonTextarea } from '@ionic/angular/standalone';
import { HeaderComponent } from '@components/header/header.component';
import { GalleryService } from '@services/gallery.service';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { WineService } from '@services/wine.service';
import { ContentService } from '@services/content.service';
import { enEditNote, frEditNote } from './edit-note.component.content';
import { WinePhoto } from '@models/photo.model';

@Component({
  selector: 'app-edit-note',
  templateUrl: 'edit-note.component.html',
  imports: [FormsModule, HeaderComponent, IonButton, IonContent, IonImg, IonRow, IonTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditNoteComponent implements OnInit {
  private readonly galleryService = inject(GalleryService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly wineService = inject(WineService);
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);

  readonly SWIPE_THRESHOLD = 50;

  private data: Signal<Data | undefined> = toSignal(this.route.data);

  // Resolver guarantees photo is present
  photo = computed(() => this.data()?.['photo'] as WinePhoto);

  notes = '';
  notesCreatedYet = false;

  private touchStartX = 0;

  content = this.contentService.registerComponentContent(
    enEditNote,
    frEditNote,
    'EditNoteComponent',
  );

  captureDate = computed(() => {
    const p = this.photo();
    if (!p.date) {
      return '';
    }
    const date = new Date(p.date);
    return date.toLocaleDateString(this.contentService.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  async submitNote() {
    console.log('Submitting note:', this.notes);

    await this.galleryService.updatePhotoNotes(this.photo().id, this.notes);

    if (!this.notesCreatedYet) {
      this.wineService.addWineNote(this.notes);
    }

    this.toastService.showToast(this.content().updateWineNotes);
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

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    const deltaX = event.changedTouches[0].screenX - this.touchStartX;

    let nextPhotoId = undefined;
    if (deltaX < -this.SWIPE_THRESHOLD) {
      nextPhotoId = this.galleryService.getNextPhotoId(this.photo().id);
    } else if (deltaX > this.SWIPE_THRESHOLD) {
      nextPhotoId = this.galleryService.getPreviousPhotoId(this.photo().id);
    }

    if (nextPhotoId) {
      this.router.navigate(['/tabs/edit-note', nextPhotoId]);
    }
  }
}
