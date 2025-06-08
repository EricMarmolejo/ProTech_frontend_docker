import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'https://pro-tech-backend.vercel.app/api'; // Incluye /api

  constructor(private http: HttpClient) {}

  obtenerPedidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos`);
  }

  obtenerStock(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock`);
  }

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`);
  }

  obtenerPerfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Perfil`);
  }
}
