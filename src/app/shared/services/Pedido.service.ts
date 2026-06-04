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

  crearPedido(data: CrearPedidoDTO): Observable<any> {
    return this.http.post(`${API_URL}`, data);
  }

  obtenerPedidosPorUsuario(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_URL}/usuario/${usuarioId}`
    );
  }

  obtenerTodosLosPedidos(): Observable<any[]> {
    return this.http.get<any[]>(
      API_URL,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  actualizarEstadoPedido(
    pedidoId: string,
    estado: string
  ): Observable<any> {
    return this.http.put(
      `${API_URL}/${pedidoId}/estado`,
      { estado }
    );
  }

  obtenerPedidoPorId(
    pedidoId: string
  ): Observable<any> {
    return this.http.get<any>(
      `${API_URL}/${pedidoId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  cancelarPedido(
    pedidoId: string
  ): Observable<any> {
    return this.http.patch(
      `${API_URL}/${pedidoId}/cancelar`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }
}