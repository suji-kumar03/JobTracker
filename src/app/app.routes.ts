import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Layout } from './layout/layout';
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },

  {
    path: 'signup',
    component: Signup
  },
  {
    path: '',
    component: Layout,
    children: [
      {
      path: 'dashboard',
      loadComponent: () =>
        import('./dashboard/dashboard')
          .then(m => m.Dashboard),
      canActivate: [authGuard]
    },
    {
      path: 'applications',
      loadComponent: () =>
        import('./applications/applications')
          .then(m => m.Applications),
      canActivate: [authGuard]
    }, {
      path: 'add-applications',
      loadComponent: () =>
        import('./add-applications/add-applications')
          .then(m => m.AddApplications),
      canActivate: [authGuard]
    },
    {
      path: 'add-applications/:id',
      loadComponent: () =>
        import('./add-applications/add-applications')
          .then(m => m.AddApplications),
      canActivate: [authGuard]
    },

    {
      path: 'settings',
      loadComponent: () =>
        import('./settings/settings')
          .then(m => m.Settings),
      canActivate: [authGuard]
    },
    {
      path: 'application-details/:id',
      loadComponent: () =>
        import('./application-details/application-details')
          .then(m => m.ApplicationDetails),
      canActivate: [authGuard]
    }
    ]
  }

];
