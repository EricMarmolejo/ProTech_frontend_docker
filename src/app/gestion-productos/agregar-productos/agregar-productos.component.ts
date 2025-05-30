import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { ProductoService, Producto } from '../../shared/services/productos.service';
import { CategoriaService, Categoria } from '../../shared/services/categorias.service';

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
  errorCategorias: string = '';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService
  ) {
    this.productoform = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      caracteristicas: [''],
      categoria: ['', Validators.required],
      imagen: [null]
    });
  }

  ngOnInit(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
        this.errorCategorias = 'No se pudieron cargar las categorías.';
      }
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
      customClass: { popup: 'swal2-dark' }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nombreArchivo = file.name;
      this.imagenFile = file;
      this.productoform.get('imagen')?.setValue(file);
    }
  }

  submit() {
    if (this.productoform.invalid) {
      this.mostrarAlerta('error', 'Formulario inválido', 'Por favor complete todos los campos obligatorios.');
      return;
    }

    const formValue = this.productoform.value;
    const productoData: any = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      precio: formValue.precio,
      categoria: formValue.categoria,
      caracteristicas: formValue.caracteristicas
        ? formValue.caracteristicas.split(',').map((c: string) => c.trim())
        : [],
      imagen: this.imagenFile
    };

    const token = localStorage.getItem('auth_token') || '';

    this.productoService.crearProducto(productoData, token).subscribe({
      next: (res: Producto) => {
        this.mostrarAlerta('success', 'Producto agregado', `Producto ${res.nombre} agregado con éxito.`);
        this.productoform.reset();
        this.imagenFile = null;
        this.nombreArchivo = '';
      },
      error: (err) => {
        const mensajeError = err.error?.error || 'Error al agregar producto';
        this.mostrarAlerta('error', 'Error', mensajeError);
      }
    });
  }
}
