import { inject, Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter, tap } from 'rxjs';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { ResponseContext } from './track-response.decorator';
import { ToastService } from './toast.service';

export interface ResponseLogEntry {
  context: ResponseContext | null;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResponseLogService {
  platform = inject(Platform);
  toastService = inject(ToastService);

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

    const logLine = this.generateLogFileLine(responseLog);

    if (this.platform.is('android')) {
      Filesystem.appendFile({
        data: logLine,
        directory: Directory.Documents,
        path: 'llm_logs.txt',
        encoding: Encoding.UTF8,
      });
    } else {
      console.log(logLine);
    }

    this.toastService.showToast('Response log recorded');

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
