import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../shared/services/productos.service';
import { StockService } from '../../shared/services/stock.service';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CarritoService } from '../../shared/services/carrito.service';
import { PaginadorComponent } from '../../paginador/paginador.component';
import { ReutilizableService } from '../../shared/services/reutilizable.service';

@Component({
  selector: 'app-lista-productos-cliente',
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
  busqueda = '';
  filtroCategoria = '';
  categoriasDisponibles: { nombre: string; imagen: string }[] = [];

  precioMin: string | null = null;
  precioMax: string | null = null;
  paginaActual = 1;
  tamanioPagina = 3; // O cualquier número que desees por página

   constructor(
    private productoService: ProductoService,
    private stockService: StockService,
    private router: Router,
    private carritoService: CarritoService,
    private reutilizableService: ReutilizableService // ⬅️ Inyectar servicio
  ) {}

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
            this.stockService.obtenerStockActual(producto._id)
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
    const mapa = new Map<string, string>(); // nombre => imagen

    for (const prod of this.productos) {
      const nombre = prod.categoriaNombre;
      const imagen = prod.categoria?.imagen || 'default.jpg'; // usa una imagen por defecto
      if (!mapa.has(nombre)) {
        mapa.set(nombre, imagen);
      }
    }

    this.categoriasDisponibles = Array.from(mapa.entries()).map(
      ([nombre, imagen]) => ({ nombre, imagen })
    );
  }

  productosFiltrados(): any[] {
    const filtrados = this.productosFiltradosSinPaginar();
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    return filtrados.slice(inicio, fin);
  }

productosFiltradosSinPaginar(): any[] {
  const min = this.precioMin ? Number(this.precioMin) : null;
  const max = this.precioMax ? Number(this.precioMax) : null;

  const textoBusqueda = this.busqueda
    .trim()
    .toLowerCase();

  return this.productos.filter((p) => {
    const descripcion =
      (p.descripcion || '').toLowerCase();

    const nombre =
      (p.nombre || '').toLowerCase();

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

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroCategoria = '';
    this.precioMin = null;
    this.precioMax = null;
    this.paginaActual = 1;
  }

  verDetalles(id: string): void {
    this.router.navigate(['/dashboard/producto', id]);
  }

agregarAlCarrito(producto: any): void {
  const productoCarrito: any = {
    productoId: producto._id,
    nombre: producto.nombre,
    precio: producto.precio,
    imagen: producto.imagen,
    stock: producto.stock,
  };

  this.carritoService.agregarProducto(productoCarrito);

  this.reutilizableService.confirmDialogConDosOpciones(
    `"${producto.nombre}" agregado al carrito`,
    '¿Qué deseas hacer ahora?',
    'Ir al carrito',
    'Seguir comprando'
  ).then((irAlCarrito) => {
    if (irAlCarrito) {
      this.router.navigate(['/dashboard/carrito']);
    }
  });
}

  seleccionarCategoria(categoria: string): void {
    this.filtroCategoria = categoria;
    this.paginaActual = 1;
  }
  paginaCategorias = 1;
tamanoPaginaCategorias = 4;

categoriasPaginadas() {
  const inicio = (this.paginaCategorias - 1) * this.tamanoPaginaCategorias;
  const fin = inicio + this.tamanoPaginaCategorias;
  return this.categoriasDisponibles.slice(inicio, fin);
}

totalPaginasCategorias() {
  return Math.ceil(this.categoriasDisponibles.length / this.tamanoPaginaCategorias);
}
paginaAnteriorCategorias(): void {
  if (this.paginaCategorias > 1) {
    this.paginaCategorias--;
  }
}

paginaSiguienteCategorias(): void {
  if (this.paginaCategorias < this.totalPaginasCategorias()) {
    this.paginaCategorias++;
  }
}
onImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = this.imagenBaseUrl + 'default.jpg'; // o la ruta a una imagen por defecto válida
}



}
