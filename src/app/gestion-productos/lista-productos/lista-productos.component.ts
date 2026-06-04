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
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

async cargarProductos(): Promise<void> {
  this.cargando = true;
  this.error = '';

  try {
    const response: any = await lastValueFrom(
      this.productoService.getProductos()
    );

    console.log('Respuesta productos:', response);

    const productos = Array.isArray(response)
      ? response
      : response.data || response.productos || [];

    if (!Array.isArray(productos)) {
      throw new Error('La respuesta del servidor no contiene un arreglo de productos');
    }

    this.productos = await Promise.all(
      productos.map(async (producto: any) => {
        try {
          const stock: any = await lastValueFrom(
            this.stockservice.obtenerStockActual(producto._id)
          );

          return {
            ...producto,
            categoriaNombre:
              producto.categoria?.nombre || 'Sin categoría',
            stock: stock?.stock ?? 0,
          };
        } catch (error) {
          console.error(
            `Error al obtener stock para ${producto.nombre}:`,
            error
          );

          return {
            ...producto,
            categoriaNombre:
              producto.categoria?.nombre || 'Sin categoría',
            stock: 0,
          };
        }
      })
    );

    this.extraerCategoriasDisponibles();
  } catch (error) {
    console.error('Error al cargar productos:', error);

    this.error = 'No se pudo cargar la lista de productos.';
    this.productos = [];
  } finally {
    this.cargando = false;
  }
}

  extraerCategoriasDisponibles(): void {
    const categoriasSet = new Set(this.productos.map((p) => p.categoriaNombre));
    this.categoriasDisponibles = Array.from(categoriasSet);
  }

  productosFiltrados(): any[] {
    const min = this.precioMin ? Number(this.precioMin) : null;
    const max = this.precioMax ? Number(this.precioMax) : null;

    const textoBusqueda =
      this.busqueda.trim().toLowerCase();

    return this.productos.filter((p) => {
      const nombre =
        (p.nombre || '').toLowerCase();

      const descripcion =
        (p.descripcion || '').toLowerCase();

      return (
        (!this.filtroCategoria ||
          p.categoriaNombre === this.filtroCategoria) &&
        (!textoBusqueda ||
          nombre.includes(textoBusqueda) ||
          descripcion.includes(textoBusqueda)) &&
        (min === null || p.precio >= min) &&
        (max === null || p.precio <= max)
      );
    });
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
