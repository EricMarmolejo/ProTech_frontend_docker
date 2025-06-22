import { Component, OnInit } from '@angular/core';
import { Usuario, UsuarioService } from '../shared/services/Usuarios.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginadorComponent } from '../paginador/paginador.component';
import { ReutilizableService } from '../shared/services/reutilizable.service'; // ✅ Importado

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, PaginadorComponent],
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario = this.usuarioInicial();
  avatarFile: File | null = null;
  paginaActual = 1;
  tamanioPagina = 3;

  constructor(
    private usuarioService: UsuarioService,
    private reutilizableService: ReutilizableService // ✅ Inyectado
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  usuarioInicial(): Usuario {
    return {
      nombre: '',
      correo: '',
      rol: 'cliente',
      genero: 'otro',
      password: '',
    };
  }

  obtenerUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => (this.usuarios = data),
      error: (err) => {
        console.error('Error al obtener usuarios', err);
        this.reutilizableService.error('No se pudieron obtener los usuarios');
      },
    });
  }

  private construirFormData(usuario: Usuario, avatar?: File): FormData {
    const formData = new FormData();
    Object.entries(usuario).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== '_id') {
        formData.append(key, value.toString());
      }
    });
    if (avatar) {
      formData.append('avatar', avatar);
    }
    return formData;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.avatarFile = input.files[0];
    }
  }

  guardarUsuario(): void {
    const { nombre, correo, rol, password } = this.usuarioSeleccionado;

    if (!nombre || !correo || !rol) {
      this.reutilizableService.error(
        'Por favor completa todos los campos requeridos'
      );
      return;
    }

    if (!this.usuarioSeleccionado._id && (!password || password.length < 6)) {
      this.reutilizableService.error(
        'La contraseña debe tener al menos 6 caracteres'
      );
      return;
    }

    const formData = this.construirFormData(
      this.usuarioSeleccionado,
      this.avatarFile || undefined
    );

    if (this.usuarioSeleccionado._id) {
      this.usuarioService
        .actualizarUsuario(this.usuarioSeleccionado._id, formData)
        .subscribe({
          next: () => {
            this.obtenerUsuarios();
            this.usuarioSeleccionado = this.usuarioInicial();
            this.avatarFile = null;
            this.reutilizableService.success(
              'Usuario actualizado correctamente'
            );
          },
          error: (err) => {
            console.error('Error actualizando usuario', err);
            this.reutilizableService.error('Error actualizando el usuario');
          },
        });
    } else {
      this.usuarioService.crearUsuario(formData).subscribe({
        next: () => {
          this.obtenerUsuarios();
          this.usuarioSeleccionado = this.usuarioInicial();
          this.avatarFile = null;
          this.reutilizableService.success('Usuario creado exitosamente');
        },
        error: (err) => {
          console.error('Error creando usuario', err);
          this.reutilizableService.error('No se pudo crear el usuario');
        },
      });
    }
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.avatarFile = null;
  }

  eliminarUsuario(id: string): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.usuarioService.eliminarUsuario(id).subscribe({
        next: () => {
          this.obtenerUsuarios();
          this.reutilizableService.success('Usuario eliminado correctamente');
        },
        error: (err) => {
          console.error('Error eliminando usuario', err);
          this.reutilizableService.error('No se pudo eliminar el usuario');
        },
      });
    }
  }

  cancelar(): void {
    this.usuarioSeleccionado = this.usuarioInicial();
    this.avatarFile = null;
  }

  cambiarAvatar(event: Event, usuario: Usuario): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const avatar = input.files[0];
      const formData = new FormData();

      formData.append('avatar', avatar);
      formData.append('nombre', usuario.nombre);
      formData.append('correo', usuario.correo);
      formData.append('rol', usuario.rol);
      if (usuario.telefono) formData.append('telefono', usuario.telefono);
      if (usuario.genero) formData.append('genero', usuario.genero);

      this.usuarioService.actualizarUsuario(usuario._id!, formData).subscribe({
        next: () => {
          this.obtenerUsuarios();
          this.reutilizableService.success('Avatar actualizado con éxito');
        },
        error: (err) => {
          console.error('Error actualizando avatar', err);
          this.reutilizableService.error('No se pudo actualizar el avatar');
        },
      });
    }
  }

  usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    return this.usuarios.slice(inicio, inicio + this.tamanioPagina);
  }

  onPageChange(event: any): void {
    const nuevaPagina =
      typeof event === 'number' ? event : event.target?.value || 1;
    this.paginaActual = Number(nuevaPagina);
  }
}
