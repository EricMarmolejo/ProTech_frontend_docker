import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  ProductoService,
  Producto,
} from '../../shared/services/productos.service';
import {
  CategoriaService,
  Categoria,
} from '../../shared/services/categorias.service';
import { ReutilizableService } from '../../shared/services/reutilizable.service';

@Component({
  selector: 'app-agregar-productos',
  templateUrl: './agregar-productos.component.html',
  styleUrls: ['./agregar-productos.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AgregarProductosComponent implements OnInit {
  productoform: FormGroup;
  imagenFile: File | null = null;
  nombreArchivo: string = '';
  categorias: Categoria[] = [];

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private alertService: ReutilizableService
  ) {
    this.productoform = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      caracteristicas: [''],
      categoria: ['', Validators.required],
      imagen: [null],
    });
  }

  ngOnInit(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
        this.alertService.error(
          'Error',
          'No se pudieron cargar las categorías.'
        );
      },
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.nombreArchivo = file.name;
      this.imagenFile = file;
      this.productoform.get('imagen')?.setValue(file);
    }
  }

  submit(): void {
    if (this.productoform.invalid) {
      this.alertService.error(
        'Formulario inválido',
        'Por favor complete todos los campos obligatorios.'
      );
      return;
    }

    const formValue = this.productoform.value;
    const formData = new FormData();

    formData.append('nombre', formValue.nombre);
    formData.append('descripcion', formValue.descripcion || '');
    formData.append('precio', formValue.precio.toString());
    formData.append('categoria', formValue.categoria); // Enviamos el _id directamente como string

    // Convertir características a JSON string (ej: ["4K","HDR"])
    const caracteristicasArray = formValue.caracteristicas
      ? formValue.caracteristicas.split(',').map((c: string) => c.trim())
      : [];
    formData.append('caracteristicas', JSON.stringify(caracteristicasArray));

    if (this.imagenFile) {
      formData.append('imagen', this.imagenFile);
    }

    const token = localStorage.getItem('auth_token') || '';

    this.productoService.crearProducto(formData, token).subscribe({
      next: (res: Producto) => {
        this.alertService.success(
          'Producto agregado',
          `Producto ${res.nombre} agregado con éxito.`
        );
        this.productoform.reset();
        this.imagenFile = null;
        this.nombreArchivo = '';
      },
      error: (err) => {
        const mensajeError = err.error?.error || 'Error al agregar producto';
        this.alertService.error('Error', mensajeError);
      },
    });
  }
}
