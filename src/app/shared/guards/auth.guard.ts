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

    // Verifica si el usuario ha iniciado sesión
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verifica si se requieren roles específicos para esta ruta
    const expectedRoles = route.data?.['roles'] as string[] | undefined;
    const userRole = this.authService.getRol(); // Asegúrate que este método retorne string | null

    if (expectedRoles && (!userRole || !expectedRoles.includes(userRole))) {
      // Si el usuario no tiene rol o su rol no está permitido, redirige
      this.router.navigate(['/dashboard/inicio']);
      return false;
    }

    // Autenticado y autorizado
    return true;
  }
}
