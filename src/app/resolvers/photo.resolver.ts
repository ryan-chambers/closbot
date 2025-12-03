import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  MaybeAsync,
  RedirectCommand,
  ResolveFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { GalleryService, WinePhoto } from '@services/gallery.service';
import { ToastService } from '@services/toast.service';

export const photoResolver: ResolveFn<WinePhoto> = async (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
): Promise<WinePhoto | RedirectCommand> => {
  const galleryService = inject(GalleryService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  const photoId = route.paramMap.get('id');

  const photo = await galleryService.getPhotoById(photoId);

  if (!photo) {
    toastService.showToast(`Photo not found`);
    return new RedirectCommand(router.parseUrl('/tabs/gallery'));
  }

  return photo;
};
