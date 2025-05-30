// perfil.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private apiUrl = 'http://localhost:3000/api/Perfil';
  private direccionesUrl = 'http://localhost:3000/api/direcciones';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('No hay token en localStorage');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Métodos de perfil
  obtenerPerfil() {
    return this.http.get(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  actualizarPerfil(data: any) {
    return this.http.put(`${this.apiUrl}/perfil`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  cambiarContraseña(actual: string, nueva: string) {
    return this.http.put(
      `${this.apiUrl}/perfil/contrasena`,
      { actual, nueva },
      { headers: this.getAuthHeaders() }
    );
  }

  subirAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post(`${this.apiUrl}/perfil/avatar`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  // 👇 Métodos para manejar direcciones usando /api/direcciones

  obtenerDireccionesPorUsuario(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.direccionesUrl}/usuario/${usuarioId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  agregarDireccion(direccion: any) {
    return this.http.post(this.direccionesUrl, direccion, {
      headers: this.getAuthHeaders(),
    });
  }

  eliminarDireccion(id: string) {
    return this.http.delete(`${this.direccionesUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  establecerPrincipal(id: string) {
    return this.http.patch(`${this.direccionesUrl}/${id}/principal`, {}, {
      headers: this.getAuthHeaders(),
    });
  }

  // Opcional: decodificar token para obtener ID de usuario
  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload._id || null;
    } catch (e) {
      console.error('Error al decodificar el token JWT', e);
      return null;
    }
  }
}
