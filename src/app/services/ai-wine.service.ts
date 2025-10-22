import { inject, Injectable } from '@angular/core';
import { PineconeService } from './pinecone.service';
import { OpenAiService } from './openai.service';
import { WineServiceInterface } from './wine.service';
import { WineContext } from '../models/wines.model';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { ResponseLogService } from './response-log.service';

@Injectable({
  providedIn: 'root',
})
export class AiWineService implements WineServiceInterface {
  private pineconeService = inject(PineconeService);
  private openAiService = inject(OpenAiService);
  responseLogService = inject(ResponseLogService);

  @TrackResponse(ResponseContext.CHAT_RESPONSE)
  async invokeChat(userMessage: string): Promise<string> {
    const wineContext = await this.pineconeService.getContextForQuery(userMessage);

    console.log('Wine context:', wineContext);

    return this.openAiService.invokeChat(userMessage, wineContext);
  }

  initSession() {
    this.openAiService.initSession();
  }

  async addWineReview(review: string) {
    this.pineconeService.upsertWineReview(review);
  }

  @TrackResponse(ResponseContext.WINE_MENU_RECOMMENDATION)
  async readWineMenu(base64Image: string): Promise<string> {
    // 1. read menu image
    const menuText = await this.openAiService.readWineMenuPhoto(base64Image);

    // 2. get wine context
    const wineContext: WineContext = await this.pineconeService.getContextForQuery(menuText);

    // 3. summarize wine menu
    const response = await this.openAiService.summarizeWineMenu(menuText, wineContext);

    return response;
  }

  async flagResponse(): Promise<void> {
    this.responseLogService.recordResponseLogs();
  }
}
