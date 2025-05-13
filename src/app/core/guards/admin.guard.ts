import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isGerenteGeneral = this.authService.isGerenteGeneral();
    console.log('AdminGuard: ¿Es GERENTE_GENERAL?', isGerenteGeneral);
    console.log('AdminGuard: Rol actual:', this.authService.getRol());
    if (isGerenteGeneral) {
      return true;
    } else {
      this.router.navigate(['/']); // Cambiar de /dashboard a /
      return false;
    }
  }
}