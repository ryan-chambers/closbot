import { Component, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { ContentService } from '@services/content.service';
import { enTabs, frTabs } from './tabs.page.content';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  imports: [IonTabs, IonLabel, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  private readonly contentService = inject(ContentService);

  content = this.contentService.registerComponentContent(enTabs, frTabs, 'TabsPage');
}
