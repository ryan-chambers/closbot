import { beforeEach, expect, it, describe } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PromptService } from './prompt.service';

describe('PromptService', () => {
  let service: PromptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromptService);
  });

  describe('createSystemPrompt', () => {
    it('should return a system prompt when no other context is available', () => {
      const result = service.createChatSystemPrompt({
        otherContext: [],
        personalNotes: [],
      });
      expect(result).toBe(
        'You are a sommelier with an expertise in wine from Burgundy. You are acting as my personal assistant. You will help answer any questions or comments about wine. Please return text with only markdown formatting. Please respond in English. ',
      );
    });

    it('should return a system prompt with other context if available', () => {
      const result = service.createChatSystemPrompt({
        otherContext: [
          { content: 'other context 1', score: 75 },
          { content: 'other context 2', score: 75 },
        ],
        personalNotes: [{ content: 'I really enjoyed this.', score: 90 }],
      });

      expect(result).toContain(
        'You are a sommelier with an expertise in wine from Burgundy. You are acting as my personal assistant. You will help answer any questions or comments about wine. Please return text with only markdown formatting. Please respond in English. ',
      );
      expect(result).toContain('other context 1');
      expect(result).toContain('other context 2');
      expect(result).toContain('I really enjoyed this.');
    });
  });
});
