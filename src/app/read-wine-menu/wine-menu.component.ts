import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabComponent } from '../tab/tab.component';
import { MarkdownComponent } from 'ngx-markdown';
import { IonButton, IonSkeletonText } from '@ionic/angular/standalone';
import { WineService } from '../services/wine.service';
import { CameraService } from '../services/camera.service';

@Component({
  selector: 'app-wine-menu',
  templateUrl: 'wine-menu.component.html',
  styleUrls: ['wine-menu.component.scss'],
  imports: [CommonModule, IonButton, IonSkeletonText, MarkdownComponent, TabComponent],
  standalone: true,
})
export class WineMenu {
  wineService = inject(WineService);
  cameraService = inject(CameraService);

  menuRecommendation = '';

  loading = false;

  async readMenu() {
    const image = await this.cameraService.takePhotoAsBase64();
    this.loading = true;
    this.menuRecommendation = await this.wineService.readWineMenu(image);
    this.loading = false;
  }
}
