import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
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
  IonFab,
  IonFabButton,
  IonIcon,
  ActionSheetController,
  IonSearchbar,
  SearchbarCustomEvent,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@components/header/header.component';
import { GalleryService } from '@services/gallery.service';
import { Router } from '@angular/router';
import { ContentService } from '@services/content.service';
import { addIcons } from 'ionicons';
import { add, closeCircle } from 'ionicons/icons';
import { CameraSource } from '@capacitor/camera';
import { enGallery, frGallery } from './gallery.component.content';

@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery.component.html',
  styleUrl: 'gallery.component.scss',
  imports: [
    IonLabel,
    IonChip,
    IonIcon,
    IonFab,
    IonFabButton,
    HeaderComponent,
    IonButton,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonImg,
    IonModal,
    IonRow,
    IonSearchbar,
    IonTitle,
    IonToolbar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  private readonly galleryService = inject(GalleryService);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);
  private readonly actionSheetCtrl = inject(ActionSheetController);

  searchTerm = this.galleryService.searchTerm;
  selectedTag = this.galleryService.selectedTag;
  uniqueLabels = this.galleryService.uniqueLabels;
  winePhotos = this.galleryService.filteredPhotos;
  allPhotos = this.galleryService.winePhotos;

  isModalOpen = signal(false);

  photoToDeleteId?: string;

  content = this.contentService.registerComponentContent(enGallery, frGallery, 'GalleryComponent');

  constructor() {
    addIcons({ add, closeCircle });
  }

  matchingLabels = computed(() => {
    const searchTerm = this.searchTerm().toLowerCase().trim();
    if (!searchTerm || this.selectedTag()) {
      return [];
    }

    return this.uniqueLabels().filter((label) => label.toLowerCase().includes(searchTerm));
  });

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

  async onAddPhoto(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: this.content().takePhoto,
          handler: () => {
            this.capture(CameraSource.Camera);
          },
        },
        {
          text: this.content().chooseFromLibrary,
          handler: () => {
            this.capture(CameraSource.Photos);
          },
        },
        {
          text: this.content().cancel,
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  private async capture(source: CameraSource) {
    await this.galleryService.addNewToGallery(source);
  }

  onSearch(event: SearchbarCustomEvent) {
    this.galleryService.searchTerm.set(event.detail.value ?? '');
  }

  onClearSearch() {
    this.galleryService.searchTerm.set('');
  }

  onTagTap(tag: string) {
    this.galleryService.selectTag(tag);
    this.galleryService.searchTerm.set('');
  }
}
