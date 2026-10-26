
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const loggedInEmail = localStorage.getItem('loggedInEmail');

  if (!loggedInEmail) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
