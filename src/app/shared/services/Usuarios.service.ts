import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  _id?: string;
  nombre: string;
  correo: string;
  rol: 'cliente' | 'admin';
  telefono?: string;
  fechaNacimiento?: Date;
  avatarUrl?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  contrasena?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = 'https://pro-tech-backend.vercel.app/api/Perfil';
  private adminUrl = `${this.baseUrl}/admin/usuarios`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private buildFormData(usuario: Usuario, avatarFile?: File): FormData {
    const formData = new FormData();

    // Agrega los campos de usuario excepto _id
    Object.entries(usuario).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== '_id') {
        formData.append(key, value.toString());
      }
    });

    // Agrega archivo si hay
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    return formData;
  }

  // PERFIL

  getPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(this.baseUrl, { headers: this.getHeaders() });
  }

  actualizarPerfil(nombre: string, telefono: string): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.baseUrl}/perfil`,
      { nombre, telefono },
      { headers: this.getHeaders() }
    );
  }

  cambiarContrasena(actual: string, nueva: string): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(
      `${this.baseUrl}/perfil/contrasena`,
      { actual, nueva },
      { headers: this.getHeaders() }
    );
  }

  subirAvatar(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('avatar', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/perfil/avatar`, formData, {
      headers: this.getHeaders(),
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req);
  }

  // ADMINISTRACIÓN DE USUARIOS

  getUsuarios(rol?: string): Observable<Usuario[]> {
    const url = rol ? `${this.adminUrl}?rol=${rol}` : this.adminUrl;
    return this.http.get<Usuario[]>(url, { headers: this.getHeaders() });
  }

  getUsuario(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.adminUrl}/${id}`, { headers: this.getHeaders() });
  }

 crearUsuario(formData: FormData): Observable<Usuario> {
  const token = localStorage.getItem('auth_token') || '';
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
  return this.http.post<Usuario>(this.adminUrl, formData, { headers });
}

actualizarUsuario(id: string, formData: FormData): Observable<Usuario> {
  const token = localStorage.getItem('auth_token') || '';
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
  return this.http.put<Usuario>(`${this.adminUrl}/${id}`, formData, { headers });
}


  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.adminUrl}/${id}`, { headers: this.getHeaders() });
  }
}
