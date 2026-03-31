import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unexpected error occurred';

            if (error.error instanceof ErrorEvent) {
                errorMessage = `Error: ${error.error.message}`;
            } else {
                switch (error.status) {
                    case 401:
                        errorMessage = 'Unauthorized: Please log in again.';
                        toastService.error(errorMessage);
                        router.navigate(['/login']);
                        return throwError(() => error);
                    case 403:
                        errorMessage = 'Forbidden: You do not have permission to access this resource.';
                        break;
                    case 404:
                        errorMessage = 'Not Found: The requested resource was not found.';
                        break;
                    case 500:
                        errorMessage = 'Server Error: Something went wrong on the server.';
                        break;
                    default:
                        if (error.error && error.error.errors) {
                            const errorObj = error.error.errors;
                            const fieldErrors: string[] = [];
                            for (const field in errorObj) {
                                if (Array.isArray(errorObj[field])) {
                                    fieldErrors.push(...errorObj[field]);
                                } else {
                                    fieldErrors.push(errorObj[field]);
                                }
                            }
                            errorMessage = fieldErrors.join(', ') || error.error.title || `Error ${error.status}`;
                        } else if (error.error && error.error.message) {
                            errorMessage = error.error.message;
                        } else if (Array.isArray(error.error)) {
                            errorMessage = error.error.map((e: any) => e.description || e.message).join(', ');
                        } else if (error.error && typeof error.error === 'object') {
                            const errors: string[] = [];
                            for (const key in error.error) {
                                const value = error.error[key];
                                if (typeof value === 'string') {
                                    errors.push(value);
                                } else if (Array.isArray(value)) {
                                    errors.push(...value.filter(v => typeof v === 'string'));
                                }
                            }
                            errorMessage = errors.join(', ') || `Error Code: ${error.status}`;
                        } else {
                            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
                        }
                }
            }

            toastService.error(errorMessage);
            return throwError(() => error);
        })
    );
};
