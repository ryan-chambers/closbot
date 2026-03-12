import { inject, Injectable } from '@angular/core';
import { WineService } from './wine.service';
import { isNotNullish } from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class OcrService {
  private readonly wineService = inject(WineService);

  async detectLabels(base64Image: string): Promise<string[]> {
    const wineBottleInfo = await this.wineService.readWineBottlePhoto(base64Image);
    if (!wineBottleInfo) {
      console.log(`Could not get info from label`);
      return [];
    }

    return [wineBottleInfo.producer, wineBottleInfo.appellation, wineBottleInfo.vintage].filter(
      isNotNullish,
    );
  }
}
