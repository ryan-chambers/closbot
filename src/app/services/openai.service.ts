import { inject, Injectable } from '@angular/core';
import OpenAI from 'openai';
import { environment } from '../environments/environment';
import { WineContext } from '../models/wines.model';
import { createChatSystemPrompt, createMenuSummarySystemPrompt } from './prompt-helper.util';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { ResponseLogService } from './response-log.service';

/**
 * Encapsulates OpenAI client as well as which prompts to use for different
 * use cases.
 */
@Injectable({
  providedIn: 'root',
})
export class OpenAiService {
  responseLogService = inject(ResponseLogService);

  previousResponseId: string | null = null;

  initSession() {
    this.previousResponseId = null;
  }

  openAiClient = new OpenAI({
    // NOTE: environment.ts is deliberately excluded from source control so that this key
    // is not available on github.
    // This app will never be deployed to an app store, so this is not a security risk.
    apiKey: environment.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  embedVector(query: string): Promise<number[]> {
    return this.openAiClient.embeddings
      .create({ model: 'text-embedding-ada-002', input: query })
      .then((res) => {
        return res.data[0].embedding;
      });
  }

  async invokeChat(userMessage: string, context: WineContext): Promise<string> {
    const instructions = createChatSystemPrompt(context);

    console.log(`Instructions: ${instructions}`);
    const response = await this.openAiClient.responses.create({
      model: 'gpt-4o',
      input: userMessage,
      instructions,
      previous_response_id: this.previousResponseId,
    });

    this.previousResponseId = response.id;
    return response.output_text;
  }

  @TrackResponse(ResponseContext.WINE_MENU_TEXT)
  async readWineMenuPhoto(base64Image: string): Promise<string> {
    const response = await this.openAiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: base64Image,
              },
            },
            {
              type: 'text',
              // TODO move to prompt helper?
              text: 'You are a sommelier reading a wine list. Please review the menu in the photo and provide a summary of the wines listed. Include the name, region, and any other relevant information. Please do not include any other text or formatting.',
            },
          ],
        },
      ],
    });

    console.log(`Reading of wine menu:`, response.choices[0].message.content);

    return response.choices[0].message.content ?? '';
  }

  async summarizeWineMenu(menu: string, context: WineContext): Promise<string> {
    const instructions = createMenuSummarySystemPrompt(context);

    const response = await this.openAiClient.responses.create({
      model: 'gpt-4o',
      input: menu,
      instructions,
    });

    console.log(`Wine menu summary response: ${response.output_text}`);

    return response.output_text;
  }
}
