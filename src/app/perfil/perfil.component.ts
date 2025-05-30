import { Component, OnInit } from '@angular/core';
import { PerfilService } from '../shared/services/Perfil.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Usuario } from '../shared/services/Usuarios.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
})
export class PerfilComponent implements OnInit {
  perfil: Usuario | any = null;
  actual = '';
  nueva = '';
  selectedFile: File | null = null;

  direcciones: any[] = [];

  // Para agregar o editar dirección
  direccionForm = {
    id: null as string | null,
    nombreDestinatario: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    telefono: '',
    esPrincipal: false
  };

  constructor(private perfilService: PerfilService) {}

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarDirecciones();
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

  cargarPerfil(): void {
    this.perfilService.obtenerPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.mostrarAlerta('error', 'Error', 'Error al cargar el perfil.');
      }
    });
  }

  actualizarPerfil(nombre: string, telefono: string): void {
    if (!nombre.trim() || !telefono.trim()) {
      this.mostrarAlerta('warning', 'Campos requeridos', 'Nombre y teléfono son obligatorios.');
      return;
    }

    this.perfilService.actualizarPerfil({ nombre, telefono }).subscribe({
      next: () => this.mostrarAlerta('success', 'Éxito', 'Perfil actualizado'),
      error: (err) => {
        console.error('Error actualizando perfil:', err);
        this.mostrarAlerta('error', 'Error', 'Error al actualizar el perfil');
      }
    });
  }

  cambiarContrasena(actual: string, nueva: string): void {
    if (!actual.trim() || !nueva.trim()) {
      this.mostrarAlerta('warning', 'Campos vacíos', 'Por favor completa ambos campos de contraseña.');
      return;
    }

    this.perfilService.cambiarContraseña(actual, nueva).subscribe({
      next: () => {
        this.mostrarAlerta('success', 'Éxito', 'Contraseña actualizada');
        this.actual = '';
        this.nueva = '';
      },
      error: (err) => {
        console.error('Error al cambiar contraseña:', err);
        const msg = err.error?.error || 'Error al cambiar contraseña';
        this.mostrarAlerta('error', 'Error', msg);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  subirAvatar(): void {
    if (!this.selectedFile) {
      this.mostrarAlerta('warning', 'Archivo no seleccionado', 'Selecciona una imagen primero.');
      return;
    }

    this.perfilService.subirAvatar(this.selectedFile).subscribe({
      next: () => {
        this.mostrarAlerta('success', 'Éxito', 'Avatar actualizado');
        this.cargarPerfil();
        this.selectedFile = null;
      },
      error: (err) => {
        console.error('Error al subir avatar:', err);
        this.mostrarAlerta('error', 'Error', 'Error al actualizar el avatar');
      }
    });
  }

  // -------------------------
  // Manejo de direcciones
  // -------------------------

 cargarDirecciones(): void {
    const usuarioId = this.perfilService.getUserIdFromToken();
    if (!usuarioId) {
      this.mostrarAlerta('error', 'Error', 'No se pudo obtener el ID de usuario');
      return;
    }
    this.perfilService.obtenerDireccionesPorUsuario(usuarioId).subscribe({
      next: (data) => (this.direcciones = data),
      error: () => this.mostrarAlerta('error', 'Error al cargar direcciones'),
    });
  }

  agregarDireccion(): void {
    // Validar datos mínimos
    if (!this.direccionForm.nombreDestinatario || !this.direccionForm.direccion) {
      this.mostrarAlerta('warning', 'Complete los campos requeridos');
      return;
    }

    this.perfilService.agregarDireccion(this.direccionForm).subscribe({
      next: () => {
        this.mostrarAlerta('success', 'Dirección agregada');
        this.limpiarFormularioDireccion();
        this.cargarDirecciones();
      },
      error: () => this.mostrarAlerta('error', 'Error al agregar dirección'),
    });
  }

  eliminarDireccion(id: string): void {
    Swal.fire({
      title: '¿Eliminar dirección?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4c7fdc',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.perfilService.eliminarDireccion(id).subscribe({
          next: () => {
            this.mostrarAlerta('success', 'Dirección eliminada');
            this.cargarDirecciones();
          },
          error: () => this.mostrarAlerta('error', 'Error al eliminar dirección'),
        });
      }
    });
  }

  marcarComoPrincipal(id: string): void {
    this.perfilService.establecerPrincipal(id).subscribe({
      next: () => {
        this.mostrarAlerta('success', 'Dirección principal actualizada');
        this.cargarDirecciones();
      },
      error: () => this.mostrarAlerta('error', 'Error al establecer dirección principal'),
    });
  }

  limpiarFormularioDireccion(): void {
    this.direccionForm = {
      id: null,
      nombreDestinatario: '',
      direccion: '',
      ciudad: '',
      departamento: '',
      codigoPostal: '',
      telefono: '',
      esPrincipal: false,
    };
  }
}