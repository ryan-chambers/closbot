import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private useRealServices = signal(environment.realServices);
  private burgundyFocused = signal<boolean>(true);

  isUsingRealServices(): boolean {
    return this.useRealServices();
  }

  isBurgundyFocused(): boolean {
    return this.burgundyFocused();
  }

  setUseRealServices(value: boolean) {
    console.log(`Setting useRealServices to ${value}`);
    this.useRealServices.set(value);
  }

  toggleRealServices() {
    this.useRealServices.set(!this.useRealServices());
    console.log(`RealServices toggled to ${this.useRealServices()}`);
  }

  toggleBurgundyFocus() {
    this.burgundyFocused.set(!this.burgundyFocused());
    console.log(`BurgundyFocus toggled to ${this.burgundyFocused()}`);
  }
}
