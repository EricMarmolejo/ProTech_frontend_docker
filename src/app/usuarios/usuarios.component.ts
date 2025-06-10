import { Component, OnInit } from '@angular/core';
import { Usuario, UsuarioService } from '../shared/services/Usuarios.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginadorComponent } from '../paginador/paginador.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule,PaginadorComponent],
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario = this.usuarioInicial();
  avatarFile: File | null = null;
  paginaActual = 1;
  tamanioPagina = 3;
  constructor(private usuarioService: UsuarioService) {}

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
      error: (err) => console.error('Error al obtener usuarios', err),
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
    alert('Por favor completa todos los campos requeridos');
    return;
  }

  if (!this.usuarioSeleccionado._id && (!password || password.length < 6)) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  const formData = this.construirFormData(this.usuarioSeleccionado, this.avatarFile || undefined);

  if (this.usuarioSeleccionado._id) {
    this.usuarioService.actualizarUsuario(this.usuarioSeleccionado._id, formData).subscribe({
      next: () => {
        this.obtenerUsuarios();
        this.usuarioSeleccionado = this.usuarioInicial();
        this.avatarFile = null;
      },
      error: (err) => console.error('Error actualizando usuario', err),
    });
  } else {
    this.usuarioService.crearUsuario(formData).subscribe({
      next: () => {
        this.obtenerUsuarios();
        this.usuarioSeleccionado = this.usuarioInicial();
        this.avatarFile = null;
      },
      error: (err) => console.error('Error creando usuario', err),
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
        next: () => this.obtenerUsuarios(),
        error: (err) => console.error('Error eliminando usuario', err),
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
    // Añadir campos obligatorios para evitar el error de validación:
    formData.append('nombre', usuario.nombre);
    formData.append('correo', usuario.correo);
    formData.append('rol', usuario.rol);

    // También puedes agregar campos opcionales si quieres:
    if (usuario.telefono) formData.append('telefono', usuario.telefono);
    if (usuario.genero) formData.append('genero', usuario.genero);
    // No incluyas _id ni contraseña aquí.

    this.usuarioService.actualizarUsuario(usuario._id!, formData).subscribe(() => this.obtenerUsuarios());
  }
}
usuariosPaginados(): Usuario[] {
  const inicio = (this.paginaActual - 1) * this.tamanioPagina;
  return this.usuarios.slice(inicio, inicio + this.tamanioPagina);
}
onPageChange(event: any): void {
  const nuevaPagina = typeof event === 'number' ? event : (event.target?.value || 1);
  this.paginaActual = Number(nuevaPagina);
}

}
