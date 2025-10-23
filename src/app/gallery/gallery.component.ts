import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonImg, IonCol, IonRow, IonGrid, IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../services/gallery.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery.component.html',
  imports: [HeaderComponent, IonCol, IonContent, IonGrid, IonImg, IonRow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  galleryService = inject(GalleryService);

  winePhotos = this.galleryService.winePhotos;

  async ngOnInit() {
    await this.galleryService.loadSaved();
  }
}
