import { WineContext, WineReview } from '../models/wines.model';

const chatSystemPrompt = `You are a sommelier with an expertise in wine from Burgundy. You are acting as my personal assistant. You will help answer any questions or comments about wine. Please return text with only markdown formatting.`;

function combineStrings(reviews: WineReview[] | undefined): string {
  return (reviews ?? []).map((review) => review.content).join(', ');
}

export const createChatSystemPrompt = (wineContext: WineContext): string => {
  let prompt = chatSystemPrompt;
  if (wineContext.otherContext.length > 0) {
    prompt += `\n\nYou have access to some of my additional notes: ${combineStrings(wineContext.otherContext)}. Make sure to include it if relevant. Also be sure to mention the source.`;
  }
  if (wineContext.personalReviews.length > 0) {
    prompt += `\n\nHere are some of my personal reviews. Make use of them if appropriate: ${combineStrings(wineContext.personalReviews)}`;
  }
  return prompt;
};

const menuSummarySystemPrompt = `You are a sommelier with expertise in wine from Burgundy. You are acting as my personal assistant. Here is a wine menu for a restaurant. Please provide a summary of the wines. If there are a lot on the menu, mention only four or five highlights. Do your best to make a recommendation for drinking with dinner. Please return text with only markdown formatting.`;

export const createMenuSummarySystemPrompt = (wineContext: WineContext): string => {
  let prompt = menuSummarySystemPrompt;
  if (wineContext.otherContext.length > 0) {
    prompt += `\n\nYou have access to some of my additional notes: ${combineStrings(wineContext.otherContext)}. Make sure to include it if relevant. Also be sure to mention the source.`;
  }
  if (wineContext.personalReviews.length > 0) {
    prompt += `\n\nHere are some of my personal reviews. Make sure to use consider them when making a recommendation. ${combineStrings(wineContext.personalReviews)}`;
  }
  return prompt;
};
