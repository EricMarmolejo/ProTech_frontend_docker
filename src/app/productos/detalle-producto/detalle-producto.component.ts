import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../shared/services/productos.service';
import { CommonModule, Location } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { StockService } from '../../shared/services/stock.service';
import { CarritoService } from '../../shared/services/carrito.service';
import { ReutilizableService } from '../../shared/services/reutilizable.service';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css',
})
export class DetalleProductoComponent implements OnInit {
  producto: any = null;
  loading = true;
  imagenBaseUrl = 'https://pro-tech-backend.vercel.app/uploads/';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private location: Location,
    private stockService: StockService,
    private carritoService: CarritoService,
    private reutilizableService: ReutilizableService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProducto();
  }

  async cargarProducto(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'ID de producto inválido.';
      this.loading = false;
      return;
    }

    try {
      const response: any = await lastValueFrom(
        this.productoService.getProductoPorId(id)
      );

      console.log('Producto recibido:', response);

      const data =
        response?.data ||
        response?.producto ||
        response;

      if (!data || !data._id) {
        throw new Error('Producto no encontrado');
      }

      const categoriaNombre =
        data?.categoria?.nombre || 'Sin categoría';

      let stockActual = 0;

      try {
        const stockResponse: any = await lastValueFrom(
          this.stockService.obtenerStockActual(id)
        );

        stockActual =
          stockResponse?.stock ??
          stockResponse?.data?.stock ??
          0;
      } catch (stockError) {
        console.error(
          'Error obteniendo stock:',
          stockError
        );
      }

      this.producto = {
        ...data,
        categoriaNombre,
        stock: stockActual,
      };
    } catch (error) {
      console.error('Error al cargar producto:', error);

      this.error = 'No se pudo cargar el producto.';

      this.reutilizableService.error(
        'Error',
        'No se pudo cargar la información del producto.'
      );
    } finally {
      this.loading = false;
    }
  }

  volver(): void {
    this.location.back();
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

    this.reutilizableService
      .confirmDialogConDosOpciones(
        `"${producto.nombre}" agregado al carrito`,
        '¿Qué deseas hacer ahora?',
        'Ir al carrito',
        'Seguir comprando'
      )
      .then((irAlCarrito) => {
        if (irAlCarrito) {
          this.router.navigate(['/dashboard/carrito']);
        }
      });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.src =
      'https://via.placeholder.com/400x300?text=Producto';
  }
}