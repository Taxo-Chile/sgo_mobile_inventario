import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ConnectivityService } from '../../services/connectivity.service';

@Component({
  selector: 'app-connectivity-banner',
  standalone: true,
  imports: [IonicModule],
  template: `
    @if (!connectivity.isOnline()) {
      <div class="connectivity-banner">
        <ion-icon name="cloud-offline-outline"></ion-icon>
        <span>Sin conexión - Los cambios se sincronizarán cuando vuelva la red</span>
      </div>
    }
  `,
  styles: [
    `
      .connectivity-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--app-warning);
        color: white;
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        justify-content: center;
      }

      ion-icon {
        font-size: 16px;
      }
    `,
  ],
})
export class ConnectivityBannerComponent {
  connectivity = inject(ConnectivityService);
}
