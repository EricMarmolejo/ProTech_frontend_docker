import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../shared/services/Pedido.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { PaginadorComponent } from '../../paginador/paginador.component'; // Ajusta si la ruta cambia

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PaginadorComponent],
  templateUrl: './pedidos-admin.component.html',
  styleUrl: './pedidos-admin.component.css',
  providers: [PedidoService],
})
export class PedidosAdminComponent implements OnInit {
  todosLosPedidos: any[] = []; // Todos los pedidos
  pedidos: any[] = [];         // Pedidos visibles según paginación
  cargando = true;
  error: string | null = null;

  paginaActual = 1;
  tamanioPagina = 4;
  totalPedidos = 0;

  constructor(
    private pedidoService: PedidoService,
    private router: Router
  ) { }

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

  actualizarPedidos() {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    // Asegurar nuevo array para detección de cambios
    this.pedidos = [...this.todosLosPedidos.slice(inicio, fin)];
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    this.actualizarPedidos();
  }

  abrirCambiarEstado(pedido: any) {
      if(!confirm('¿Deseas marcar este pedido como ENVIADO?')) return;

    this.pedidoService
      .actualizarEstadoPedido(pedido._id, 'enviado')
      .subscribe({
        next: (pedidoActualizado) => {
          pedido.estado = pedidoActualizado.estado;
          alert('Pedido marcado como ENVIADO');
        },
        error: (err) => {
          console.error('Error al actualizar estado:', err);
          alert('No se pudo cambiar el estado del pedido.');
        },
      });
  }

  verDetalle(pedidoId: string) {
    this.router.navigate(['dashboard/Pedidos', pedidoId]);
  }
}
