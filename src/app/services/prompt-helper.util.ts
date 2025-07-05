import { WineContext } from '../models/wines.model';

const chatSystemPrompt = `You are a sommelier with an expertise in wine from Burgundy. You are acting as my personal assistant. You will help answer any questions or comments about wine. Please return text with only markdown formatting.`;

export const createChatSystemPrompt = (wineContext: WineContext): string => {
  let prompt = chatSystemPrompt;
  if (wineContext.otherContext.length > 0) {
    prompt += `\n\nYou have access to some of my additional notes: ${wineContext.otherContext.join(', ')}. Make sure to include it if it is relevant.`;
  }
  if (wineContext.personalReviews.length > 0) {
    prompt += `\n\nYou have access to some of my personal reviews: ${wineContext.personalReviews.join(', ')}. Make sure to include it if it is relevant.`;
  }
  return prompt;
};

const menuSummarySystemPrompt = `You are a sommelier with an expertise in wine from Burgundy. You are acting as my personal assistant. Here is a wine menu for a restaurant. Please summarize the wines listed and do your best to make a recommendation for drinking with dinner. Please return text with only markdown formatting.`;

export const createMenuSummarySystemPrompt = (wineContext: WineContext): string => {
  let prompt = menuSummarySystemPrompt;
  if (wineContext.otherContext.length > 0) {
    prompt += `\n\nYou have access to some of my additional notes: ${wineContext.otherContext.join(', ')}. Make sure to include it if it is relevant.`;
  }
  if (wineContext.personalReviews.length > 0) {
    prompt += `\n\nYou have access to some of my personal reviews: ${wineContext.personalReviews.join(', ')}. Make sure to use consider them when making a recommendation.`;
  }
  return prompt;
};
