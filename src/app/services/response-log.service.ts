import { inject, Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter, tap } from 'rxjs';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { ResponseContext } from './track-response.decorator';

export interface ResponseLogEntry {
  context: ResponseContext | null;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResponseLogService {
  platform = inject(Platform);

  private responses: ResponseLogEntry[] = [];

  constructor() {
    this.init(inject(Router));
  }

  private init(router: Router) {
    // Clear the responses each time a navigation completes
    router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        tap(() => this.clear()),
      )
      .subscribe();
  }

  add(text: string, context: ResponseContext) {
    this.responses.push({ text, context });
  }

  list(): ResponseLogEntry[] {
    return [...this.responses];
  }

  recordResponseLogs() {
    if (this.list().length === 0) {
      return;
    }

    const responseLog = this.list()
      .map((r) => `${r.context} : ${r.text}`)
      .join('\n');

    if (this.platform.is('android')) {
      const logLine = this.generateLogFileLine(responseLog);
      Filesystem.appendFile({
        data: logLine,
        directory: Directory.Documents,
        path: 'llm_logs.txt',
        encoding: Encoding.UTF8,
      });
    } else {
      console.log(responseLog);
    }

    this.clear();
  }

  private generateLogFileLine(responseLog: string): string {
    const updateTime = new Date().toString().slice(0, 24);

    return `${updateTime}:\n ${responseLog}`;
  }

  clear() {
    this.responses = [];
  }
}
