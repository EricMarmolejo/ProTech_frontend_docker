import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ProductoService,
  Producto,
} from '../shared/services/productos.service';
import { StockService } from '../shared/services/stock.service';
import { HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CarritoService } from '../shared/services/carrito.service';
import { ReutilizableService } from '../shared/services/reutilizable.service'; // <-- NUEVO

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
})
export class InicioComponent implements OnInit {
  usuario = '';
  rol = '';
  productos: any[] = [];
  productosDestacados: any[] = [];
  categoriasDisponibles: string[] = [];
  cargando = false;
  error = '';
  imagenBaseUrl = 'https://pro-tech-backend.vercel.app/uploads/';
  currentIndex = 0;
  intervalId: any;
  productosPorVista = 2;

  constructor(
    private authService: AuthService,
    private productoService: ProductoService,
    private stockService: StockService,
    private router: Router,
    private carritoService: CarritoService,
    private reutilizableService: ReutilizableService // <-- NUEVO
  ) {}

  ngOnInit(): void {
    const usuarioObj = this.authService.getUsuario();
    this.usuario = usuarioObj ? usuarioObj.nombre : 'Invitado';
    this.rol = this.authService.getRol() ?? 'cliente';
    this.cargarProductos();
    this.iniciarCarruselAuto();
  }

  isAdmin(): boolean {
    return this.rol === 'admin';
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
      throw new Error(
        'La respuesta del servidor no contiene un arreglo de productos'
      );
    }

    this.productos = await Promise.all(
      productos.map(async (producto: any) => {
        try {
          const stock: any = await lastValueFrom(
            this.stockService.obtenerStockActual(
              producto._id
            )
          );

          return {
            ...producto,
            categoriaNombre:
              producto.categoria?.nombre ||
              'Sin categoría',
            stock:
              stock?.stock ??
              stock?.data?.stock ??
              0,
          };
        } catch (error) {
          console.error(
            `Error al obtener stock para ${producto.nombre}:`,
            error
          );

          return {
            ...producto,
            categoriaNombre:
              producto.categoria?.nombre ||
              'Sin categoría',
            stock: 0,
          };
        }
      })
    );

    this.extraerCategoriasDisponibles();

    // Productos destacados para el carrusel
    this.productosDestacados =
      this.obtenerProductosAleatorios(
        this.productos,
        Math.min(8, this.productos.length)
      );

    this.currentIndex = 0;
  } catch (error) {
    console.error(
      'Error al cargar productos:',
      error
    );

    this.error =
      'No se pudo cargar la lista de productos.';

    this.productos = [];
    this.productosDestacados = [];
  } finally {
    this.cargando = false;
  }
}

  extraerCategoriasDisponibles(): void {
    const categoriasSet = new Set(this.productos.map((p) => p.categoriaNombre));
    this.categoriasDisponibles = Array.from(categoriasSet);
  }

  verDetalles(id: string): void {
    this.router.navigate(['/dashboard/producto', id]);
  }

  agregarAlCarrito(producto: any): void {
  if (!producto) {
    return;
  }

  if (producto.stock <= 0) {
    this.reutilizableService.warning(
      'Sin stock',
      'Este producto no tiene unidades disponibles.'
    );
    return;
  }

  const productoCarrito = {
    productoId: producto._id,
    nombre: producto.nombre,
    precio: producto.precio,
    imagen: producto.imagen,
    stock: producto.stock,
  };

  this.carritoService.agregarProducto(productoCarrito);

  this.reutilizableService.success(
    'Producto agregado',
    `"${producto.nombre}" fue agregado al carrito.`
  );
}
  obtenerProductosAleatorios(productos: any[], cantidad: number): any[] {
    const copia = [...productos];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia.slice(0, cantidad);
  }

  iniciarCarruselAuto(): void {
    this.intervalId = setInterval(() => {
      if (this.productosDestacados.length > 0) {
        const maxIndex =
          Math.ceil(this.productosDestacados.length / this.productosPorVista) -
          1;
        this.currentIndex =
          this.currentIndex + 1 > maxIndex ? 0 : this.currentIndex + 1;
      }
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
