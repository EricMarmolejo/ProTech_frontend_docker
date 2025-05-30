import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ItemCarrito {
  producto: any;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: ItemCarrito[] = [];
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);

  carrito$ = this.carritoSubject.asObservable();

  constructor() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.carrito = JSON.parse(carritoGuardado);
      this.carritoSubject.next(this.carrito);
    }
  }

  private guardarEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  agregarProducto(producto: any, cantidad: number = 1) {
    const id = producto.productoId;
    if (!producto || typeof id !== 'string') {
      console.warn('Producto inválido o sin productoId:', producto);
      return;
    }
    const index = this.carrito.findIndex(item => item.producto.productoId === id);
    if (index !== -1) {
      this.carrito[index].cantidad += cantidad;
    } else {
      this.carrito.push({ producto, cantidad });
    }
    this.actualizarCarrito();
  }

  eliminarProducto(productoId: string) {
    this.carrito = this.carrito.filter(item => item.producto.productoId !== productoId);
    this.actualizarCarrito();
  }

  actualizarCantidad(productoId: string, cantidad: number) {
    const item = this.carrito.find(item => item.producto.productoId === productoId);
    if (item) {
      item.cantidad = cantidad;
      if (item.cantidad <= 0) {
        this.eliminarProducto(productoId);
      } else {
        this.actualizarCarrito();
      }
    }
  }

  limpiarCarrito() {
    this.carrito = [];
    this.actualizarCarrito();
  }

  private actualizarCarrito() {
    this.carritoSubject.next([...this.carrito]);
    this.guardarEnLocalStorage();
  }

  obtenerCarritoActual(): ItemCarrito[] {
    return [...this.carrito];
  }
}
