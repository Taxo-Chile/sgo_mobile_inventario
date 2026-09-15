import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ConnectivityBannerComponent } from './shared/components/connectivity-banner/connectivity-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent],
  template: `
    <ion-app>
      <app-connectivity-banner />
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent {}
