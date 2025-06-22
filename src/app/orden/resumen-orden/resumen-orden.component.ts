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
import { FormsModule } from '@angular/forms';
import { ReutilizableService } from '../../shared/services/reutilizable.service';

@Component({
  selector: 'app-resumen-orden',
  standalone: true,
  imports: [CommonModule, PaginadorComponent, FormsModule],
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
  direcciones: any[] = []; // Guardar todas las direcciones

  constructor(
    private carritoService: CarritoService,
    private perfilService: PerfilService,
    private pedidoService: PedidoService,
    private router: Router,
    private reutilizableService: ReutilizableService
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
          this.direcciones = direcciones;
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
      this.reutilizableService
        .error('Usuario no identificado', 'Por favor, inicia sesión.')
        .then(() => this.router.navigate(['/login']));
      return;
    }

    if (!this.direccionSeleccionada) {
      this.reutilizableService.warning(
        'Dirección no seleccionada',
        'Por favor selecciona una dirección de envío.'
      );
      return;
    }

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
        this.reutilizableService
          .success('¡Compra confirmada!', 'Gracias por tu pedido.')
          .then(() => {
            this.carritoService.limpiarCarrito();
            this.router.navigate(['dashboard/inicio']);
          });
      },
      error: (err) => {
        console.error('Error al crear pedido:', err);
        this.reutilizableService.error(
          'Error al procesar el pedido',
          'Intenta nuevamente más tarde.'
        );
      },
    });
  }
  itemsPaginados(): ItemCarrito[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    return this.items.slice(inicio, fin);
  }
}
