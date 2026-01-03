import { inject, Injectable, signal } from '@angular/core';
import { Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { CameraService } from './camera.service';

export interface WinePhoto {
  id: string;
  filepath: string;
  webviewPath?: string;
  wineDetails?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private readonly cameraService = inject(CameraService);

  platform = inject(Platform);

  winePhotos = signal<WinePhoto[]>([]);

  private WINE_PHOTO_STORAGE: string = 'winePhotos';

  public async addNewToGallery(details?: string): Promise<boolean> {
    console.log(`Adding photo to gallery with details ${details}`);
    const capturedPhoto = await this.cameraService.takePhoto();

    if (!capturedPhoto) {
      return Promise.resolve(false);
    }

    // Save the picture and add it to gallery
    const id = String(Date.now());
    const savedImageFile = await this.savePicture(capturedPhoto, id);
    const newPhoto: WinePhoto = { ...savedImageFile, wineDetails: details, id };

    const photos = [...this.winePhotos()];
    photos.unshift(newPhoto);

    this.savePhotos(photos);

    return Promise.resolve(true);
  }

  private savePhotos(photos: WinePhoto[]) {
    this.winePhotos.set(photos);

    Preferences.set({
      key: this.WINE_PHOTO_STORAGE,
      value: JSON.stringify(photos),
    });
  }

  public updatePhotoNotes(id: string, notes: string) {
    const photos = this.winePhotos().map((photo) => {
      if (photo.id === id) {
        return { ...photo, wineDetails: notes };
      }
      return photo;
    });

    this.savePhotos(photos);
  }

  public async deletePhoto(id: string) {
    const toBeDeleted = this.winePhotos().find((photo) => photo.id === id);
    if (!toBeDeleted) {
      console.warn(`Tried to delete photo with id ${id} but not found`);
      return;
    }

    const photos = this.winePhotos().filter((photo) => photo.id !== id);

    let path = toBeDeleted.filepath;
    if (this.platform.is('hybrid')) {
      console.log(`Trimming directory on native app`);
      // Remove webviewPath prefix from path
      path = path.substring(path.lastIndexOf('/') + 1);
      console.log(`Trimmed path: ${path}`);
    }

    console.log(`Deleting file at path: ${path}`);

    Filesystem.deleteFile({
      path,
      directory: Directory.Data,
    });

    this.savePhotos(photos);
  }

  public async getPhotoById(id: string | null): Promise<WinePhoto | undefined> {
    if (!id) {
      console.warn('Asked for null id');
      return undefined;
    }
    await this.loadSaved();
    return this.winePhotos().find((photo) => photo.id === id);
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

        console.log(`Loaded file with path ${photo.filepath}`);
        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
    this.winePhotos.set(winePhotos);

    console.log('Finished loading gallery');
  }

  // Save picture to file on device
  private async savePicture(photo: Photo, id: string) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = `${id}.jpeg`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    if (this.platform.is('hybrid')) {
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
