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
  galleryService = inject(GalleryService);
  router = inject(Router);

  winePhotos = this.galleryService.winePhotos;

  isModalOpen = signal(false);

  photoToDeleteId?: string;

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

  editPhoto(photoId: string) {
    this.router.navigate(['/tabs/edit-review', photoId]);
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
