import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastController = inject(ToastController);

  async success(message: string, duration = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }

  async error(message: string, duration = 3500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      color: 'danger',
      icon: 'alert-circle-outline',
    });
    await toast.present();
  }

  async info(message: string, duration = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      color: 'primary',
      icon: 'information-circle-outline',
    });
    await toast.present();
  }
}
