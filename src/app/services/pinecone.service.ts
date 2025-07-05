import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, from, map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { OpenAiService } from './openai.service';
import { ToastService } from './toast.service';
import { WineContext } from '../models/wines.model';

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
  source: WineInfoSource;
  info: string;
}

enum WineInfoSource {
  PERSONAL = 'personal reviews',
  NEW_FRENCH_WINE = 'New French Wine',
}

@Injectable({
  providedIn: 'root',
})
export class PineconeService {
  private readonly pineconeHost = environment.PINECONE_HOST;

  constructor(
    private readonly http: HttpClient,
    private readonly openAiService: OpenAiService,
    private readonly toastService: ToastService,
  ) {}

  async upsertWineReview(review: string) {
    review = review.trim();
    console.log('Upserting review:', review);
    // Get the embedding vector for the review
    const embedding: number[] = await this.openAiService.embedVector(review);

    // vector request
    const vectors = [
      {
        id: `personal-reviews-${Date.now()}`,
        values: embedding,
        metadata: { chunk: review, source: WineInfoSource.PERSONAL },
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
            if (response['upsertedCount'] == 1) {
              this.toastService.showToast('Review successfully added');
            } else {
              this.toastService.showToast('Error upserting review');
            }
          }),
        ),
    );
  }

  async getContextForQuery(query: string): Promise<WineContext> {
    const ragContext: PineconeWineContext[] = await this.getRagData(query);

    const result = { personalReviews: new Array<string>(), otherContext: new Array<string>() };
    ragContext.forEach((context) => {
      if (context.source === WineInfoSource.PERSONAL) {
        result.personalReviews.push(context.info);
      } else if (context.source === WineInfoSource.NEW_FRENCH_WINE) {
        result.otherContext.push(context.info);
      }
    });

    console.log('RAG context:', result);
    return result;
  }

  private async getRagData(userMessage: string): Promise<PineconeWineContext[]> {
    return firstValueFrom(this.queryPinecone(userMessage));
  }

  private embedVectorAsObservable(query: string): Observable<number[]> {
    return from(this.openAiService.embedVector(query));
  }

  queryPinecone(query: string, numberOfResults: number = 3): Observable<PineconeWineContext[]> {
    return this.embedVectorAsObservable(query).pipe(
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
                  source: match.metadata.source as WineInfoSource,
                  info: match.metadata.chunk,
                };
              });
            }),
          );
      }),
    );
  }
}
