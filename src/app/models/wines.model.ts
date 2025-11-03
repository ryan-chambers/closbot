export interface WineReview {
  score: number;
  content: string;
}

export interface WineContext {
  personalReviews: WineReview[];
  otherContext: WineReview[];
}

export type WineBottleColor = 'red' | 'white';

export type WineBottleDrinkHold = 'drink' | 'hold' | 'drink-or-hold';
