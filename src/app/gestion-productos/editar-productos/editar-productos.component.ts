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

import {
  ProductoService,
  Producto,
  Categoria,
} from '../../shared/services/productos.service';
import { CategoriaService } from '../../shared/services/categorias.service';
import { ReutilizableService } from '../../shared/services/reutilizable.service';

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
    private categoriaService: CategoriaService,
    private alertService: ReutilizableService
  ) {}

  ngOnInit(): void {
    this.productoId = this.route.snapshot.paramMap.get('id')!;
    this.inicializarFormulario();
    this.cargarCategorias();
    this.cargarProducto();
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

  submit(): void {
    if (this.productoForm.invalid) {
      this.alertService.error(
        'Formulario inválido',
        'Por favor complete todos los campos obligatorios.'
      );
      return;
    }

    const valores = this.productoForm.value;
    const token = localStorage.getItem('auth_token') || '';

    const productoData: any = {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      categoria: valores.categoria,
    };

    if (
      typeof valores.caracteristicas === 'string' &&
      valores.caracteristicas.trim() !== ''
    ) {
      productoData.caracteristicas = valores.caracteristicas
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0);
    }
    console.log('Valores:' + valores);
    console.log('Producto data: ' + productoData.nombre);
    console.log('Imagen: ' + this.imagen);
    const formData = new FormData();
    formData.append('nombre', productoData.nombre);
    formData.append('descripcion', productoData.descripcion);
    formData.append('precio', productoData.precio.toString());
    formData.append('categoria', productoData.categoria);

    if (productoData.caracteristicas) {
      productoData.caracteristicas.forEach((c: string, i: number) => {
        formData.append(`caracteristicas[${i}]`, c);
      });
    }

    if (this.imagen) {
      formData.append('imagen', this.imagen);
    }

    this.productoService
      .actualizarProducto(this.productoId, formData, token)
      .subscribe({
        next: (res: Producto) => {
          this.alertService.success(
            'Producto actualizado',
            `Producto ${res.nombre} actualizado con éxito.`
          );
          this.router.navigate(['/dashboard/productos']);
        },
        error: (err) => {
          const mensajeError =
            err.error?.mensaje || 'Error al actualizar producto';
          this.alertService.error('Error', mensajeError);
        },
      });
  }
}
