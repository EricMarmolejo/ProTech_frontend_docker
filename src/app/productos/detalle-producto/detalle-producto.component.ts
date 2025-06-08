import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../shared/services/productos.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { StockService } from '../../shared/services/stock.service';
import { CarritoService } from '../../shared/services/carrito.service';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css',
})
export class DetalleProductoComponent implements OnInit {
  producto: any;
  loading = true;
  imagenBaseUrl = 'https://pro-tech-backend.vercel.app/uploads/';

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private location: Location,
    private stockService : StockService,
    private carritoService: CarritoService // inyectar

  ) {}

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  if (!id) {
    console.error('ID del producto no encontrado en la URL.');
    this.loading = false;
    return;
  }

  this.productoService.getProductoPorId(id).subscribe({
    next: async (data) => {
      try {
        const categoriaNombre = data.categoria?.nombre || 'Sin categoría';

        const stock: any = await lastValueFrom(
          this.stockService.obtenerStockActual(id)
        );

        this.producto = {
          ...data,
          categoriaNombre,
          stock: stock?.stock ?? 0,
        };
      } catch (error) {
        console.error(`Error al obtener stock para ${data.nombre}:`, error);

        this.producto = {
          ...data,
          categoriaNombre: data.categoria?.nombre || 'Sin categoría',
          stock: 0,
        };
      } finally {
        this.loading = false;
      }
    },
    error: (err) => {
      console.error('Error al cargar producto:', err);
      this.loading = false;
    },
  });
}


  volver(): void {
    this.location.back();
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
}
