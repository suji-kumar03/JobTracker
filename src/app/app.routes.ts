
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
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./applications/applications')
            .then(m => m.Applications)
      },
      {
        path: 'add-applications',
        loadComponent: () =>
          import('./add-applications/add-applications')
            .then(m => m.AddApplications)
      },
      {
        path: 'add-applications/:id',
        loadComponent: () =>
          import('./add-applications/add-applications')
            .then(m => m.AddApplications)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings')
            .then(m => m.Settings)
      },
      {
        path: 'application-details/:id',
        loadComponent: () =>
          import('./application-details/application-details')
            .then(m => m.ApplicationDetails)
      }
    ]
  },

  
  
{
  path: 'admin',
  component: Layout,
  canActivate: [authGuard],
  data: { role: 'admin' },
  children: [
    {
      path: '',
      loadComponent: () =>
        import('./dashboard/dashboard')
          .then(m => m.Dashboard)
    },
    {
      path: 'applications',
      loadComponent: () =>
        import('./applications/applications')
          .then(m => m.Applications)
    }
  ]
},


 
  {
    path: '**',
    redirectTo: 'login'
  }
];
