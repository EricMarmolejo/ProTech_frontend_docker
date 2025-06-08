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
    private carritoService: CarritoService // inyectar servicio
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

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.getProductos().subscribe({
      next: (data) => {
        const promesas = data.map(async (producto: any) => {
          const categoriaNombre = producto.categoria?.nombre || 'Sin categoría';

          try {
            const stock: any = await lastValueFrom(
              this.stockService.obtenerStockActual(producto._id)
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
          this.productosDestacados = this.obtenerProductosAleatorios(
            productosConStock,
            6
          );
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
    alert(`"${producto.nombre}" se agregó al carrito.`);
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
    }, 4000); // Cambia cada 4 segundos
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
