import { createChatSystemPrompt } from './prompt-helper.util';

describe('PromptHelperUtil', () => {
  describe('createSystemPrompt', () => {
    it('should return a system prompt when no other context is available', () => {
      const result = createChatSystemPrompt({ otherContext: [], personalReviews: [] });
      expect(result).toBe(
        'You are a sommelier with an expertise in wine from Burgundy. You are acting as my personal assistant. You will help answer any questions or comments about wine. Please return only text with no other formatting or markdown.',
      );
    });

    it('should return a system prompt with other context if available', () => {
      const result = createChatSystemPrompt({
        otherContext: ['other context 1', 'other context 2'],
        personalReviews: ['I really enjoyed this.'],
      });

      expect(result).toContain(
        'You have access to some of my additional notes: other context 1, other context 2. Make sure to include it if it is relevant.',
      );
    });
  });
});
