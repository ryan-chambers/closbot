import { Component, inject } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonRow,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ChatService } from '@services/chat.service';
import { ConfigService } from '@services/config.service';
import { ContentService } from '@services/content.service';
import { enHeader, frHeader } from './header.component.content';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [
    IonButtons,
    IonHeader,
    IonIcon,
    IonItem,
    IonRow,
    IonToggle,
    IonToolbar,
    IonButton,
    IonLabel,
  ],
})
export class HeaderComponent {
  readonly configService = inject(ConfigService);
  readonly chatService = inject(ChatService);
  private readonly contentService = inject(ContentService);

  content = this.contentService.registerComponentContent(enHeader, frHeader, 'HeaderComponent');

  toggleRealServices() {
    this.configService.toggleRealServices();
  }

  toggleLang() {
    this.contentService.toggleLanguage();
  }

  toggleBurgundyFocus() {
    this.configService.toggleBurgundyFocus();
  }
}
