import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../shared/services/Pedido.service';
import { PerfilService } from '../../shared/services/Perfil.service';
import { Router } from '@angular/router';
import { PaginadorComponent } from '../../paginador/paginador.component';

@Component({
  selector: 'app-pedidos-clientes',
  standalone: true,
  imports: [CommonModule,PaginadorComponent],
  templateUrl: './pedidos-clientes.component.html',
  styleUrl: './pedidos-clientes.component.css',
})
export class PedidosClientesComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private perfilService = inject(PerfilService);

  constructor(private router: Router) {}

  pedidos: any[] = [];
  cargando = true;
  error = '';
  paginaActual = 1;
  tamanioPagina = 4; // Puedes ajustarlo según el tamaño deseado

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
    console.log('Detalle del pedido:', pedido);
    this.router.navigate(['dashboard/Pedidos', pedido._id]);
  }
  cancelarPedido(pedido: any): void {
    if (!confirm('¿Seguro que deseas cancelar este pedido?')) return;

    this.pedidoService
      .actualizarEstadoPedido(pedido._id, 'cancelado')
      .subscribe({
        next: (pedidoActualizado) => {
          pedido.estado = pedidoActualizado.estado;
          alert('Pedido cancelado');
        },
        error: (err) => {
          console.error('Error al cancelar:', err);
          alert('No se pudo cancelar el pedido.');
        },
      });
  }

  confirmarEntrega(pedido: any): void {
    if (!confirm('¿Deseas marcar este pedido como ENTREGADO?')) return;

    this.pedidoService
      .actualizarEstadoPedido(pedido._id, 'entregado')
      .subscribe({
        next: (pedidoActualizado) => {
          pedido.estado = pedidoActualizado.estado;
          alert('Pedido marcado como ENTREGADO');
        },
        error: (err) => {
          console.error('Error al actualizar estado:', err);
          alert('No se pudo cambiar el estado del pedido.');
        },
      });
  }
  pedidosPaginados(): any[] {
  const inicio = (this.paginaActual - 1) * this.tamanioPagina;
  const fin = inicio + this.tamanioPagina;
  return this.pedidos.slice(inicio, fin);
}

}
