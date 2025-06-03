import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ProductoService,
  Producto,
  Categoria,
} from '../../shared/services/productos.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoriaService } from '../../shared/services/categorias.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editar-productos.component.html',
  styleUrls: ['./editar-productos.component.css'],
})
export class EditarProductosComponent implements OnInit {
  productoForm!: FormGroup;
  categorias: Categoria[] = [];
  nombreArchivo: string = '';
  productoId!: string;
  imagen: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.productoId = this.route.snapshot.paramMap.get('id')!;
    this.cargarCategorias();
    this.cargarProducto();
    this.inicializarFormulario();
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

  inicializarFormulario(): void {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      caracteristicas: [''],
    });
  }

  cargarProducto(): void {
    this.productoService
      .getProductoPorId(this.productoId)
      .subscribe((producto: Producto) => {
        this.productoForm.patchValue({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          categoria: producto.categoria?._id,
          caracteristicas: producto.caracteristicas,
        });
      });
  }

  cargarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe((cats: Categoria[]) => {
      this.categorias = cats;
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagen = file;
      this.nombreArchivo = file.name;
    }
  }

  submit() {
    if (this.productoForm.invalid) {
      this.mostrarAlerta(
        'error',
        'Formulario inválido',
        'Por favor complete todos los campos obligatorios.'
      );
      return;
    }

    const valores = this.productoForm.value;

    const productoData: any = {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      categoria: valores.categoria,
    };

    // Verificar que caracteristicas exista y sea string no vacío
    if (
      typeof valores.caracteristicas === 'string' &&
      valores.caracteristicas.trim() !== ''
    ) {
      productoData.caracteristicas = valores.caracteristicas
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0);
    }

    const token = localStorage.getItem('auth_token') || '';

    this.productoService
      .actualizarProducto(this.productoId, productoData, token)
      .subscribe({
        next: (res: Producto) => {
          this.mostrarAlerta(
            'success',
            'Producto actualizado',
            `Producto ${res.nombre} actualizado con éxito.`
          );
          this.router.navigate(['/dashboard/productos']);
        },
        error: (err) => {
          const mensajeError =
            err.error?.mensaje || 'Error al actualizar producto';
          this.mostrarAlerta('error', 'Error', mensajeError);
        },
      });
  }
}
