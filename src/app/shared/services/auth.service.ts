import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

interface LoginResponse {
  token: string;
  rol: string;
  usuario: {
    nombre: string;
    correo: string;
  };
}

interface DecodedToken {
  id: string;
  email: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth'; // Cambia según tu URL real
  private tokenKey = 'auth_token';
  private rolKey = 'rol';
  private usuarioKey = 'usuario';

  private loggedIn: BehaviorSubject<boolean>;
  loggedIn$!: Observable<boolean>;

  constructor(private http: HttpClient) {
    const tokenExists = this.hasToken();
    this.loggedIn = new BehaviorSubject<boolean>(tokenExists);
    this.loggedIn$ = this.loggedIn.asObservable();
  }

  private hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(this.tokenKey);
    return !!token && !this.isTokenExpired(token);
  }

registrarUsuario(formData: FormData) {
  return this.http.post(`${this.baseUrl}/registro`, formData);
}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.rolKey, response.rol);
          localStorage.setItem(this.usuarioKey, JSON.stringify(response.usuario));
          this.loggedIn.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolKey);
    localStorage.removeItem(this.usuarioKey);
    this.loggedIn.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRol(): string | null {
    return localStorage.getItem(this.rolKey);
  }

  isAdmin(): boolean {
    return this.getRol() === 'admin';
  }

  getUsuario(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      );
      return {
        id: decodedPayload.id,
        email: decodedPayload.correo,
        nombre: decodedPayload.nombre,
      };
    } catch {
      return null;
    }
  }

  getUsuarioFromStorage(): { nombre: string; correo: string } | null {
    const data = localStorage.getItem(this.usuarioKey);
    return data ? JSON.parse(data) : null;
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      const exp = decodedPayload.exp;
      const now = Math.floor(Date.now() / 1000);
      return now > exp;
    } catch {
      return true;
    }
  }
}
