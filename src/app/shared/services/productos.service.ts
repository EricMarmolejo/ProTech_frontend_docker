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
  private apiUrl = 'https://pro-tech-backend.vercel.app/api/productos';

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

// En producto.service.ts
crearProducto(formData: FormData, token: string): Observable<Producto> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.post<Producto>(this.apiUrl, formData, { headers });
}


  // Actualizar producto existente (requiere token y rol admin)
  actualizarProducto(
    id: string,
    formData: FormData,
    token: string
  ): Observable<Producto> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      // NO poner Content-Type aquí
    });

    return this.http.patch<Producto>(`${this.apiUrl}/${id}`, formData, {
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
    formData.append(
      'precio',
      data.precio != null ? data.precio.toString() : '0'
    );
    formData.append('descripcion', data.descripcion || '');

    // ✅ AÑADIR LA CATEGORÍA COMO _id
    if (data.categoria) {
      formData.append('categoria', data.categoria); // <-- Aquí estaba faltando
    }

    // Características como arreglo
    if (data.caracteristicas && Array.isArray(data.caracteristicas)) {
      data.caracteristicas.forEach((c: string, index: number) => {
        formData.append(`caracteristicas[${index}]`, c);
      });
    }

    // Imagen si existe
    if (data.imagen) {
      formData.append('imagen', data.imagen);
    }

    return formData;
  }
}
