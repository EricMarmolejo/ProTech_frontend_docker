import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoriaService, Categoria } from '../../shared/services/categorias.service';
import { ReutilizableService } from '../../shared/services/reutilizable.service';

@Component({
  selector: 'app-editar-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editar-categoria.component.html',
  styleUrls: ['./editar-categoria.component.css']
})
export class EditarCategoriaComponent implements OnInit {
  categoriaForm!: FormGroup;
  categoriaId!: string;
  imagen: File | null = null;
  nombreArchivo: string = '';
  vistaPreviaImagen: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private alertService: ReutilizableService
  ) {}

  ngOnInit(): void {
    this.categoriaId = this.route.snapshot.paramMap.get('id')!;
    this.inicializarFormulario();
    this.cargarCategoria();
  }

  inicializarFormulario(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
    });
  }

  cargarCategoria(): void {
    this.categoriaService.obtenerCategoriaPorId(this.categoriaId).subscribe({
      next: (categoria: Categoria) => {
        this.categoriaForm.patchValue({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
        });
        if (categoria.imagen) {
          this.vistaPreviaImagen = categoria.imagen;
        }
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo cargar la categoría.');
      },
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagen = file;
      this.nombreArchivo = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.vistaPreviaImagen = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submit(): void {
    if (this.categoriaForm.invalid) {
      this.alertService.error('Formulario inválido', 'Complete todos los campos.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.categoriaForm.value.nombre);
    formData.append('descripcion', this.categoriaForm.value.descripcion);

    if (this.imagen) {
      formData.append('imagen', this.imagen);
    }

    this.categoriaService.actualizarCategoria(this.categoriaId, formData).subscribe({
      next: (res: Categoria) => {
        this.alertService.success(
          'Categoría actualizada',
          `Categoría "${res.nombre}" actualizada con éxito.`
        );
        this.router.navigate(['/dashboard/categorias']);
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'Error al actualizar la categoría.';
        this.alertService.error('Error', mensajeError);
      },
    });
  }
}
