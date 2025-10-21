import { inject, Injectable, signal } from '@angular/core';
import { Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { CameraService } from './camera.service';

export interface WinePhoto {
  filepath: string;
  webviewPath?: string;
  wineDetails: string;
}

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  cameraService = inject(CameraService);

  platform = inject(Platform);

  winePhotos = signal<WinePhoto[]>([]);

  private WINE_PHOTO_STORAGE: string = 'winePhotos';

  public async addNewToGallery(details: string): Promise<boolean> {
    console.log('Adding photo to gallery with details ' + details);
    const capturedPhoto = await this.cameraService.takePhoto();

    if (!capturedPhoto) {
      return Promise.resolve(false);
    }

    // Save the picture and add it to gallery
    const savedImageFile = await this.savePicture(capturedPhoto);
    const newPhoto: WinePhoto = { ...savedImageFile, wineDetails: details };

    const photos = [...this.winePhotos()];
    photos.unshift(newPhoto);

    this.winePhotos.set(photos);

    Preferences.set({
      key: this.WINE_PHOTO_STORAGE,
      value: JSON.stringify(photos),
    });

    return Promise.resolve(true);
  }

  public async loadSaved() {
    console.log('Loading gallery');
    // Retrieve cached photo array data
    const { value } = await Preferences.get({ key: this.WINE_PHOTO_STORAGE });

    const winePhotos = (value ? JSON.parse(value) : []) as WinePhoto[];

    // Easiest way to detect when running on the web:
    // “when the platform is NOT hybrid, do this”
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let photo of winePhotos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
    this.winePhotos.set(winePhotos);
  }

  // Save picture to file on device
  private async savePicture(photo: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = Date.now() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    if (this.platform.is('hybrid')) {
      console.log(`I'm hybrid`);
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
      };
    }
  }

  private async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      console.log(`I'm hybrid`);
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}
