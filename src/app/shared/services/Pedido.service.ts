import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'https://pro-tech-backend.vercel.app/api/pedidos';

export interface PedidoItem {
  producto: string;
  cantidad: number;
}

export interface CrearPedidoDTO {
  usuario: string;
  direccion: string;
  productos: PedidoItem[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
  }

  // Crear un nuevo pedido
  crearPedido(data: CrearPedidoDTO): Observable<any> {
    return this.http.post(`${API_URL}`, data);
  }

  // Obtener pedidos de un usuario
  obtenerPedidosPorUsuario(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/usuario/${usuarioId}`);
  }

  // Obtener todos los pedidos (para admin)
  obtenerTodosLosPedidos(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${API_URL}`, { headers });
  }

  // Cambiar el estado de un pedido
  actualizarEstadoPedido(pedidoId: string, estado: string): Observable<any> {
    return this.http.put(`${API_URL}/${pedidoId}/estado`, { estado });
  }

  // Obtener pedido por ID (requiere token)
  obtenerPedidoPorId(pedidoId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${API_URL}/${pedidoId}`, { headers });
  }

  // Cancelar pedido (requiere token)
  cancelarPedido(pedidoId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${API_URL}/${pedidoId}/cancelar`, {}, { headers });
  }
}
