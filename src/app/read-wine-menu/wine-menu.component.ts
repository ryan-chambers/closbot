import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WineMenu {
  wineService = inject(WineService);
  cameraService = inject(CameraService);

  menuRecommendation = signal<string>('');
  enableFlagButton = signal(false);

  loading = signal<boolean>(false);

  async readMenu() {
    const image = await this.cameraService.takePhotoAsBase64();
    this.loading.set(true);
    const mr = await this.wineService.readWineMenu(image);
    this.menuRecommendation.set(mr);
    this.loading.set(false);
    this.enableFlagButton.set(true);
  }

  flagChat() {
    this.wineService.flagChat();
    this.enableFlagButton.set(false);
  }
}
