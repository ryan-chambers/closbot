import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  async takePhotoAsBase64(): Promise<string | undefined> {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
      width: 512,
    }).catch(this.handleGetPhotoError.bind(this));

    if (!photo) {
      return undefined;
    }

    const image = photo.dataUrl;
    if (!image) {
      console.error('No image captured');
      return Promise.reject('No image captured');
    } else {
      return image;
    }
  }

  async takePhoto(): Promise<Photo | undefined> {
    return await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      width: 512,
      quality: 60,
    }).catch(this.handleGetPhotoError.bind(this));
  }

  private handleGetPhotoError(error: unknown): Promise<Photo | undefined> {
    if ((error as any)?.message === 'User cancelled photos app') {
      return Promise.resolve(undefined);
    } else {
      return Promise.reject(error);
    }
  }
}
