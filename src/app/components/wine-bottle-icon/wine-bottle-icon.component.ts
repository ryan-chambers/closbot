import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { WineBottleColor, WineBottleDrinkHold } from '@models/wines.model';

@Component({
  selector: 'app-wine-bottle-icon',
  templateUrl: 'wine-bottle-icon.component.html',
  styleUrls: ['wine-bottle-icon.component.scss'],
  imports: [IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WineBottleIconComponent {
  color = input.required<WineBottleColor>();
  drinkOrHold = input<WineBottleDrinkHold>();

  iconSrc = computed(() => {
    let suffix = '';

    switch (this.drinkOrHold()) {
      case 'drink':
        suffix = '';
        break;
      case 'hold':
        suffix = '-hold';
        break;
      case 'drink-or-hold':
        suffix = '-drink-hold';
        break;
    }
    return `/assets/icon/wine-bottle-${this.color()}${suffix}.svg`;
  });
}
