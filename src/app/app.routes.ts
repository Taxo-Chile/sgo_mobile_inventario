import { Routes } from '@angular/router';
import { authGuard } from './state/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'agenda/:id',
    loadComponent: () =>
      import('./features/agenda/agenda-detail/agenda-detail.page').then(
        (m) => m.AgendaDetailPage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'agenda/:agendaId/tag/:tagId',
    loadComponent: () =>
      import('./features/validacion/tag-detail/tag-detail.page').then(
        (m) => m.TagDetailPage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'agenda/:agendaId/tag/:tagId/capture/:capturaId',
    loadComponent: () =>
      import('./features/validacion/capture-validation/capture-validation.page').then(
        (m) => m.CaptureValidationPage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'pre-variance/:id',
    loadComponent: () =>
      import('./features/pre-variance/pre-variance.page').then(
        (m) => m.PreVariancePage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'recuento/:id',
    loadComponent: () =>
      import('./features/recuento/recuento.page').then(
        (m) => m.RecuentoPage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'cierres/:id',
    loadComponent: () =>
      import('./features/cierres/cierres.page').then(
        (m) => m.CierresPage
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
