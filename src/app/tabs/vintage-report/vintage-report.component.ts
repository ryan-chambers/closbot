import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from '@components/header/header.component';
import { WineBottleIconComponent } from '@components/wine-bottle-icon/wine-bottle-icon.component';
import {
  IonCol,
  IonGrid,
  IonItem,
  IonRow,
  IonText,
  IonAccordionGroup,
  IonAccordion,
  IonLabel,
  IonContent,
} from '@ionic/angular/standalone';
import { VintageRating } from '@models/vintage.model';
import { WineBottleColor } from '@models/wines.model';
import { ContentService } from '@services/content.service';
import { VintagesService } from '@services/vintages.service';

@Component({
  selector: 'app-vintage-report',
  templateUrl: 'vintage-report.component.html',
  styleUrls: ['vintage-report.component.scss'],
  imports: [
    HeaderComponent,
    IonAccordion,
    IonAccordionGroup,
    IonContent,
    IonCol,
    IonGrid,
    IonItem,
    IonLabel,
    IonRow,
    IonText,
    WineBottleIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VintageReportComponent {
  private readonly vintagesService = inject(VintagesService);
  private readonly contentService = inject(ContentService);

  readonly vintages = this.vintagesService.getVintages();

  content = this.contentService.selectContent((content) => content.vintageReportComponent);

  showPremox(year: number): boolean {
    return year <= 2011;
  }

  /**
   * Determine drinkability for a vintage.
   *
   * If `color` is provided, only returns the details for that color (e.g. "reds: ...").
   * If `color` is omitted, returns the previous combined summary for both colors.
   *
   * Year must be between 2005 and 2024 (inclusive).
   *
   * Drinkability was determined as-of late-2025.
   */
  checkDrinkability(year: number, color: WineBottleColor, rating: VintageRating): string {
    if (year < 2005 || year > 2024) {
      // Not worth the effort to translate, since content only exists for 2025 to 2024
      return 'Year must be between 2005 and 2024.';
    }

    const referenceYear = 2025; // Late-2025 reference as noted in file
    const age = referenceYear - year;

    // Apply vintage-based modifier: GREAT => +25%, CHALLENGING => -25%
    let modifier = 1;
    if (rating === VintageRating.GREAT) {
      modifier = 1.25;
    } else if (rating === VintageRating.CHALLENGING) {
      modifier = 0.75;
    }

    const drinkable = this.vintagesService.whenToDrink
      .filter(
        (slot) =>
          slot.type === color &&
          age >= slot.holdFor * modifier &&
          age <= (slot.holdFor + slot.thenDrinkOrHoldFor) * modifier,
      )
      .map((slot) => slot.location);

    return drinkable.join(', ');
  }
}
