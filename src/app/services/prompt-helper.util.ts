import { RagQueryResult, WineContext } from '@models/wines.model';

const chatSystemPrompt = `You are a sommelier with an expertise in wine from Burgundy. You are acting as my personal assistant. You will help answer any questions or comments about wine. Please return text with only markdown formatting.`;

function combineQueryResults(reviews: RagQueryResult[] | undefined): string {
  return combineStrings((reviews ?? []).map((review) => review.content));
}

function combineStrings(s: string[] | undefined): string {
  return (s ?? []).join('\n');
}

export const createChatSystemPrompt = (wineContext: WineContext): string => {
  let prompt = chatSystemPrompt;
  if (wineContext.otherContext.length > 0) {
    prompt += `\n\nYou have access to some of my additional notes: ${combineQueryResults(wineContext.otherContext)}. Make sure to include it if relevant. Also be sure to mention the source.`;
  }
  if (wineContext.personalReviews.length > 0) {
    prompt += `\n\nHere are some of my personal reviews. Make use of them if appropriate: ${combineQueryResults(wineContext.personalReviews)}`;
  }
  return prompt;
};

const menuSummarySystemPrompt = `You are a sommelier with expertise in wine from Burgundy. You are acting as my personal assistant. You will be provided a wine list. Please provide a summary of the wines. If there are a lot on the menu, mention only four or five highlights. Do your best to make a recommendation for drinking with dinner, but IT MUST be something from the wine list. DO NOT include something from my notes that is not on the wine list. Please return text with only markdown formatting.`;

const maxContextItems = 10;

export const createMenuSummarySystemPrompt = (wineContexts: WineContext[]): string => {
  let prompt = menuSummarySystemPrompt;

  const allPersonalReviews = wineContexts.flatMap((ctx) => ctx.personalReviews);

  if (allPersonalReviews.length > 0) {
    prompt += `\n\nHere are some of my personal reviews. Make sure to use consider them when making a recommendation. ${combineQueryResults(allPersonalReviews)}`;
  }

  const allOtherContext = Array.from(
    new Set(
      wineContexts
        .flatMap((ctx) => ctx.otherContext)
        .sort((a, b) => b.score - a.score)
        .map((res) => res.content),
    ),
  );

  if (allOtherContext.length > 0) {
    const contextItems = allPersonalReviews.length + allOtherContext.length;
    let contextToUse;
    if (contextItems > maxContextItems) {
      const itemsToTake = maxContextItems - allPersonalReviews.length;
      console.log(`Keeping only ${itemsToTake} other context items`);
      contextToUse = allOtherContext.slice(0, itemsToTake);
    } else {
      contextToUse = allOtherContext;
    }

    prompt += `\n\nYou have access to some of my additional notes: ${combineStrings(contextToUse)}. Make sure to include it if relevant. Also be sure to mention the source.`;
  }
  return prompt;
};

const describePromptBase = `I have a bottle of wine from Burgundy. Please summarize the wine for me, including any details that could be interesting for a sommelier.  Please return text with only markdown formatting. The details of the bottle are as follows:
`;

export const describeWinePrompt = (
  wineDetails: string,
  vintageInfo: string | undefined,
): string => {
  let prompt = `${describePromptBase} ${wineDetails}`;
  if (vintageInfo) {
    prompt += ` Here is some additional information about the vintage: ${vintageInfo}, which you can include in the response. For a bottle of red wine, only include the red wine information, and similarly for white wine.`;
  }
  return prompt;
};
