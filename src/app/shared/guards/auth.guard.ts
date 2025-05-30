import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRoles = route.data?.['roles'] as string[];
    const userRole = this.authService.getRol() ?? '';

    if (expectedRoles && !expectedRoles.includes(userRole)) {
      this.router.navigate(['/inicio']);
      return false;
    }

    return true;
  }
}
