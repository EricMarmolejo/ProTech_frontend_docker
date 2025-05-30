import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../shared/services/stock.service';

@Component({
  selector: 'app-formulario-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-stock.component.html',
  styleUrl: './formulario-stock.component.css'
})
export class FormularioStockComponent implements OnInit {
  tipoMovimiento: 'entrada' | 'salida' = 'entrada';
  idProducto: string = '';
  cantidad: number = 1;
  observaciones: string = '';
  error: string = '';
  mensaje: string = '';
  cargando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tipo = params.get('tipo');
      const id = params.get('idProducto');

      if (tipo === 'entrada' || tipo === 'salida') {
        this.tipoMovimiento = tipo;
      } else {
        this.error = 'Tipo de movimiento no válido';
        return;
      }

      if (id) {
        this.idProducto = id;
      } else {
        this.error = 'Producto no especificado';
      }
    });
  }

  registrarMovimiento(): void {
    if (!this.cantidad || this.cantidad <= 0) {
      this.error = 'La cantidad debe ser mayor a cero';
      return;
    }

    const movimiento = {
      tipo: this.tipoMovimiento,
      cantidad: this.cantidad,
      producto: this.idProducto,
      observacion: this.observaciones
    };

    this.cargando = true;
    this.stockService.registrarMovimiento(movimiento).subscribe({
      next: () => {
        this.mensaje = 'Movimiento registrado correctamente ✅';
        setTimeout(() => {
          this.router.navigate(['/dashboard/productos']);
        }, 1500);
      },
      error: (err) => {
        this.error = 'Error al registrar el movimiento';
        console.error(err);
        this.cargando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/productos']);
  }
}
