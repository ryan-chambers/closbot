import { inject, Injectable } from '@angular/core';
import { PineconeService } from './pinecone.service';
import { OpenAiService } from './openai.service';
import { WineServiceInterface } from './wine.service';
import { WineContext } from '../models/wines.model';

@Injectable({
  providedIn: 'root',
})
export class AiWineService implements WineServiceInterface {
  private pineconeService = inject(PineconeService);
  private openAiService = inject(OpenAiService);

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

  async readWineMenu(base64Image: string): Promise<string> {
    // 1. read menu image
    const menuText = await this.openAiService.readWineMenuPhoto(base64Image);
    console.log('Menu:', menuText);

    // 2. get wine context
    const wineContext: WineContext = await this.pineconeService.getContextForQuery(menuText);
    console.log('Wine context:', wineContext);

    // 3. summarize wine menu
    const response = await this.openAiService.summarizeWineMenu(menuText, wineContext);

    return response;
  }
}
