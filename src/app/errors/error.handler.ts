import { ErrorHandler, Injectable } from '@angular/core';
import { ToastService } from '@services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CbErrorHandler implements ErrorHandler {
  constructor(private toastService: ToastService) {}

  handleError(error: any): void {
    console.error('An error occurred:', error);
    this.toastService.showToast(error.message);
  }
}
