import { inject, Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  toastService = inject(ToastService);

  async takePhotoAsBase64(): Promise<string> {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
      width: 512,
    });

    const image = photo.dataUrl;
    if (!image) {
      this.toastService.showToast('No image captured');
      console.error('No image captured');
      return Promise.reject('No image captured');
    } else {
      return image;
    }
  }
}
