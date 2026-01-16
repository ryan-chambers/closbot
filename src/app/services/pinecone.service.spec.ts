import { expect, it, describe } from 'vitest';
import { WineContext } from '@models/wines.model';
import { serializeWineContext } from './pinecone.service';

describe('PineconeService', () => {
  describe('serializeWineContext', () => {
    it('should serialize WineContext correctly', () => {
      const wineContext: WineContext = {
        personalNotes: [
          { score: 5, content: 'Excellent wine with rich flavors.' },
          { score: 4, content: 'Good balance and aroma.' },
        ],
        otherContext: [
          { score: 3, content: 'Average taste, nothing special.' },
          { score: 2, content: 'Not to my liking.' },
        ],
      };

      expect(serializeWineContext(wineContext)).toBe(
        'Personal Notes: Excellent wine with rich flavors. Score: 5; Good balance and aroma. Score: 4 | Other Context: Average taste, nothing special. Score: 3; Not to my liking. Score: 2.',
      );
    });
  });
});
