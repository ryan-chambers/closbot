import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  ResolveFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ErrorCode } from '@errors/error.codes';
import { GalleryService, WinePhoto } from '@services/gallery.service';
import { ContentService } from '@services/content.service';
import { ToastService } from '@services/toast.service';

export const photoResolver: ResolveFn<WinePhoto> = async (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
): Promise<WinePhoto | RedirectCommand> => {
  const galleryService = inject(GalleryService);
  const toastService = inject(ToastService);
  const router = inject(Router);
  const contentService = inject(ContentService);

  const photoId = route.paramMap.get('id');

  const photo = await galleryService.getPhotoById(photoId);

  if (!photo) {
    toastService.showToast(contentService.translateError(ErrorCode.INVALID_PHOTO_ID));
    return new RedirectCommand(router.parseUrl('/tabs/gallery'));
  }

  return photo;
};
