import { Component, OnInit } from '@angular/core';
import {
  CarritoService,
  ItemCarrito,
} from '../../shared/services/carrito.service';
import { PerfilService } from '../../shared/services/Perfil.service';
import {
  PedidoService,
  CrearPedidoDTO,
  PedidoItem,
} from '../../shared/services/Pedido.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaginadorComponent } from '../../paginador/paginador.component';

@Component({
  selector: 'app-resumen-orden',
  standalone: true,
  imports: [CommonModule,PaginadorComponent],
  templateUrl: './resumen-orden.component.html',
  styleUrls: ['./resumen-orden.component.css'],
})
export class ResumenOrdenComponent implements OnInit {
  items: ItemCarrito[] = [];
  total: number = 0;
  direccionSeleccionada: any = null;
  usuarioId: string | null = null;
  paginaActual = 1;
  tamanioPagina = 2;

  constructor(
    private carritoService: CarritoService,
    private perfilService: PerfilService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.items = this.carritoService.obtenerCarritoActual();
    this.total = this.items.reduce(
      (acc, item) => acc + item.producto.precio * item.cantidad,
      0
    );

    this.usuarioId = this.perfilService.getUserIdFromToken();
    if (this.usuarioId) {
      this.perfilService
        .obtenerDireccionesPorUsuario(this.usuarioId)
        .subscribe((direcciones) => {
          this.direccionSeleccionada =
            direcciones.find((d: any) => d.esPrincipal) || direcciones[0];
        });
    }
  }

  volverAlCarrito(): void {
    this.router.navigate(['dashboard/carrito']);
  }

  confirmarCompra(): void {
    if (!this.usuarioId) {
      alert('Usuario no identificado. Por favor, inicia sesión.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.direccionSeleccionada) {
      alert('Por favor selecciona una dirección de envío.');
      return;
    }

    // Mapear productos usando el ID correcto: producto.productoId
    const productos: PedidoItem[] = this.items.map((item) => ({
      producto: item.producto.productoId,
      cantidad: item.cantidad,
    }));

    const pedidoData: CrearPedidoDTO = {
      usuario: this.usuarioId,
      direccion:
        this.direccionSeleccionada._id || this.direccionSeleccionada.id,
      productos,
      total: this.total,
    };

    this.pedidoService.crearPedido(pedidoData).subscribe({
      next: () => {
        alert('¡Compra confirmada! Gracias por tu pedido.');
        this.carritoService.limpiarCarrito();
        this.router.navigate(['dashboard/inicio']);
      },
      error: (err) => {
        console.error('Error al crear pedido:', err);
        alert('Ocurrió un error al procesar tu pedido. Intenta nuevamente.');
      },
    });
  }
  itemsPaginados(): ItemCarrito[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    return this.items.slice(inicio, fin);
  }
}
