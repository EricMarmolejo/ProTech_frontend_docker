import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ProductoService,
  Producto,
  Categoria,
} from '../../shared/services/productos.service';

import { StockService } from '../../shared/services/stock.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { PaginadorComponent } from '../../paginador/paginador.component';
import { ReutilizableService } from '../../shared/services/reutilizable.service'; // <-- NUEVO

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginadorComponent],
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.css'],
})
export class ListaProductosComponent implements OnInit {
  productos: any[] = [];
  cargando = false;
  error = '';
  imagenBaseUrl = 'https://pro-tech-backend.vercel.app/uploads/';
  categoriaNombre: string = '';
  busqueda: string = '';
  filtroCategoria: string = '';
  categoriasDisponibles: string[] = [];
  precioMin: string | null = null;
  precioMax: string | null = null;

  paginaActual = 1;
  tamanioPagina = 2;

  constructor(
    private productoService: ProductoService,
    private router: Router,
    private stockservice: StockService,
    private reutilizableService: ReutilizableService // <-- NUEVO
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.getProductos().subscribe({
      next: (data) => {
        const promesas = data.map(async (producto: any) => {
          const categoriaNombre = producto.categoria?.nombre || 'Sin categoría';

          try {
            const stock: any = await lastValueFrom(
              this.stockservice.obtenerStockActual(producto._id)
            );

            return {
              ...producto,
              categoriaNombre,
              stock: stock?.stock ?? 0,
            };
          } catch (error) {
            console.error(
              `Error al obtener stock para ${producto.nombre}:`,
              error
            );
            return {
              ...producto,
              categoriaNombre,
              stock: 0,
            };
          }
        });

        Promise.all(promesas).then((productosConStock) => {
          this.productos = productosConStock;
          this.extraerCategoriasDisponibles();
          this.cargando = false;
        });
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'No se pudo cargar la lista de productos.';
        this.cargando = false;
      },
    });
  }

  extraerCategoriasDisponibles(): void {
    const categoriasSet = new Set(this.productos.map((p) => p.categoriaNombre));
    this.categoriasDisponibles = Array.from(categoriasSet);
  }

  productosFiltrados(): any[] {
    const min = this.precioMin ? Number(this.precioMin) : null;
    const max = this.precioMax ? Number(this.precioMax) : null;

    return this.productos.filter(
      (p) =>
        (!this.filtroCategoria || p.categoriaNombre === this.filtroCategoria) &&
        (!this.busqueda ||
          p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(this.busqueda.toLowerCase())) &&
        (min === null || p.precio >= min) &&
        (max === null || p.precio <= max)
    );
  }

  productosFiltradosPaginados(): any[] {
    const filtrados = this.productosFiltrados();
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    return filtrados.slice(inicio, inicio + this.tamanioPagina);
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  editarProducto(producto: Producto): void {
    this.router.navigate(['/dashboard/productos/editar', producto._id]);
  }

  eliminarProducto(producto: Producto): void {
    this.reutilizableService
      .confirmDialog(
        '¿Eliminar producto?',
        `¿Estás seguro de eliminar "${producto.nombre}"?`
      )
      .then((confirmado) => {
        if (!confirmado) return;

        const token = localStorage.getItem('token') || '';
        this.productoService.eliminarProducto(producto._id!, token).subscribe({
          next: () => {
            this.productos = this.productos.filter(
              (p) => p._id !== producto._id
            );
            this.reutilizableService.success('Producto eliminado');
          },
          error: (err) => {
            console.error('Error al eliminar producto:', err);
            this.reutilizableService.error(
              'No se pudo eliminar el producto',
              'Ocurrió un error inesperado'
            );
          },
        });
      });
  }

  registrarEntrada(producto: Producto): void {
    this.router.navigate(['/dashboard/stock', producto._id, 'entrada']);
  }

  registrarSalida(producto: Producto): void {
    this.router.navigate(['/dashboard/stock', producto._id, 'salida']);
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroCategoria = '';
    this.precioMin = null;
    this.precioMax = null;
    this.paginaActual = 1;
  }

  verStock(id: string) {
    this.router.navigate(['/dashboard/stock', id]);
  }
}
