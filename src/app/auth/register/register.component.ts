import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  selectedAvatarFile: File | null = null;
  maxDate!: string;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.maxDate = new Date().toISOString().split('T')[0];
    this.registerForm = this.fb.group(
      {
        nombre: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(7)]],
        fechaNacimiento: ['', Validators.required],
        genero: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

   private mostrarAlerta(
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

  get f() {
    return this.registerForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

 onSubmit() {
    if (this.registerForm.invalid || !this.selectedAvatarFile) {
      this.registerForm.markAllAsTouched();
      this.mostrarAlerta('error', 'Formulario inválido', 'Por favor completa el formulario correctamente.');
      return;
    }

    const formData = new FormData();
    const formValues = this.registerForm.value;

    for (const key of Object.keys(formValues)) {
      const value = formValues[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    }

    formData.append('avatar', this.selectedAvatarFile);

    this.authService.registrarUsuario(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Serás redirigido al login.',
          background: '#1a1d2e',
          color: '#fff',
          iconColor: '#4c7fdc',
          confirmButtonColor: '#4c7fdc',
          customClass: { popup: 'swal2-dark' }
        }).then(() => this.router.navigate(['/login']));
      },
      error: (error) => {
        const msg = error.error?.message || 'Error al registrar el usuario.';
        this.mostrarAlerta('error', 'Registro fallido', msg);
      }
    });
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedAvatarFile = fileInput.files[0];
    }
  }
}
