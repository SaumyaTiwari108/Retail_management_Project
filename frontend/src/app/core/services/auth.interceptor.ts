import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'An unexpected server error occurred';
      if (error.error && error.error.message) {
        errorMsg = error.error.message;
      } else if (error.status === 401) {
        errorMsg = 'Session expired or invalid credentials';
        authService.logout();
      } else if (error.status === 403) {
        errorMsg = 'Access Denied: You do not have permission for this action';
      } else if (error.status === 0) {
        errorMsg = 'Unable to connect to backend API server at localhost:8080';
      }

      toastService.error(errorMsg);
      return throwError(() => error);
    })
  );
};
