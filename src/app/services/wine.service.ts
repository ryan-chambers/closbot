import { inject, Injectable } from '@angular/core';
import { AiWineService } from './ai-wine.service';
import { FakeWineService } from './fake-wine.service';
import { ConfigService } from './config.service';

export interface WineServiceInterface {
  initSession(): void;
  invokeChat(userMessage: string): Promise<string>;

  addWineReview(review: string): Promise<void>;

  readWineMenu(base64Image: string): Promise<string>;

  /**
   * Will capture the requests and responses from the most recent AI interaction
   * if the response was hallucinated it can be later investigated.
   */
  flagResponse(): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class WineService {
  private fakeWineService = inject(FakeWineService);
  private aiWineService = inject(AiWineService);
  private configService = inject(ConfigService);

  private getService(): WineServiceInterface {
    console.log(`Using ${this.configService.isUsingRealServices() ? 'real' : 'fake'} services`);
    return this.configService.isUsingRealServices() ? this.aiWineService : this.fakeWineService;
  }

  initSession() {
    return this.getService().initSession();
  }

  invokeChat(userMessage: string): Promise<string> {
    return this.getService().invokeChat(userMessage);
  }

  addWineReview(review: string): Promise<void> {
    return this.getService().addWineReview(review);
  }

  readWineMenu(base64Image: string): Promise<string> {
    return this.getService().readWineMenu(base64Image);
  }

  flagChat(): Promise<void> {
    return this.getService().flagResponse();
  }
}
