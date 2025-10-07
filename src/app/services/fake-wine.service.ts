import { inject, Injectable } from '@angular/core';
import { WineServiceInterface } from './wine.service';
import { ToastService } from './toast.service';
import { ResponseLogService } from './response-log.service';
import { ResponseContext, TrackResponse } from './track-response.decorator';

@Injectable({
  providedIn: 'root',
})
export class FakeWineService implements WineServiceInterface {
  private toastService = inject(ToastService);
  responseLogService = inject(ResponseLogService);

  async flagResponse(): Promise<void> {
    this.responseLogService.recordResponseLogs();
  }

  initSession(): void {}

  @TrackResponse(ResponseContext.CHAT_RESPONSE)
  async invokeChat(_: string): Promise<string> {
    console.log('FakeWineService invoked');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Fake response');
      }, 1000);
    });
  }

  async addWineReview(review: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Add review: ${review}`);
        this.toastService.showToast('Fake review added');
        resolve();
      }, 1100);
    });
  }

  readonly menuReco = `Response: This wine menu offers a delightful selection primarily focused on Chardonnay from Burgundy, with a strong representation of Corton-Charlemagne Grand Cru and some premier cru options from Beaune.

1. **Bourgogne Côte d'Or Chardonnay Options**:
   - Offers fresh and accessible Chardonnay selections ideal for those seeking bright fruit flavors with a touch of regional characteristics.

2. **Saint-Romain and Auxey-Duresses**:
   - From lesser-known appellations, these wines usually bring a good balance of minerality and fruit, with Saint-Romain generally offering more freshness and Auxey-Duresses showing a richer profile.

3. **Pernand-Vergelesses**:
   - Known for a more restrained and mineral profile, this selection from Bruno Clair will likely be lively with good acidity.

4. **Corton-Charlemagne Grand Cru**:
   - High-caliber wines showcasing elegance with lemony brightness and complexity. The older vintages (e.g., 2015 and 2014) tend to provide a richer, more developed flavor profile. Producers like Bonneau du Matray and Domaine Ponsot have a reputation for making expressive and age-worthy wines.

5. **Savigny-Les-Beaune and Beaune 1er Cru**:
   - Offer a lovely expression of Pinot Noir with Savigny-Les-Beaune delivering a lighter, fresher style. The Beaune 1er Cru, especially from Joseph Drouhin, provides a more structured and complex experience with notes of red fruit and spices.

**Recommendation**: If your dinner leans towards richer dishes, the **Corton-Charlemagne Grand Cru 2018 by Jean-Baptiste Boudier** could be an exceptional choice, offering complexity and a savory finish. For a lighter fare, the **Pernand-Vergelesses 2020 by Bruno Clair** offers brightness and mineral freshness, perfect for complementing more delicate dishes.`;

  @TrackResponse(ResponseContext.WINE_MENU_TEXT)
  async readWineMenu(_base64Image: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.menuReco);
      }, 3000);
    });
  }
}
