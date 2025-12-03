import { Component, inject, Input } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ChatService } from '@services/chat.service';
import { ConfigService } from '@services/config.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [IonButtons, IonHeader, IonIcon, IonRow, IonToggle, IonTitle, IonToolbar, IonButton],
})
export class HeaderComponent {
  @Input() title!: string;

  configService = inject(ConfigService);
  chatService = inject(ChatService);

  toggleChange(event: CustomEvent) {
    this.configService.setUseRealServices(event.detail.checked);
  }
}
