import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaService, Categoria } from '../../shared/services/categorias.service';
import { ReutilizableService } from '../../shared/services/reutilizable.service'; // Asegúrate de importar correctamente

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
    private categoriaService: CategoriaService,
    private alertService: ReutilizableService
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
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
      this.alertService.error(
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
        this.alertService.success(
          'Categoría creada',
          `Categoría ${res.nombre} agregada con éxito.`
        );
        this.categoriaForm.reset();
        this.nombreArchivo = '';
        this.imagenFile = null;
      },
      error: (err) => {
        const mensajeError = err.error?.error || 'Error al crear categoría';
        this.alertService.error('Error', mensajeError);
      },
    });
  }
}
