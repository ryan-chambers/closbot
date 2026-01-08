import { ErrorHandler, inject, Injectable } from '@angular/core';
import { ToastService } from '@services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CbErrorHandler implements ErrorHandler {
  private readonly toastService = inject(ToastService);

  // any is type specified by angular interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(error: any): void {
    console.error('An error occurred:', error);
    let msg: string;
    if (typeof error === 'string') {
      msg = error;
    } else {
      msg = String(error);
    }
    this.toastService.showToast(msg);
  }
}
