import { Component, Input, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  imports: [HeaderComponent, IonContent],
  standalone: true,
})
export class TabComponent {
  @Input() title!: string;
}
