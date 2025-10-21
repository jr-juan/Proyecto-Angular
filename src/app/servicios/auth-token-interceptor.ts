import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { from, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos el servicio de autenticación de Firebase
  const auth: Auth = inject(Auth);
  // Obtenemos un observable del usuario actual
  const user$ = user(auth);

  return user$.pipe(
    // Tomamos solo el primer valor emitido (el estado actual del usuario) para no quedarnos escuchando.
    take(1),
    // switchMap nos permite cambiar de un observable a otro.
    // Aquí, pasamos del observable del usuario al observable que contendrá la petición modificada.
    switchMap(user => {
      // Si no hay un usuario logueado, dejamos pasar la petición original sin modificarla.
      if (!user) {
        return next(req);
      }

      // Si hay un usuario, obtenemos su ID Token. Esto devuelve una Promesa.
      const tokenPromise = user.getIdToken();

      // Convertimos la Promesa a un Observable 
      return from(tokenPromise).pipe(
        switchMap(token => {
          // Si el token se obtiene correctamente...
          if (token) {
            // Clonamos la petición original y le añadimos el header de Authorization con el token.
            const reqWithToken = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            // Dejamos pasar la petición ya modificada con el token.
            return next(reqWithToken);
          }
          // Si por alguna razón no se pudo obtener el token, dejamos pasar la petición original.
          return next(req);
        })
      );
    })
  );
};