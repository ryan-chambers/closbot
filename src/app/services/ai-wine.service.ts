import { inject, Injectable } from '@angular/core';
import { PineconeService } from './pinecone.service';
import { OpenAiService } from './openai.service';
import { WineServiceInterface } from './wine.service';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { ResponseLogService } from './response-log.service';
import { WineBottleInfo, WineContext } from '@models/wines.model';
import { VintagesService } from './vintages.service';
import { ContentService } from './content.service';
import { ErrorCode } from '@errors/error.codes';

@Injectable({
  providedIn: 'root',
})
export class AiWineService implements WineServiceInterface {
  private readonly pineconeService = inject(PineconeService);
  private readonly openAiService = inject(OpenAiService);
  private readonly responseLogService = inject(ResponseLogService);
  private readonly vintagesService = inject(VintagesService);
  private readonly contentService = inject(ContentService);

  content = this.contentService.registerComponentContent(
    {
      vintageData:
        'In {{year}}, the red wines were rated as a {{redRating}} vintage and the white wines were rated as a {{whiteRating}} vintage. The general notes are: {{vintageNotes}}.',
    },
    {
      vintageData:
        'En {{year}}, les vins rouges ont été classés comme millésime {{redRating}} et les vins blancs comme millésime {{whiteRating}}. Les notes générales sont : {{vintageNotes}}.',
    },
    'AiWineService',
  );

  @TrackResponse(ResponseContext.CHAT_RESPONSE)
  async invokeChat(userMessage: string): Promise<string> {
    const wineContext = await this.pineconeService.getContextForQuery(userMessage);

    console.log('Wine context:', wineContext);

    return this.openAiService.invokeChat(userMessage, wineContext);
  }

  initSession() {
    this.openAiService.initSession();
  }

  async addWineNote(note: string) {
    this.pineconeService.upsertWineNote(note);
  }

  @TrackResponse(ResponseContext.WINE_MENU_RECOMMENDATION)
  async readWineMenu(base64Image: string): Promise<string> {
    // 1. read menu image
    const menuWines = await this.openAiService.readWineMenuPhoto(base64Image);

    if (menuWines.length === 0) {
      return this.contentService.translateError(ErrorCode.NO_WINES_FROM_MENU_PHOTO);
    }

    // 2. get embeddings for each wine
    const menuWineEmbeddings = await this.openAiService.embedVectors(menuWines);

    // 3. Get context for each wine embedding
    const wineContexts: WineContext[] = await Promise.all(
      menuWineEmbeddings.map((embedding) => this.pineconeService.getContextForQuery(embedding)),
    );

    // 4. summarize wine menu
    return await this.openAiService.summarizeWineMenu(menuWines.join('\n'), wineContexts);
  }

  @TrackResponse(ResponseContext.WINE_BOTTLE_SUMMARY)
  async describeWine(base64Image: string): Promise<string> {
    // 1. read bottle image
    const wineBottleInfo = await this.openAiService.readWineBottlePhoto(base64Image);
    if (!wineBottleInfo) {
      return this.contentService.translateError(ErrorCode.COULD_NOT_READ_BOTTLE_DETAILS);
    }

    const wineBottleString: string = this.formatWineBottlInfo(wineBottleInfo);
    // 2. get embedding for the bottle
    const embedding = await this.openAiService.embedVector(wineBottleString);
    // 3. get context for the bottle embedding
    const context = await this.pineconeService.getContextForQuery(embedding);

    // 4. summarize wine bottle
    const vintageInfo: string | undefined = this.vintageInfo(wineBottleInfo.vintage);
    return await this.openAiService.describeWine(wineBottleString, context, vintageInfo);
  }

  private vintageInfo(vintage?: string): string | undefined {
    if (!vintage) {
      console.warn('No vintage');
      return undefined;
    }

    const year = parseInt(vintage, 10);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      console.warn('Got unparseable vintage year:', vintage);
      return undefined;
    }

    const vintageData = this.vintagesService.getVintageReport(year);
    if (vintageData) {
      // In the future, could also include whether to drink or hold, but that would require the LLM to determine Premier Cru, grand cru, etc.
      return this.contentService.interpolateArgs(this.content().vintageData, {
        year: year,
        redRating: vintageData.red,
        whiteRating: vintageData.white,
        vintageNotes: vintageData.notes,
      });
    } else {
      console.warn(`No vintage data for year ${year}`);
      return undefined;
    }
  }

  private formatWineBottlInfo(info: WineBottleInfo): string {
    let result = `${info.producer}`;
    if (info.appellation) {
      result += ` ${info.appellation}`;
    }
    if (info.vintage) {
      result += `${info.vintage}`;
    }
    return result;
  }

  async flagResponse(): Promise<void> {
    this.responseLogService.recordResponseLogs();
  }
}
