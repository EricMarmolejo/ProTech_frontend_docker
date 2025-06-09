import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ReutilizableService {

  constructor() {}

  private showAlert(
    icon: 'success' | 'error' | 'warning' | 'info',
    title: string,
    text?: string
  ): Promise<any> {
    return Swal.fire({
      icon,
      title,
      text,
      background: '#1a1d2e',
      color: '#fff',
      iconColor: icon === 'success' ? '#4c7fdc' : '#e74c3c',
      confirmButtonColor: '#4c7fdc',
      customClass: {
        popup: 'swal2-dark'
      }
    });
  }

  success(title: string, text?: string): Promise<any> {
    return this.showAlert('success', title, text);
  }

  error(title: string, text?: string): Promise<any> {
    return this.showAlert('error', title, text);
  }

  info(title: string, text?: string): Promise<any> {
    return this.showAlert('info', title, text);
  }

  warning(title: string, text?: string): Promise<any> {
    return this.showAlert('warning', title, text);
  }

  // Método para diálogo de confirmación tipo confirm()
  confirmDialog(title: string, text: string): Promise<boolean> {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      background: '#1a1d2e',
      color: '#fff',
      iconColor: '#4c7fdc',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#4c7fdc',
      cancelButtonColor: '#e74c3c',
      customClass: {
        popup: 'swal2-dark'
      }
    }).then(result => result.isConfirmed);
  }
}
