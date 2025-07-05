import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private useRealServices = signal(environment.realServices);

  isUsingRealServices(): boolean {
    return this.useRealServices();
  }

  setUseRealServices(value: boolean) {
    console.log(`Setting useRealServices to ${value}`);
    this.useRealServices.set(value);
  }
}
