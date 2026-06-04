import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../shared/services/Pedido.service';
import { PerfilService } from '../../shared/services/Perfil.service';
import { Router } from '@angular/router';
import { PaginadorComponent } from '../../paginador/paginador.component';
import { ReutilizableService } from '../../shared/services/reutilizable.service';

@Component({
  selector: 'app-pedidos-clientes',
  standalone: true,
  imports: [CommonModule, PaginadorComponent],
  templateUrl: './pedidos-clientes.component.html',
  styleUrl: './pedidos-clientes.component.css',
})
export class PedidosClientesComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private perfilService = inject(PerfilService);
  private reusable = inject(ReutilizableService);
  private router = inject(Router);

  pedidos: any[] = [];
  cargando = true;
  error = '';
  paginaActual = 1;
  tamanioPagina = 4;

  ngOnInit(): void {
    const usuarioId = this.perfilService.getUserIdFromToken();

    if (!usuarioId) {
      this.error = 'No se pudo obtener el ID del usuario.';
      this.cargando = false;
      return;
    }

    this.pedidoService.obtenerPedidosPorUsuario(usuarioId).subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los pedidos.';
        this.cargando = false;
        console.error(err);
      },
    });
  }

  verDetalle(pedido: any) {
    this.router.navigate(['dashboard/Pedidos', pedido._id]);
  }

async cancelarPedido(pedido: any): Promise<void> {
  const confirmado = await this.reusable.confirmDialog(
    'Cancelar pedido',
    '¿Seguro que deseas cancelar este pedido?'
  );

  if (!confirmado) return;

  this.pedidoService.cancelarPedido(
    pedido._id
  ).subscribe({
    next: (response) => {
      pedido.estado =
        response.pedido.estado;

      this.reusable.success(
        'Pedido cancelado',
        'El pedido fue cancelado con éxito.'
      );
    },
    error: (err) => {
      console.error(
        'Error al cancelar:',
        err
      );

      this.reusable.error(
        'Error',
        err?.error?.error ||
        'No se pudo cancelar el pedido.'
      );
    },
  });
}

  async confirmarEntrega(pedido: any): Promise<void> {
    const confirmado = await this.reusable.confirmDialog(
      'Confirmar entrega',
      '¿Deseas marcar este pedido como ENTREGADO?'
    );
    if (!confirmado) return;

    this.pedidoService.actualizarEstadoPedido(pedido._id, 'entregado').subscribe({
      next: (pedidoActualizado) => {
        pedido.estado = pedidoActualizado.estado;
        this.reusable.success('Pedido entregado', 'El pedido fue marcado como entregado.');
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.reusable.error('Error', 'No se pudo cambiar el estado del pedido.');
      },
    });
  }

  pedidosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    return this.pedidos.slice(inicio, fin);
  }
}
