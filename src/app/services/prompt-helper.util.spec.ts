import { createChatSystemPrompt } from './prompt-helper.util';

describe('PromptHelperUtil', () => {
  describe('createSystemPrompt', () => {
    it('should return a system prompt when no other context is available', () => {
      const result = createChatSystemPrompt({ otherContext: [], personalReviews: [] });
      expect(result).toBe(
        'You are a sommelier with an expertise in wine from Burgundy. You are acting as my personal assistant. You will help answer any questions or comments about wine. Please return text with only markdown formatting.',
      );
    });

    it('should return a system prompt with other context if available', () => {
      const result = createChatSystemPrompt({
        otherContext: [
          { content: 'other context 1', score: 75 },
          { content: 'other context 2', score: 75 },
        ],
        personalReviews: [{ content: 'I really enjoyed this.', score: 90 }],
      });

      expect(result).toContain(
        'You are a sommelier with an expertise in wine from Burgundy. You are acting as my personal assistant. You will help answer any questions or comments about wine. Please return text with only markdown formatting.',
      );
      expect(result).toContain('other context 1');
      expect(result).toContain('other context 2');
      expect(result).toContain('I really enjoyed this.');
    });
  });
});
