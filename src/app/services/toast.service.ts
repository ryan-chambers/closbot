import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastController = inject(ToastController);

  async showToast(message: string) {
    const toast = await this.toastController.create({
      duration: 5000,
      message,
      position: 'top',
    });
    await toast.present();
  }
}
