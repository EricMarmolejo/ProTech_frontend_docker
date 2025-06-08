import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  _id: string;
  nombre: string;
  descripcion: string;
  imagen?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private baseUrl = 'https://pro-tech-backend.vercel.app/api/categorias';

  constructor(private http: HttpClient) {}

  // Listar todas las categorías
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  // Obtener categoría por ID
  obtenerCategoriaPorId(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.baseUrl}/${id}`);
  }

  crearCategoria(formData: FormData): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, formData);
  }

  // Actualizar categoría (también con FormData)
  actualizarCategoria(id: string, formData: FormData): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}`, formData);
  }

  // Eliminar categoría
  eliminarCategoria(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
