import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import {
  CategoriaService,
  Categoria,
} from '../../shared/services/categorias.service';

@Component({
  selector: 'app-agregar-categorias',
  templateUrl: './agregar-categorias.component.html',
  styleUrls: ['./agregar-categorias.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AgregarCategoriasComponent {
  categoriaForm: FormGroup;
  imagenFile: File | null = null;
  nombreArchivo: string = '';

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
    });
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
      customClass: { popup: 'swal2-dark' },
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.nombreArchivo = file.name;
      this.imagenFile = file;
    }
  }

  submit(): void {
    if (this.categoriaForm.invalid) {
      this.mostrarAlerta(
        'error',
        'Formulario inválido',
        'Por favor completa todos los campos obligatorios.'
      );
      return;
    }

    const formValue = this.categoriaForm.value;
    const formData = new FormData();
    formData.append('nombre', formValue.nombre);
    formData.append('descripcion', formValue.descripcion ?? '');
    if (this.imagenFile) {
      formData.append('imagen', this.imagenFile);
    }

    this.categoriaService.crearCategoria(formData).subscribe({
      next: (res: Categoria) => {
        this.mostrarAlerta(
          'success',
          'Categoría creada',
          `Categoría ${res.nombre} agregada con éxito.`
        );
        this.categoriaForm.reset();
        this.nombreArchivo = '';
        this.imagenFile = null;
      },
      error: (err) => {
        const mensajeError = err.error?.error || 'Error al crear categoría';
        this.mostrarAlerta('error', 'Error', mensajeError);
      },
    });
  }
}
