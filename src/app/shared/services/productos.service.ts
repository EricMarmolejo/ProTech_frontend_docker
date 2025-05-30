import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  _id: string;
  nombre: string;
}

export interface Producto {
  _id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  stock: number;
  caracteristicas?: string[];
  categoria: Categoria; // <-- Aquí se espera el objeto completo
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = 'http://localhost:3000/api/productos';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  // Obtener un producto por ID
  getProductoPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // Buscar productos por nombre (búsqueda básica)
  buscarProductos(q: string): Observable<Producto[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Producto[]>(`${this.apiUrl}/busqueda`, { params });
  }

  // Filtro avanzado (por categoría y rango de precio)
  filtrarProductos(filtro: {
    categoria?: string;
    precioMin?: number;
    precioMax?: number;
  }): Observable<Producto[]> {
    return this.http.post<Producto[]>(`${this.apiUrl}/filtro`, filtro);
  }

  // Crear nuevo producto (requiere token y rol admin)
  crearProducto(productoData: any, token: string): Observable<Producto> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const formData = this.buildFormData(productoData);

    return this.http.post<Producto>(this.apiUrl, formData, { headers });
  }

  // Actualizar producto existente (requiere token y rol admin)
  actualizarProducto(
    id: string,
    productoData: any,
    token: string
  ): Observable<Producto> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.patch<Producto>(`${this.apiUrl}/${id}`, productoData, {
      headers,
    });
  }

  // Eliminar producto (requiere token y rol admin)
  eliminarProducto(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  private buildFormData(data: any): FormData {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('precio', data.precio);
    formData.append('categoria', data.categoria);
    formData.append('descripcion', data.descripcion);

    if (data.caracteristicas && Array.isArray(data.caracteristicas)) {
      data.caracteristicas.forEach((c: string, index: number) => {
        formData.append(`caracteristicas[${index}]`, c);
      });
    }

    if (data.imagen) {
      formData.append('imagen', data.imagen);
    }

    return formData;
  }
}
