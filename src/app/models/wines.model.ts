export interface WineReview {
  score: number;
  content: string;
}

export interface WineContext {
  personalReviews: WineReview[];
  otherContext: WineReview[];
}
