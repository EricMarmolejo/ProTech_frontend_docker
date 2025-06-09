import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ReutilizableService } from '../../shared/services/reutilizable.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  Correo = '';
  Contrasena = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: ReutilizableService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.authService.login(this.Correo, this.Contrasena).subscribe({
      next: () => {
        this.alertService.success('Inicio de sesión exitoso');
        this.router.navigate(['/dashboard/inicio']);
      },
      error: (err) => {
        const msg = err.error?.message || 'Credenciales inválidas';
        this.alertService.error('Error de autenticación', msg);
      }
    });
  }
}
