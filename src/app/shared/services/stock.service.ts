import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StockService {
  private baseUrl = 'https://pro-tech-backend.vercel.app/api/stock';

  constructor(private http: HttpClient) {}

  registrarMovimiento(data: any) {
    return this.http.post(this.baseUrl, data);
  }

  obtenerMovimientos() {
    return this.http.get(this.baseUrl);
  }

  obtenerMovimientosPorProducto(productoId: string) {
    return this.http.get(`${this.baseUrl}/producto/${productoId}`);
  }

  obtenerStockActual(productoId: string) {
    return this.http.get(`${this.baseUrl}/producto/${productoId}/actual`);
  }
}
