import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { OpenAiService } from '@services//openai.service';
import { ToastService } from '@services/toast.service';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { RagQueryResult, WineContext } from '@models/wines.model';
import { ResponseLogService } from '@services/response-log.service';
import { ContentService } from '@services/content.service';

interface PineconeResponse {
  matches: Match[];
}

interface Match {
  id: string;
  score: number;
  metadata: Metadata;
}

interface Metadata {
  chunk: string;
  source: string;
}

interface PineconeWineContext {
  score: number;
  source: string;
  info: string;
}

interface CPineconeService {
  noteSuccessfullyAdded: string;
  errorUpsertingNote: string;
}

const enPineconeContent: CPineconeService = {
  noteSuccessfullyAdded: 'Note successfully added',
  errorUpsertingNote: 'Error upserting note',
};

const frPineconeContent: CPineconeService = {
  noteSuccessfullyAdded: 'Note ajoutée avec succès',
  errorUpsertingNote: "Erreur lors de l'insertion de l'avis",
};

// These properties are used as metadata in the pinecone datastore
const PERSONAL = 'My Notes';
const PERSONAL_U = PERSONAL.toUpperCase();

function serializeNote(note: RagQueryResult): string {
  return `${note.content} Score: ${note.score}`;
}

export const serializeWineContext = (val: WineContext): string => {
  // This content is only used for logging purposes. Rather than complicating the decorator even further
  // and adding language as a concern, for now I will keep the content english only, but note the language.
  return `Personal Notes: ${val.personalNotes.map((r) => serializeNote(r)).join('; ')} | Other Context: ${val.otherContext.map((r) => serializeNote(r)).join('; ')}.`;
};

@Injectable({
  providedIn: 'root',
})
export class PineconeService {
  private readonly pineconeHost = environment.PINECONE_HOST;
  private readonly contentService = inject(ContentService);
  responseLogService = inject(ResponseLogService);
  private readonly http = inject(HttpClient);
  private readonly openAiService = inject(OpenAiService);
  private readonly toastService = inject(ToastService);

  private readonly content = this.contentService.registerComponentContent(
    enPineconeContent,
    frPineconeContent,
    'PineconeService',
  );

  async upsertWineNote(note: string) {
    note = note.trim();
    console.log('Upserting note:', note);
    // Get the embedding vector for the note
    const embedding: number[] = await this.openAiService.embedVector(note);

    // vector request
    const vectors = [
      {
        id: `personal-notes-${Date.now()}`,
        values: embedding,
        metadata: { chunk: note, source: PERSONAL },
      },
    ];
    const headers = new HttpHeaders({
      'Api-Key': environment.PINECONE_API_KEY,
      'Content-Type': 'application/json',
      'X-Pinecone-API-Version': '2025-01',
    });

    return firstValueFrom(
      this.http
        .post<
          Record<string, number>
        >(`${this.pineconeHost}/vectors/upsert`, { vectors }, { headers })
        .pipe(
          tap((response) => {
            console.log('Upsert response:', response);
            if (response['upsertedCount'] === 1) {
              this.toastService.showToast(this.content().noteSuccessfullyAdded);
            } else {
              this.toastService.showToast(this.content().errorUpsertingNote);
            }
          }),
        ),
    );
  }

  @TrackResponse({
    context: ResponseContext.RAG_CONTEXT,
    serializer: serializeWineContext,
  })
  async getContextForQuery(query: string | number[]): Promise<WineContext> {
    const ragContext: PineconeWineContext[] = await this.getRagData(query);

    const result: WineContext = {
      personalNotes: new Array<RagQueryResult>(),
      otherContext: new Array<RagQueryResult>(),
    };
    ragContext.forEach((context) => {
      if (context.source.toUpperCase() === PERSONAL_U) {
        result.personalNotes.push({ content: context.info, score: context.score });
      } else {
        result.otherContext.push({
          // Note: "source" is the same in english or french; doesn't need to be translated
          content: `${context.info} (Source: ${context.source})`,
          score: context.score,
        });
      }
    });

    console.log('RAG context:', JSON.stringify(result));
    return result;
  }

  private async getRagData(query: string | number[]): Promise<PineconeWineContext[]> {
    return firstValueFrom(this.queryPinecone(query));
  }

  private embedVectorAsObservable(query: string): Observable<number[]> {
    return from(this.openAiService.embedVector(query));
  }

  queryPinecone(
    query: string | number[],
    numberOfResults = 3,
  ): Observable<PineconeWineContext[]> {
    const embedding: Observable<number[]> = Array.isArray(query)
      ? of(query as number[])
      : this.embedVectorAsObservable(query);

    return embedding.pipe(
      map((vector: number[]) => ({
        vector,
        topK: numberOfResults,
        includeMetadata: true,
      })),
      switchMap((req) => {
        const headers = new HttpHeaders({
          'Api-Key': environment.PINECONE_API_KEY,
          'Content-Type': 'application/json',
          'X-Pinecone-API-Version': '2025-01',
        });

        return this.http
          .post<PineconeResponse>(`${this.pineconeHost}/query`, req, { headers })
          .pipe(
            map((response: PineconeResponse) => {
              return response.matches.map((match) => {
                return {
                  score: match.score,
                  source: match.metadata.source,
                  info: match.metadata.chunk,
                };
              });
            }),
          );
      }),
    );
  }
}
