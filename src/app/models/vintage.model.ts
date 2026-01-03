import { CVintageNotes } from '@services/vintage.service.content';
import { WineBottleColor, WineBottleDrinkHold } from './wines.model';

export interface VintageReport extends CVintageNotes {
  redDrinkHold: WineBottleDrinkHold;
  whiteDrinkHold: WineBottleDrinkHold;
  rating: VintageRating;
}

export interface WhenToDrink {
  type: WineBottleColor;
  location: string;
  holdFor: number;
  thenDrinkOrHoldFor: number;
}

export enum VintageRating {
  GOOD = 'good',
  GREAT = 'great',
  CHALLENGING = 'challenging',
}
