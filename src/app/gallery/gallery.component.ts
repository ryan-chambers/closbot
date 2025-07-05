import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonImg, IonCol, IonRow, IonGrid } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../services/gallery.service';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery.component.html',
  imports: [IonCol, IonGrid, IonImg, IonRow, CommonModule, TabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  galleryService = inject(GalleryService);

  winePhotos = this.galleryService.winePhotos;

  async ngOnInit() {
    await this.galleryService.loadSaved();
  }
}
