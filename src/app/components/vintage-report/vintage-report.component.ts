import { ChangeDetectionStrategy, Component } from '@angular/core';
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
import { WineBottleColor, WineBottleDrinkHold } from '@models/wines.model';
import { HeaderComponent } from 'src/app/header/header.component';

interface VintageReport {
  year: number;
  red: string;
  white: string;
  notes: string;
  redDrinkHold: WineBottleDrinkHold;
  whiteDrinkHold: WineBottleDrinkHold;
  rating: VintageRating;
}

interface WhenToDrink {
  type: WineBottleColor;
  location: string;
  holdFor: number;
  thenDrinkOrHoldFor: number;
}

enum VintageRating {
  GOOD,
  GREAT,
  CHALLENGING,
}

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
  readonly whenToDrink: WhenToDrink[] = [
    { type: 'red', location: 'Village Cote de Beaune', holdFor: 4, thenDrinkOrHoldFor: 6 },
    { type: 'red', location: 'Village Cote de Nuits', holdFor: 5, thenDrinkOrHoldFor: 7 },
    { type: 'red', location: 'Cote de Beaune Premier crus', holdFor: 6, thenDrinkOrHoldFor: 10 },
    { type: 'red', location: 'Cote de Nuits Premier crus', holdFor: 7, thenDrinkOrHoldFor: 12 },
    { type: 'red', location: 'Grand crus', holdFor: 10, thenDrinkOrHoldFor: 15 },
    { type: 'white', location: 'Village white', holdFor: 3, thenDrinkOrHoldFor: 5 },
    { type: 'white', location: 'Premier crus', holdFor: 5, thenDrinkOrHoldFor: 8 },
    { type: 'white', location: 'Grand crus', holdFor: 8, thenDrinkOrHoldFor: 10 },
  ];

  // Note: These drink/hold dates are based on late 2025
  vintages: VintageReport[] = [
    {
      year: 2024,
      red: '17/20. Aside from the best reds, the full-bodied, fruity reds should be drunk young',
      white: '17.5/20. Better in Yonne, Challonaise, Maconnais',
      notes:
        "A cooler year, neither particularly good nor bad. A winegrower's vintage, so always make sure you check the producer",
      redDrinkHold: 'hold',
      whiteDrinkHold: 'hold',
      rating: VintageRating.GOOD,
    },
    {
      year: 2023,
      red: '15/20. Charming, fruity.',
      white: '13/20.',
      notes: 'A mixed vintage, with sometimes excessive yields',
      redDrinkHold: 'hold',
      whiteDrinkHold: 'hold',
      rating: VintageRating.GOOD,
    },
    {
      year: 2022,
      red: '19/20. Ripe, balanced, open-knit',
      white: '17/20. Generous yet fresh',
      notes: '⭐ A dream year',
      redDrinkHold: 'hold',
      whiteDrinkHold: 'hold',
      rating: VintageRating.GREAT,
    },
    {
      year: 2021,
      red: '13/20. Light-bodied, delicate, classical; modest concentration',
      white: '14/20. Bright but lean, some are sharp or dilute',
      notes: '⚠️ Frost-ravaged, cool',
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink-or-hold',
      rating: VintageRating.CHALLENGING,
    },
    {
      year: 2020,
      red: 'Fine balance, excellent structure. 17/20',
      white: 'Zesty, focused. 17/20',
      notes: '⭐ Excellent potential for long-aging',
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink-or-hold',
      rating: VintageRating.GREAT,
    },
    {
      year: 2019,
      red: 'A warm vintage with ripe, concentrated wines, though some lack acidity. 18/20',
      white: 'Rich and full-bodied. 16/20',
      notes: '⭐ Superb',
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink-or-hold',
      rating: VintageRating.GREAT,
    },
    {
      year: 2018,
      red: 'Structured wines, excellent acidity, and aging potential. 15/20',
      white: 'Round, rich, some lack vibrancy. 16/20',
      notes: 'Village and even regional wines are worth exploring',
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    },
    {
      year: 2017,
      red: 'Ripe, generous wines; Early drinking. 15/20',
      white: 'Fresh, classic, generous. 17/20',
      notes: 'Consistent across the region, though not a powerhouse vintage',
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    },
    {
      year: 2016,
      red: 'Charming, elegant, balanced. 17/20',
      white: 'Fresh, classic, generous. 17/20',
      notes: '⚠️ Frost-affected, huge vineyard variation',
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    },
    {
      year: 2015,
      red: 'Rich, velvety, with aging potential. 18/20',
      white: 'Fresh, classic, generous. 16/20',
      notes: 'Red-driven vintage, although top whites can impress',
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GREAT,
    },
    {
      year: 2014,
      red: 'Crisp, elegant, charming. 16/20',
      white: 'Excellent, with purity, minerality, and balance. 18/20',
      notes: '⭐ whites truly standout, especially in Chablis and Meursault',
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    },
    {
      year: 2013,
      red: 'A difficult vintage due to hail and rain. Reds are light and simple, with limited aging potential. 15/20',
      white: 'High acid, classic style; good in Chablis. 17/20',
      notes: '⚠️ Late and difficult',
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    },
    {
      year: 2012,
      red: 'Concentrated, structured, with good depth. 17/20',
      white: 'Dense, with weight but slightly less tension. 17/20',
      notes: 'Very small crop, high quality',
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    },
    {
      year: 2011,
      red: 'Light and early-drinking, with lower acidity and softer tannins. Not for long aging. 14/20',
      white: 'Pretty, fresh whites but not profound. 17/20',
      notes: '⚠️ Widespread taint from ladybugs',
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    },
    {
      year: 2010,
      red: 'Stellar vintage with intense, structured wines, excellent acidity, and aging potential. 17/20',
      white: 'Racy, mineral, age-worthy whites. 17/20',
      notes: '⭐ Brilliant quality across the board',
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    },
    {
      year: 2009,
      red: 'Plush, ripe, seductive but sometimes low in acidity. 18/20',
      white: 'Rich, sometimes overripe, less age-worthy. 16/20',
      notes: 'Excellent overall',
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    },
    {
      year: 2008,
      red: 'Lean and austere. 17/20',
      white: 'Tense and mineral, excellent in Chablis. 17/20',
      notes: '⚠️ Classic but acidic. High skill required to extract flavour and balance',
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    },
    {
      year: 2007,
      red: 'Light and simple. 15/20',
      white: 'Tense and mineral, excellent in Chablis. 17/20',
      notes: '⚠️ Fragile',
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    },
    {
      year: 2006,
      red: 'Vintage for early drinking rather than long aging. 14/20',
      white: 'Crisp and mineral-driven, with good balance. Better than the reds. 16/20',
      notes: '⚠️ Uneven',
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    },
    {
      year: 2005,
      red: 'One of the greatest modern red vintages. 19/20',
      white: 'Excellent balance of richness and minerality. 17/20',
      notes: '⭐ Exceptional',
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GREAT,
    },
  ];

  showPremox(year: number): boolean {
    return year <= 2011;
  }

  /**
   * Determine drinkability for a vintage.
   *
   * If `color` is provided, only returns the details for that color (e.g. "reds: ...").
   * If `color` is omitted, returns the previous combined summary for both colors.
   *
   * Year must be between 2005 and 2024 (inclusive). Uses late-2025 as reference.
   */
  checkDrinkability(year: number, color: WineBottleColor, rating: VintageRating): string {
    if (year < 2005 || year > 2024) {
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

    const drinkable = this.whenToDrink
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
