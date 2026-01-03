export interface RagQueryResult {
  score: number;
  content: string;
}

export interface WineContext {
  personalNotes: RagQueryResult[];
  otherContext: RagQueryResult[];
}

export type WineBottleColor = 'red' | 'white';

export type WineBottleDrinkHold = 'drink' | 'hold' | 'drink-or-hold';

export interface WineBottleInfo {
  producer: string;
  appellation?: string;
  vintage?: string;
}
