import { computed, Injectable, Signal } from '@angular/core';
import { inject } from '@angular/core';
import { VintageRating, VintageReport, WhenToDrink } from '@models/vintage.model';
import { ContentService } from './content.service';
import { WineBottleDrinkHold } from '@models/wines.model';
import { enVintageNotes, frVintageNotes } from './vintage.service.content';

interface YearRating {
  rating: VintageRating;
  redDrinkHold: WineBottleDrinkHold;
  whiteDrinkHold: WineBottleDrinkHold;
}

@Injectable({
  providedIn: 'root',
})
export class VintagesService {
  private readonly contentService = inject(ContentService);

  content = this.contentService.registerComponentContent(
    enVintageNotes,
    frVintageNotes,
    'VintagesService',
  );

  readonly whenToDrink: WhenToDrink[] = [
    { type: 'red', location: 'Village Côte de Beaune', holdFor: 4, thenDrinkOrHoldFor: 6 },
    { type: 'red', location: 'Village Côte de Nuits', holdFor: 5, thenDrinkOrHoldFor: 7 },
    { type: 'red', location: 'Côte de Beaune Premier crus', holdFor: 6, thenDrinkOrHoldFor: 10 },
    { type: 'red', location: 'Côte de Nuits Premier crus', holdFor: 7, thenDrinkOrHoldFor: 12 },
    { type: 'red', location: 'Grand crus', holdFor: 10, thenDrinkOrHoldFor: 15 },
    // got too lazy to translate this entire bundle for one word :)
    { type: 'white', location: 'Village blanc', holdFor: 3, thenDrinkOrHoldFor: 5 },
    { type: 'white', location: 'Premier crus', holdFor: 5, thenDrinkOrHoldFor: 8 },
    { type: 'white', location: 'Grand crus', holdFor: 8, thenDrinkOrHoldFor: 10 },
  ];

  readonly yearRatings: Map<number, YearRating> = new Map<number, YearRating>();

  constructor() {
    /**
     * Here I have the rating meta-data separate from the content. In hindsight, this is a bit ugly
     * because of the need to join the data based on the vintage year, and because the data is in
     * two different files.
     * I could create a separate model for the vintage notes. There is probably some way to
     * keep the meta-data separate from the models, so there is no duplication. But that is a
     * lot moving data around. I might change this later when I have extra co-pilot credits to burn.
     */
    this.yearRatings.set(2024, {
      redDrinkHold: 'hold',
      whiteDrinkHold: 'hold',
      rating: VintageRating.GOOD,
    });
    this.yearRatings.set(2023, {
      redDrinkHold: 'hold',
      whiteDrinkHold: 'hold',
      rating: VintageRating.GOOD,
    });
    this.yearRatings.set(2022, {
      redDrinkHold: 'hold',
      whiteDrinkHold: 'hold',
      rating: VintageRating.GREAT,
    });
    this.yearRatings.set(2021, {
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink-or-hold',
      rating: VintageRating.CHALLENGING,
    });
    this.yearRatings.set(2020, {
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink-or-hold',
      rating: VintageRating.GREAT,
    });
    this.yearRatings.set(2019, {
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink-or-hold',
      rating: VintageRating.GREAT,
    });
    this.yearRatings.set(2018, {
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    });
    this.yearRatings.set(2017, {
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    });
    this.yearRatings.set(2016, {
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    });
    this.yearRatings.set(2015, {
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GREAT,
    });
    this.yearRatings.set(2014, {
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    });
    this.yearRatings.set(2013, {
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    });
    this.yearRatings.set(2012, {
      redDrinkHold: 'drink-or-hold',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    });
    this.yearRatings.set(2011, {
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    });
    this.yearRatings.set(2010, {
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    });
    this.yearRatings.set(2009, {
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GOOD,
    });
    this.yearRatings.set(2008, {
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    });
    this.yearRatings.set(2007, {
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    });
    this.yearRatings.set(2006, {
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.CHALLENGING,
    });
    this.yearRatings.set(2005, {
      redDrinkHold: 'drink',
      whiteDrinkHold: 'drink',
      rating: VintageRating.GREAT,
    });
  }

  getVintageReport(year: number): VintageReport | undefined {
    return this.getVintages()().find((v: VintageReport) => v.year === year);
  }

  getVintages(): Signal<VintageReport[]> {
    return computed(() => {
      console.log(`Vintages Content: ${JSON.stringify(this.content())}`);
      return this.content()
        .map((note) => {
          const yearRating = this.yearRatings.get(note.year);
          if (!yearRating) {
            console.error(`No year rating found for vintage year ${note.year}`);
            return undefined;
          }
          return {
            ...note,
            rating: yearRating ? yearRating.rating : VintageRating.GOOD,
            redDrinkHold: yearRating ? yearRating.redDrinkHold : 'drink',
            whiteDrinkHold: yearRating ? yearRating.whiteDrinkHold : 'drink',
          };
        })
        .filter(Boolean) as VintageReport[];
    });
  }
}
