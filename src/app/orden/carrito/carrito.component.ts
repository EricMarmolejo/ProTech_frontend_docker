import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CarritoService,
  ItemCarrito,
} from '../../shared/services/carrito.service';
import { ReutilizableService } from '../../shared/services/reutilizable.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { PaginadorComponent } from '../../paginador/paginador.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, PaginadorComponent],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements OnInit {
  items$: Observable<ItemCarrito[]>;
  total = 0;
  paginaActual = 1;
  tamanioPagina = 2;
  items: ItemCarrito[] = [];

  constructor(
    private carritoService: CarritoService,
    public router: Router,
    private reutilizableService: ReutilizableService
  ) {
    this.items$ = this.carritoService.carrito$;
  }

  ngOnInit(): void {
    this.items$.subscribe((items) => {
      this.items = items;
      this.total = items.reduce(
        (acc, item) => acc + item.producto.precio * item.cantidad,
        0
      );
    });
  }

  cambiarCantidad(item: ItemCarrito, cambio: number): void {
    let nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad < 1) {
      nuevaCantidad = 1;
    } else if (nuevaCantidad > item.producto.stock) {
      nuevaCantidad = item.producto.stock;
    }

    this.carritoService.actualizarCantidad(
      item.producto.productoId,
      nuevaCantidad
    );
  }

  actualizarCantidad(item: ItemCarrito, event: any): void {
    let nuevaCantidad = +event.target.value;

    if (nuevaCantidad < 1) {
      nuevaCantidad = 1; // mínimo 1
    }

    if (nuevaCantidad > item.producto.stock) {
      nuevaCantidad = item.producto.stock; // límite stock
      // Opcional: puedes mostrar un mensaje o toast aquí notificando al usuario
    }

    this.carritoService.actualizarCantidad(
      item.producto.productoId,
      nuevaCantidad
    );
  }

  eliminarDelCarrito(item: ItemCarrito) {
    this.reutilizableService
      .confirmDialog(
        `¿Eliminar "${item.producto.nombre}"?`,
        'Esta acción quitará el producto del carrito.'
      )
      .then((confirmado) => {
        if (confirmado) {
          this.carritoService.eliminarProducto(item.producto.productoId);
          this.reutilizableService.success('Producto eliminado del carrito');
        }
      });
  }

  vaciar(): void {
    this.reutilizableService
      .confirmDialog(
        '¿Vaciar el carrito?',
        'Esta acción eliminará todos los productos del carrito.'
      )
      .then((confirmado) => {
        if (confirmado) {
          this.carritoService.limpiarCarrito();
          this.paginaActual = 1;
          this.reutilizableService.success('Carrito vaciado exitosamente');
        }
      });
  }

  irAResumen(): void {
    const carrito = this.carritoService.obtenerCarritoActual();

    if (carrito.length === 0) {
      this.reutilizableService.info(
        'Carrito vacío',
        'Agrega productos antes de continuar al resumen'
      );
      return;
    }

    localStorage.setItem('resumenOrden', JSON.stringify(carrito));
    this.router.navigate(['dashboard/resumen-orden']);
  }
  itemsPaginados(): ItemCarrito[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    return this.items.slice(inicio, fin);
  }
}
