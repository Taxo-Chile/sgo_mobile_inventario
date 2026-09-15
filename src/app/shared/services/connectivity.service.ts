import { Injectable, signal, OnInit } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly isOnline = signal(true);

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const status = await Network.getStatus();
      this.isOnline.set(status.connected);

      Network.addListener('networkStatusChange', (status) => {
        this.isOnline.set(status.connected);
      });
    } catch {
      this.isOnline.set(navigator.onLine);
      window.addEventListener('online', () => this.isOnline.set(true));
      window.addEventListener('offline', () => this.isOnline.set(false));
    }
  }
}
