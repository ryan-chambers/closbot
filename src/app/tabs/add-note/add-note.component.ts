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
import { ContentService } from '@services/content.service';
import { enAddNoteContent, frAddNoteContent } from './add-note.component.content';

function isValidNote(note?: string): boolean {
  return (note ?? '').trim().length > 0;
}

@Component({
  selector: 'app-add-note',
  templateUrl: 'add-note.component.html',
  styleUrl: 'add-note.component.scss',
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
export class AddNoteComponent {
  private readonly galleryService = inject(GalleryService);
  private readonly wineService = inject(WineService);
  private readonly toastService = inject(ToastService);
  private readonly contentService = inject(ContentService);
  private readonly fb = inject(FormBuilder);

  content = this.contentService.registerComponentContent(
    enAddNoteContent,
    frAddNoteContent,
    'AddNoteComponent',
  );

  noteForm: FormGroup;

  constructor() {
    this.noteForm = this.fb.group(
      {
        note: '',
        includePhoto: [true],
        includeNote: [true],
      },
      {
        validators: (formGroup: AbstractControl): ValidationErrors | null => {
          const includeNote = formGroup.get('includeNote')?.value;
          const includePhoto = formGroup.get('includePhoto')?.value;

          const noteValue = formGroup.get('note')?.value;

          if (!includePhoto && !includeNote) {
            return { requireAtLeastOne: true };
          } else if (includeNote && !isValidNote(noteValue)) {
            return { noteRequired: true };
          }

          return null;
        },
      },
    );
  }

  // Use cases:
  // 1. Photo toggle on, photo submitted, note : save photo with note, then submit note to RAG
  // 2. Photo toggle off, note only: submit note to RAG
  // 3. Photo toggle on, photo submitted, not note: save photo with empty note, do not submit to RAG
  // 4. Photo toggle on, no photo submitted: error case: show toast
  submitNote() {
    const note = this.noteForm.controls['note'].value;
    const includePhoto: boolean = this.noteForm.controls['includePhoto'].value;
    const includeNote: boolean = this.noteForm.controls['includeNote'].value;

    // should this logic (save photo, upsert notes) be consolidated in the wine service instead?
    if (includePhoto) {
      this.galleryService.addNewToGallery(note).then((savedPhoto) => {
        if (savedPhoto) {
          if (includeNote) {
            this.upsertWineNote(note);
          } else {
            // note can be added later - do nothing for now
            this.toastService.showToast('Wine photo saved.');
          }
          return;
        } else {
          this.toastService.showToast('Since no photo was taken, note was not submitted.');
        }
      });
    } else if (includeNote) {
      this.upsertWineNote(note);
    } else {
      // should not be possible due to validation
      console.warn(`Neither photo nor note included; nothing to submit.`);
    }
  }

  async upsertWineNote(note: string): Promise<void> {
    this.wineService.addWineNote(note).then(() => {
      this.noteForm.reset();
      this.noteForm.controls['includePhoto'].setValue(true);
      this.noteForm.controls['includeNote'].setValue(true);
    });
  }
}
