import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonCol,
  IonGrid,
  IonItem,
  IonRow,
  IonText,
  IonAccordionGroup,
  IonAccordion,
  IonLabel,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { TabComponent } from '../tab/tab.component';

interface VintageReport {
  year: number;
  red: string;
  white: string;
  notes: string;
}

interface WhenToDrink {
  type: 'red' | 'white';
  location: string;
  start: number;
  over: number | string;
}

@Component({
  selector: 'app-vintage-report',
  templateUrl: 'vintage-report.component.html',
  styleUrls: ['vintage-report.component.scss'],
  imports: [
    CommonModule,
    IonAccordion,
    IonAccordionGroup,
    IonCol,
    IonGrid,
    IonItem,
    IonLabel,
    IonRow,
    IonText,
    TabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VintageReportComponent {
  whenToDrink: WhenToDrink[] = [
    { type: 'red', location: 'Village, Cote de Beaune', start: 4, over: 6 },
    { type: 'red', location: 'Village, Cote de Nuits', start: 5, over: 7 },
    { type: 'red', location: 'Premier crus, Cote de Beaune', start: 6, over: 10 },
    { type: 'red', location: 'Premier crus, Cote de Nuits', start: 7, over: 12 },
    { type: 'red', location: 'Grand crus', start: 10, over: '15-20' },
    { type: 'white', location: 'Village white', start: 3, over: 5 },
    { type: 'white', location: 'Premier crus', start: 5, over: 8 },
    { type: 'white', location: 'Grand crus', start: 8, over: 10 },
  ];

  whenToDrinkTrackBy(vintage: WhenToDrink): string {
    return `${vintage.location}_${vintage.type}`;
  }

  vintages: VintageReport[] = [
    {
      year: 2024,
      red: '17/20. Aside from the best reds, the full-bodied, fruity reds should be drunk young',
      white: '17.5/20. Better in Yonne, Challonaise, Maconnais',
      notes: "A cooler year, neither particularly good nor bad. A winegrower's vintage",
    },
    {
      year: 2023,
      red: '15/20',
      white: '13/20',
      notes: 'A mixed vintage, with sometimes excessive yields',
    },
    {
      year: 2022,
      red: '19/20. Ripe, balanced, open-knit',
      white: '17/20. Generous yet fresh',
      notes: '⭐ A dream year',
    },
    {
      year: 2021,
      red: '13/20. Light-bodied, delicate, classical; modest concentration',
      white: '14/20. Bright but lean, some are sharp or dilute',
      notes: '⚠️ Frost-ravaged, cool',
    },
    {
      year: 2020,
      red: 'Fine balance, excellent structure. 17/20',
      white: 'Zesty, focused. 17/20',
      notes: '⭐ Excellent potential for long-ageing',
    },
    {
      year: 2019,
      red: 'A warm vintage with ripe, concentrated wines, though some lack acidity. 18/20',
      white: 'Rich and full-bodied. 16/20',
      notes: '⭐ Superb',
    },
    {
      year: 2018,
      red: 'Structured wines, excellent acidity, and aging potential. 15/20',
      white: 'Round, rich, some lack vibrancy. 16/20',
      notes: 'village and even regional wines are worth exploring',
    },
    {
      year: 2017,
      red: 'ripe, generous wines; Early drinking. 15/20',
      white: 'Fresh, classic, generous. 17/20',
      notes: 'Consistent across the region, though not a powerhouse vintage',
    },
    {
      year: 2016,
      red: 'Charming, elegant, balanced. 17/20',
      white: 'Fresh, classic, generous. 17/20',
      notes: '⚠️ Frost-affected, huge vineyard variation',
    },
    {
      year: 2015,
      red: 'Rich, velvety, with aging potential. 18/20',
      white: 'Fresh, classic, generous. 16/20',
      notes: 'Red-driven vintage, although top whites can impress',
    },
    {
      year: 2014,
      red: 'Crisp, elegant, charming. 16/20',
      white: 'Excellent, with purity, minerality, and balance. 18/20',
      notes: '⭐ whites truly standout, especially in Chablis and Meursault',
    },
    {
      year: 2013,
      red: 'A difficult vintage due to hail and rain. Reds are light and simple, with limited aging potential. 15/20',
      white: 'High acid, classic style; good in Chablis. 17/20',
      notes: '⚠️ Late and difficult',
    },
    {
      year: 2012,
      red: 'Concentrated, structured, with good depth. 17/20',
      white: 'Dense, with weight but slightly less tension. 17/20',
      notes: 'Very small crop, high quality',
    },
    {
      year: 2011,
      red: 'Light and early-drinking, with lower acidity and softer tannins. Not for long aging. 14/20',
      white: 'Pretty, fresh whites but not profound. 17/20',
      notes: '⚠️ Widespread taint from ladybugs',
    },
    {
      year: 2010,
      red: 'Stellar vintage with intense, structured wines, excellent acidity, and aging potential. 17/20',
      white: 'Racy, mineral, age-worthy whites. 17/20',
      notes: '⭐ Brilliant quality across the board',
    },
    {
      year: 2009,
      red: 'Plush, ripe, seductive but sometimes low in acidity. 18/20',
      white: 'Rich, sometimes overripe, less age-worthy. 16/20',
      notes: 'Excellent overall',
    },
    {
      year: 2008,
      red: 'Lean and austere. 17/20',
      white: 'Tense and mineral, excellent in Chablis. 17/20',
      notes: '⚠️ Classic but acidic. High skill required to extract flavour and balance',
    },
    {
      year: 2007,
      red: 'Light and simple. 15/20',
      white: 'Tense and mineral, excellent in Chablis. 17/20',
      notes: '⚠️ Fragile',
    },
    {
      year: 2006,
      red: 'Vintage for early drinking rather than long aging. 14/20',
      white: 'Crisp and mineral-driven, with good balance. Better than the reds. 16/20',
      notes: '⚠️ Uneven',
    },
    {
      year: 2005,
      red: 'One of the greatest modern red vintages. 19/20',
      white: 'Excellent balance of richness and minerality. 17/20',
      notes: '⭐ Exceptional',
    },
  ];

  showPremox(year: number): boolean {
    return year <= 2011;
  }
}
