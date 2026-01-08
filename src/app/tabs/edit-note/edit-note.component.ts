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
import { GalleryService, WinePhoto } from '@services/gallery.service';
import { ActivatedRoute, Data } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { WineService } from '@services/wine.service';
import { ContentService } from '@services/content.service';
import { enEditNote, frEditNote } from './edit-note.component.content';

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

  private data: Signal<Data | undefined> = toSignal(this.route.data);

  // Resolver guarantees photo is present
  photo = computed(() => this.data()?.['photo'] as WinePhoto);

  notes = '';
  notesCreatedYet = false;

  content = this.contentService.registerComponentContent(
    enEditNote,
    frEditNote,
    'EditNoteComponent',
  );

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
}
