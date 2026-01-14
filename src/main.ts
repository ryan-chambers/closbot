import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { provideHttpClient } from '@angular/common/http';
import { ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { CbErrorHandler } from './app/errors/error.handler';
import { provideMarkdown } from 'ngx-markdown';

// Call the element loader before the render call
defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: ErrorHandler, useClass: CbErrorHandler },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideMarkdown(),
  ],
});
