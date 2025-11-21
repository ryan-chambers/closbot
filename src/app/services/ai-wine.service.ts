import { inject, Injectable } from '@angular/core';
import { PineconeService } from './pinecone.service';
import { OpenAiService } from './openai.service';
import { WineServiceInterface } from './wine.service';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { ResponseLogService } from './response-log.service';
import { WineContext } from '@models/wines.model';

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
    const menuWines = await this.openAiService.readWineMenuPhoto(base64Image);

    if (menuWines.length === 0) {
      return 'Could not read any wines from the menu photo.';
    }

    // 2. get embeddings for each wine
    const menuWineEmbeddings = await this.openAiService.embedVectors(menuWines);

    // 3. Get context for each wine embedding
    const wineContexts: WineContext[] = await Promise.all(
      menuWineEmbeddings.map((embedding) => this.pineconeService.getContextForQuery(embedding)),
    );

    // 4. summarize wine menu
    const response = await this.openAiService.summarizeWineMenu(menuWines.join('\n'), wineContexts);

    return response;
  }

  async flagResponse(): Promise<void> {
    this.responseLogService.recordResponseLogs();
  }
}
