import { HttpInterceptorFn } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const auth = inject(AuthService);
  const router = inject(Router);

  const authReq = token ? req.clone({
	headers: req.headers.set('Authorization', `Bearer ${token}`)
  }) : req;

  return next(authReq).pipe(
	catchError((err) => {
		if (err.status === 401) {
			auth.logout();
			router.navigate(['/login']);
			}
		return throwError(() => err);
	})
  );
};

export const authGuard: CanActivateFn = () => {
	const auth = inject(AuthService);
	const router = inject(Router);
	return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
