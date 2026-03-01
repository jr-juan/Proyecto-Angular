import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.rolUsuario$.pipe(
    filter((rol) => rol !== undefined), // esperamos que Firebase responda
    take(1),
    map((rol) => {
      if (rol === null) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    }),
  );
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.rolUsuario$.pipe(
    filter((rol) => rol !== undefined),
    take(1),
    map((rol) => {
      if (rol === 'admin') return true;
      router.navigate(['/chofer']);
      return false;
    }),
  );
};

export const choferGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.rolUsuario$.pipe(
    filter((rol) => rol !== undefined),
    take(1),
    map((rol) => {
      if (rol === 'chofer') return true;
      router.navigate(['/tablero']);
      return false;
    }),
  );
};
