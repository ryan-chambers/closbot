import { Component, inject } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonItem,
  IonRow,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ChatService } from '@services/chat.service';
import { ConfigService } from '@services/config.service';
import { ContentService } from '@services/content.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [IonButtons, IonHeader, IonIcon, IonItem, IonRow, IonToggle, IonToolbar, IonButton],
})
export class HeaderComponent {
  readonly configService = inject(ConfigService);
  readonly chatService = inject(ChatService);
  private readonly contentService = inject(ContentService);

  content = this.contentService.selectContent((content) => content.headerComponent);

  toggleRealServices(event: CustomEvent) {
    this.configService.setUseRealServices(event.detail.checked);
  }

  toggleLang() {
    this.contentService.toggleLanguage();
  }
}
