import { inject, Injectable } from '@angular/core';
import OpenAI from 'openai';
import { environment } from '../environments/environment';
import {
  createChatSystemPrompt,
  createMenuSummarySystemPrompt,
  describeWinePrompt,
} from './prompt-helper.util';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { ResponseLogService } from './response-log.service';
import { WineBottleInfo, WineContext } from '@models/wines.model';

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
  readonly chatModel = 'gpt-4o';

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
    const prompt =
      'You are a sommelier reading a wine list. Please review the menu in the photo and provide a summary of the wines listed. Each wine should be on a new line. Include the name, region, and any other relevant information. Please do not include any other text or formatting.';

    const responseContent = await this.invokeWithImage(base64Image, prompt);

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

  private async invokeWithImage(base64Image: string, prompt: string): Promise<string> {
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
              text: prompt,
            },
          ],
        },
      ],
    });

    console.log(`Result from reading image:`, response.choices[0].message.content);

    return response.choices[0].message.content ?? '';
  }

  @TrackResponse(ResponseContext.WINE_BOTTLE_IMAGE_DETAILS)
  async readWineBottlePhoto(base64Image: string): Promise<WineBottleInfo | null> {
    // TODO a little more work required for this prompt, as responses provide a bit too much additional detail.
    // More testing required with other bottles
    // Do I need a response schema? Could make querying the RAG result in more accurate response.
    const prompt = `Here is a picture of a bottle of wine from Burgundy. Please tell me the producer, vintage, appellation. You MUST NOT provide any additional details or commentary. You MUST return the information in plain text format, without any formatting. Return N/A for any information is not known.
      Return the information in the following format:
      <format>
      Vintage: <vintage>, or N/A if not known
      Producer: <producer name>
      Appellation: <appellation>
      Grape Variety: <grape variety>
      <format>
      `;

    const responseText = await this.invokeWithImage(base64Image, prompt);
    return this.parseWineBottleInfo(responseText);
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

  private parseWineBottleInfo(responseText: string): WineBottleInfo | null {
    try {
      const lines = responseText.split('\n');
      const info: any = {};

      for (const line of lines) {
        const [key, value] = line.split(':').map((part) => part.trim());
        if (key && value) {
          const normalizedKey = key.toLowerCase().replace(' ', '');
          info[normalizedKey] = value !== 'N/A' ? value : undefined;
        }
      }

      if (info.producer && info.producer.toUpperCase() !== 'N/A') {
        return {
          producer: info.producer,
          appellation: info.appellation,
          vintage: info.vintage,
        };
      } else {
        console.log('Producer not found in response.');
        return null;
      }
    } catch (error) {
      console.error('Error parsing wine bottle info:', error);
      return null;
    }
  }

  async describeWine(
    wineDetails: string,
    context: WineContext,
    vintageInfo: string | undefined,
  ): Promise<string> {
    return this.invokeChat(describeWinePrompt(wineDetails, vintageInfo), context);
  }
}
