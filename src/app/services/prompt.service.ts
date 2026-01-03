import { inject, Injectable, Signal } from '@angular/core';
import { ContentService } from './content.service';
import { RagQueryResult, WineContext } from '@models/wines.model';
import { enPromptContent, frPromptContent, CPromptService } from '@models/prompt-content.model';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private readonly contentService = inject(ContentService);
  content: Signal<CPromptService> = this.contentService.registerComponentContent(
    enPromptContent,
    frPromptContent,
    'PromptService',
  );

  describeWinePrompt(wineDetails: string, vintageInfo: string | undefined): string {
    const describeContent = this.content().describeWineBottle;
    let prompt = `${describeContent.promptBase} ${wineDetails}`;
    if (vintageInfo) {
      prompt += this.contentService.interpolateArgs(describeContent.vintageInfo, {
        vintageInfo,
      });
    }
    return prompt;
  }

  readWineBottlePrompt(): string {
    // This prompt does not need to be translated since the response is only used as input for other operations.
    return `
Here is a picture of a bottle of wine from Burgundy. Please tell me the producer, vintage, appellation. You MUST NOT provide any additional details or commentary. You MUST return the information in plain text format, without any formatting. Return N/A for any information is not known.
Return the information in the following format:
<format>
Vintage: <vintage>, or N/A if not known
Producer: <producer name>
Appellation: <appellation>
Grape Variety: <grape variety>
<format>`;
  }

  createChatSystemPrompt(wineContext: WineContext): string {
    const chatContent = this.content().chat;
    let prompt = chatContent.systemPrompt;
    if (wineContext.otherContext.length > 0) {
      prompt += this.contentService.interpolateArgs(chatContent.additionalNotes, {
        otherContext: this.combineQueryResults(wineContext.otherContext),
      });
    }
    if (wineContext.personalNotes.length > 0) {
      prompt += this.contentService.interpolateArgs(chatContent.myNotes, {
        personalNotes: this.combineQueryResults(wineContext.personalNotes),
      });
    }
    return prompt;
  }

  private combineQueryResults(notes: RagQueryResult[] | undefined): string {
    return this.combineStrings((notes ?? []).map((note) => note.content));
  }

  private combineStrings(s: string[] | undefined): string {
    return (s ?? []).join('.');
  }

  readonly maxContextItems = 10;

  createMenuSummarySystemPrompt(wineContexts: WineContext[]): string {
    const promptContent = this.content().menuSummary;
    let prompt = promptContent.systemPrompt;
    const allPersonalNotes = wineContexts.flatMap((ctx) => ctx.personalNotes);
    if (allPersonalNotes.length > 0) {
      prompt += this.contentService.interpolateArgs(promptContent.personalNotes, {
        personalNotes: this.combineQueryResults(allPersonalNotes),
      });
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
      const contextItems = allPersonalNotes.length + allOtherContext.length;
      let contextToUse;
      if (contextItems > this.maxContextItems) {
        const itemsToTake = this.maxContextItems - allPersonalNotes.length;
        console.log(`Keeping only ${itemsToTake} other context items`);
        contextToUse = allOtherContext.slice(0, itemsToTake);
      } else {
        contextToUse = allOtherContext;
      }
      prompt += this.contentService.interpolateArgs(promptContent.otherContext, {
        contextToUse: this.combineStrings(contextToUse),
      });
    }
    return prompt;
  }

  parseWineMenuPrompt(): string {
    return this.content().parseWineMenuPrompt;
  }
}
