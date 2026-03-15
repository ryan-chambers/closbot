import { computed, inject, Injectable, signal } from '@angular/core';
import { CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { CameraService } from './camera.service';
import { WinePhoto } from '@models/photo.model';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private readonly cameraService = inject(CameraService);

  private readonly platform = inject(Platform);

  winePhotos = signal<WinePhoto[]>([]);

  filteredPhotos = computed(() => {
    let result = this.winePhotos();
    const tag = this.selectedTag();
    if (tag && this.uniqueLabels().includes(tag)) {
      result = result.filter((photo) => photo.labels?.includes(tag));
    }

    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter((photo) =>
        photo.labels?.some((label) => label.toLowerCase().includes(term)),
      );
    }

    return result;
  });

  private WINE_PHOTO_STORAGE = 'winePhotos';

  searchTerm = signal('');
  selectedTag = signal<string | null>(null);

  private _loaded = false;

  constructor() {
    this.loadSavedOnce();
  }

  private async loadSavedOnce() {
    if (!this._loaded) {
      await this.loadSaved();
      this._loaded = true;
    }
  }

  uniqueLabels = computed(() => {
    const labels = new Set<string>(this.winePhotos().flatMap((photo) => photo.labels ?? []));
    return Array.from(labels).sort();
  });

  public async addNewToGallery(source: CameraSource): Promise<boolean> {
    console.log(`Adding photo to gallery`);
    const capturedPhoto: Photo | undefined = await this.cameraService.takePhoto(source);

    if (!capturedPhoto) {
      return Promise.resolve(false);
    }

    console.log(
      `Captured photo at path ${capturedPhoto.path} and webPath ${capturedPhoto.webPath}`,
    );

    // Save the picture and add it to gallery
    const id = String(Date.now());
    const savedImageFile = await this.savePicture(capturedPhoto, id);
    const newPhoto: WinePhoto = {
      ...savedImageFile,
      id,
      date: new Date().toISOString(),
    };

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

  public getPhotoById(id: string | null): WinePhoto | undefined {
    if (!id) {
      console.warn('Asked for null id');
      return undefined;
    }

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
      for (const photo of winePhotos) {
        // Read each saved photo's data from the Filesystem
        console.log(`Trying to read file at path ${photo.filepath}`);
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        // console.log(`Loaded file with path ${photo.filepath}`);
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
    console.log(`Trying to read photo at URL ${photo.path}`);
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
      console.log(`Trying to read base 64 file at path ${photo.path}`);
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

  async getPhotoImageAsBase64(photo: WinePhoto): Promise<string> {
    let path = photo.filepath;
    if (this.platform.is('hybrid')) {
      // Extract just the filename, removing the file:// protocol and directory path
      path =
        photo.filepath
          .replace(/^file:\/\//, '')
          .split('/')
          .pop() ?? photo.filepath;
      console.log(`Running on hybrid, adjusted path: ${path}`);
    }

    const photoFile = await Filesystem.readFile({
      path,
      directory: Directory.Data,
    });

    // TODO need to test this on browser once it is working again
    return `data:image/jpeg;base64,${photoFile.data as string}`;
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

  getNextPhotoId(currentId: string): string | undefined {
    const photos = this.winePhotos();
    const currentIndex = photos.findIndex((p) => p.id === currentId);
    if (currentIndex >= 0 && currentIndex < photos.length - 1) {
      return photos[currentIndex + 1].id;
    }
    return undefined;
  }

  getPreviousPhotoId(currentId: string): string | undefined {
    const photos = this.winePhotos();
    const currentIndex = photos.findIndex((p) => p.id === currentId);
    if (currentIndex > 0) {
      return photos[currentIndex - 1].id;
    }
    return undefined;
  }

  async addLabelToPhoto(photoId: string, label: string) {
    const photo = this.getPhotoById(photoId);

    if (!photo) {
      console.warn(`Tried to add label to photo with id ${photoId} but not found`);
      return;
    }

    if (photo.labels?.includes(label)) {
      return;
    }

    const updated = this.winePhotos().map((p) =>
      p.id === photoId ? { ...p, labels: [...(p.labels ?? []), label] } : p,
    );

    this.savePhotos(updated);
  }

  async removeLabelFromPhoto(photoId: string, label: string) {
    const updated = this.winePhotos().map((p) => {
      if (p.id === photoId) {
        return { ...p, labels: p.labels?.filter((l) => l !== label) ?? [] };
      }
      return p;
    });

    this.savePhotos(updated);
  }

  selectTag(tag: string) {
    this.selectedTag.update((current) => (current === tag ? null : tag));
  }
}
