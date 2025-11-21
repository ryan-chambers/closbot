import { inject, Injectable } from '@angular/core';
import OpenAI from 'openai';
import { environment } from '../environments/environment';
import { createChatSystemPrompt, createMenuSummarySystemPrompt } from './prompt-helper.util';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { ResponseLogService } from './response-log.service';
import { WineContext } from '@models/wines.model';

/**
 * Encapsulates OpenAI client as well as which prompts to use for different
 * use cases.
 */
@Injectable({
  providedIn: 'root',
})
export class OpenAiService {
  responseLogService = inject(ResponseLogService);

  readonly embeddingModel = 'text-embedding-3-large';

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
    return this.embedVectors([query]).then((vectors) => vectors[0]);
  }

  embedVectors(queries: string[]): Promise<Array<number[]>> {
    return this.openAiClient.embeddings
      .create({ model: this.embeddingModel, input: queries })
      .then((res) => {
        return res.data.map((d) => d.embedding);
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
  async readWineMenuPhoto(base64Image: string): Promise<string[]> {
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
              text: 'You are a sommelier reading a wine list. Please review the menu in the photo and provide a summary of the wines listed. Each wine should be on a new line. Include the name, region, and any other relevant information. Please do not include any other text or formatting.',
            },
          ],
        },
      ],
    });

    console.log(`Reading of wine menu:`, response.choices[0].message.content);

    const responseContent = response.choices[0].message.content ?? '';
    const lines = responseContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      console.log(`Unable to extract wines from menu.`, responseContent);
      return [];
    }

    return lines;
  }

  async summarizeWineMenu(menu: string, context: WineContext[]): Promise<string> {
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
