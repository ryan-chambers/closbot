import { Component, inject, Input } from '@angular/core';
import {
  IonButtons,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [IonButtons, IonHeader, IonIcon, IonRow, IonToggle, IonTitle, IonToolbar],
})
export class HeaderComponent {
  @Input() title!: string;

  configService = inject(ConfigService);

  toggleChange(event: CustomEvent) {
    this.configService.setUseRealServices(event.detail.checked);
  }
}
