import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  IonImg,
  IonCol,
  IonRow,
  IonGrid,
  IonContent,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@components/header/header.component';
import { GalleryService } from '@services/gallery.service';
import { Router } from '@angular/router';
import { ContentService } from '@services/content.service';

@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery.component.html',
  imports: [
    HeaderComponent,
    IonButton,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonImg,
    IonModal,
    IonRow,
    IonTitle,
    IonToolbar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  private readonly galleryService = inject(GalleryService);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);

  winePhotos = this.galleryService.winePhotos;

  isModalOpen = signal(false);

  photoToDeleteId?: string;

  content = this.contentService.selectContent((content) => content.galleryComponent);

  async ngOnInit() {
    await this.galleryService.loadSaved();
  }

  openDeleteModal(photoId: string) {
    this.photoToDeleteId = photoId;
    console.log(`Setting photo to delete id: ${photoId}`);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.photoToDeleteId = undefined;
  }

  editNote(photoId: string) {
    this.router.navigate(['/tabs/edit-note', photoId]);
  }

  deletePhoto() {
    if (this.photoToDeleteId) {
      this.galleryService.deletePhoto(this.photoToDeleteId);
    } else {
      console.warn('Trying to delete with no photo id set');
    }

    this.isModalOpen.set(false);
  }
}
