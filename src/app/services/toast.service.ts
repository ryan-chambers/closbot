import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async showToast(message: string) {
    const toast = await this.toastController.create({
      duration: 5000,
      message,
      position: 'top',
    });
    await toast.present();
  }
}
