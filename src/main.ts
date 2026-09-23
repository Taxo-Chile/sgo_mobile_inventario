import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  calculatorOutline,
  lockClosedOutline,
  mapOutline,
  chevronForward,
  checkmarkCircle,
  alertCircleOutline,
  storefrontOutline,
  calendarOutline,
  pricetagOutline,
  homeOutline,
  statsChartOutline,
  settingsOutline,
  moonOutline,
  sunnyOutline,
  logOutOutline,
  chevronForwardOutline,
  addCircleOutline,
  create,
  trashOutline,
  refreshOutline,
  documentTextOutline,
  printOutline,
  clipboardOutline,
} from 'ionicons/icons';

addIcons({
  'analytics-outline': analyticsOutline,
  'calculator-outline': calculatorOutline,
  'lock-closed-outline': lockClosedOutline,
  'map-outline': mapOutline,
  'chevron-forward': chevronForward,
  'chevron-forward-outline': chevronForwardOutline,
  'checkmark-circle': checkmarkCircle,
  'alert-circle-outline': alertCircleOutline,
  'storefront-outline': storefrontOutline,
  'calendar-outline': calendarOutline,
  'pricetag-outline': pricetagOutline,
  'home-outline': homeOutline,
  'stats-chart-outline': statsChartOutline,
  'settings-outline': settingsOutline,
  'moon-outline': moonOutline,
  'sunny-outline': sunnyOutline,
  'log-out-outline': logOutOutline,
  'add-circle-outline': addCircleOutline,
  'create': create,
  'trash-outline': trashOutline,
  'refresh-outline': refreshOutline,
  'document-text-outline': documentTextOutline,
  'print-outline': printOutline,
  'clipboard-outline': clipboardOutline,
});

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
