import { Component, OnDestroy, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { ConnectivityBannerComponent } from './shared/components/connectivity-banner/connectivity-banner.component';
import './shared/icons';

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
export class AppComponent implements OnDestroy {
  private router = inject(Router);
  private sub: Subscription;

  constructor() {
    this.sub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        const active = document.activeElement as HTMLElement | null;
        if (active && active !== document.body) {
          active.blur();
        }
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
