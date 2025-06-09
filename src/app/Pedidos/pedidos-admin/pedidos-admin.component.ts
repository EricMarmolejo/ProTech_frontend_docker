import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../shared/services/Pedido.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { PaginadorComponent } from '../../paginador/paginador.component';
import { ReutilizableService } from '../../shared/services/reutilizable.service';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PaginadorComponent],
  templateUrl: './pedidos-admin.component.html',
  styleUrl: './pedidos-admin.component.css',
  providers: [PedidoService],
})
export class PedidosAdminComponent implements OnInit {
  todosLosPedidos: any[] = [];
  pedidos: any[] = [];
  cargando = true;
  error: string | null = null;

  paginaActual = 1;
  tamanioPagina = 4;
  totalPedidos = 0;

  constructor(
    private pedidoService: PedidoService,
    private router: Router,
    private alertService: ReutilizableService
  ) {}

  ngOnInit(): void {
    this.pedidoService.obtenerTodosLosPedidos().subscribe({
      next: (data) => {
        this.todosLosPedidos = data;
        this.totalPedidos = data.length;
        this.paginaActual = 1;
        this.actualizarPedidos();
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los pedidos.';
        this.cargando = false;
      },
    });
  }

  actualizarPedidos(): void {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    this.pedidos = [...this.todosLosPedidos.slice(inicio, fin)];
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.actualizarPedidos();
  }

  async abrirCambiarEstado(pedido: any): Promise<void> {
    const confirmado = await this.alertService.confirmDialog(
      'Confirmar cambio de estado',
      '¿Deseas marcar este pedido como ENVIADO?'
    );

    if (!confirmado) return;

    this.pedidoService.actualizarEstadoPedido(pedido._id, 'enviado').subscribe({
      next: (pedidoActualizado) => {
        pedido.estado = pedidoActualizado.estado;
        this.alertService.success('Estado actualizado', 'Pedido marcado como ENVIADO');
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.alertService.error('Error', 'No se pudo cambiar el estado del pedido.');
      },
    });
  }

  verDetalle(pedidoId: string): void {
    this.router.navigate(['dashboard/Pedidos', pedidoId]);
  }
}
