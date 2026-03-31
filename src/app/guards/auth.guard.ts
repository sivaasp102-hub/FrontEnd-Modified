import { inject } from '@angular/core';
import { Router, CanActivateFn, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take, filter, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isInitialized$.pipe(
        filter(initialized => initialized),
        take(1),
        switchMap(() => authService.currentUser$),
        take(1),
        map(user => {
            if (user) {
                const requiredRole = route.data['role'];
                if (requiredRole && !user.roles.includes(requiredRole)) {
                    return router.createUrlTree(['/login']);
                }
                return true;
            }
            return router.createUrlTree(['/login']);
        })
    );
};
