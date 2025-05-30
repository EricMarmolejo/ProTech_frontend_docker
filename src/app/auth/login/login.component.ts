import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import Swal from 'sweetalert2';

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

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private showAlert(
    icon: 'success' | 'error' | 'warning' | 'info',
    title: string,
    text?: string
  ): void {
    Swal.fire({
      icon,
      title,
      text,
      background: '#1a1d2e',
      color: '#fff',
      iconColor: icon === 'success' ? '#4c7fdc' : '#e74c3c',
      confirmButtonColor: '#4c7fdc',
      customClass: {
        popup: 'swal2-dark'
      }
    });
  }

  onSubmit(): void {
    this.authService.login(this.Correo, this.Contrasena).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          background: '#1a1d2e',
          color: '#fff',
          iconColor: '#4c7fdc',
          confirmButtonColor: '#4c7fdc'
        }).then(() => {
          // Redirige a la ruta deseada
          this.router.navigate(['/dashboard/inicio']);
        });
      },
      error: (err) => {
        const msg = err.error?.message || 'Credenciales inválidas';
        this.showAlert('error', 'Error de autenticación', msg);
      }
    });
  }
}
