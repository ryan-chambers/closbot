import { inject, Injectable } from '@angular/core';
import OpenAI from 'openai';
import { environment } from '../environments/environment';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { ResponseLogService } from './response-log.service';
import { WineBottleInfo, WineContext } from '@models/wines.model';
import { PromptService } from './prompt.service';

/**
 * Encapsulates OpenAI client as well as which prompts to use for different
 * use cases.
 */
@Injectable({
  providedIn: 'root',
})
export class OpenAiService {
  responseLogService = inject(ResponseLogService);
  private readonly promptService = inject(PromptService);

  readonly embeddingModel = 'text-embedding-3-large';
  readonly chatModel = 'gpt-4o';

  previousResponseId: string | null = null;

  initSession() {
    this.previousResponseId = null;
  }

  openAiClient = new OpenAI({
    /**
     * NOTE: environment.ts is deliberately excluded from source control so that this key is not available on github.
     * This app will never be deployed to an app store, so this is not a security risk.
     */
    apiKey: environment.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  embedVector(query: string): Promise<number[]> {
    return this.embedVectors([query]).then((vectors) => vectors[0]);
  }

  embedVectors(queries: string[]): Promise<number[][]> {
    return this.openAiClient.embeddings
      .create({ model: this.embeddingModel, input: queries })
      .then((res) => {
        return res.data.map((d) => d.embedding);
      });
  }

  async invokeChat(userMessage: string, context: WineContext): Promise<string> {
    const instructions = this.promptService.createChatSystemPrompt(context);

    console.log(`Instructions: ${instructions}`);
    const response = await this.openAiClient.responses.create({
      model: 'gpt-4o',
      input: userMessage,
      instructions,
      previous_response_id: this.previousResponseId,
    });

    this.previousResponseId = response.id;
    return this.parseResponse(response.output_text);
  }

  /**
   * @param base64Image image of wine menu
   * @returns A list of wines on the menu
   */
  @TrackResponse(ResponseContext.WINE_MENU_TEXT)
  async readWineMenuPhoto(base64Image: string): Promise<string[]> {
    const responseContent = await this.invokeWithImage(
      base64Image,
      this.promptService.parseWineMenuPrompt(),
    );

    const lines = responseContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      console.log(`Unable to extract wines from menu.`, responseContent);
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
    const responseText = await this.invokeWithImage(
      base64Image,
      this.promptService.readWineBottlePrompt(),
    );
    return this.parseWineBottleInfo(responseText);
  }

  async summarizeWineMenu(menu: string, context: WineContext[]): Promise<string> {
    const instructions = this.promptService.createMenuSummarySystemPrompt(context);

    // TODO Determine if it makes sense to continue with existing conversation
    const response = await this.openAiClient.responses.create({
      model: 'gpt-4o',
      input: menu,
      instructions,
    });

    console.log(`Wine menu summary response: ${response.output_text}`);

    return this.parseResponse(response.output_text);
  }

  private parseWineBottleInfo(responseText: string): WineBottleInfo | null {
    try {
      const lines = responseText.split('\n');
      const info: Record<string, string | undefined> = {};

      for (const line of lines) {
        const [key, value] = line.split(':').map((part) => part.trim());
        if (key && value) {
          const normalizedKey = key.toLowerCase().replace(' ', '');
          info[normalizedKey] = value !== 'N/A' ? value : undefined;
        }
      }

      if (info['producer'] && info['producer'].toUpperCase() !== 'N/A') {
        return {
          producer: info['producer'],
          appellation: info['appellation'],
          vintage: info['vintage'],
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
    return this.invokeChat(
      this.promptService.describeWinePrompt(wineDetails, vintageInfo),
      context,
    );
  }

  private parseResponse(responseText: string): string {
    let response = responseText.trim();

    const mdIndicator = '```markdown';
    const endIndicator = '```';
    if (response.startsWith(mdIndicator)) {
      response = response.substring(mdIndicator.length);
      console.log(`After trimming leading markdown got ${response}`);
    }
    if (response.endsWith(endIndicator)) {
      response = response.substring(0, response.length - endIndicator.length);
      console.log(`After trimming trailing markdown got ${response}`);
    }
    return response;
  }
}
