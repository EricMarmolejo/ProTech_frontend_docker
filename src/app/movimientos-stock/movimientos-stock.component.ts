import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../shared/services/stock.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';
import { PaginadorComponent } from "../paginador/paginador.component";

@Component({
  selector: 'app-movimientos-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginadorComponent],
  templateUrl: './movimientos-stock.component.html',
  styleUrls: ['./movimientos-stock.component.css']
})
export class MovimientosStockComponent implements OnInit, OnDestroy {
  productoId!: string;
  movimientos: any[] = [];
  movimientosOriginal: any[] = []; // para filtrar sin perder datos
  stockActual: number | null = null;
  cargando = true;

  fechaInicio!: string;
  fechaFin!: string;

  chart: Chart | null = null;
  errorFecha: string = '';
  pageSize = 5;       // cantidad de filas por página
  currentPage = 1;
  movimientosPaginados: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService
  ) {}


  ngOnInit(): void {
    this.productoId = this.route.snapshot.paramMap.get('idProducto')!;
    this.cargarMovimientos();
    this.cargarStockActual();
  }

actualizarPagina(page: number) {
  this.currentPage = page;
  const start = (page - 1) * this.pageSize;
  const end = start + this.pageSize;
  this.movimientosPaginados = this.movimientos.slice(start, end);
}

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

 cargarMovimientos(): void {
  this.cargando = true;
  this.stockService.obtenerMovimientosPorProducto(this.productoId)
    .subscribe({
      next: (resp: any) => {
        this.movimientos = resp;
        this.movimientosOriginal = [...resp];
        this.cargando = false;
        this.actualizarPagina(this.currentPage);
        setTimeout(() => this.crearGrafico());
      },
      error: (err) => {
        console.error('Error al obtener movimientos', err);
        this.cargando = false;
      }
    });
}


  cargarStockActual(): void {
    this.stockService.obtenerStockActual(this.productoId)
      .subscribe({
        next: (resp: any) => {
          this.stockActual = resp.stock;
        },
        error: (err) => {
          console.error('Error al obtener stock actual', err);
        }
      });
  }

  filtrarPorFechas(): void {
    this.errorFecha = '';
    if (!this.fechaInicio || !this.fechaFin) {
      this.errorFecha = 'Por favor, ingrese ambas fechas.';
      return;
    }

    if (this.fechaInicio > this.fechaFin) {
      this.errorFecha = 'La fecha "Desde" no puede ser mayor que la fecha "Hasta".';
      return;
    }

    const desde = new Date(this.fechaInicio);
    const hasta = new Date(this.fechaFin);
    hasta.setHours(23, 59, 59, 999);

    this.movimientos = this.movimientosOriginal.filter((mov) => {
      const fecha = new Date(mov.fecha);
      return fecha >= desde && fecha <= hasta;
    });
   this.currentPage = 1;
  this.actualizarPagina(this.currentPage);
  this.crearGrafico();;
  }

 limpiarFiltro(): void {
  this.fechaInicio = '';
  this.fechaFin = '';
  this.movimientos = [...this.movimientosOriginal];
  this.currentPage = 1;
  this.actualizarPagina(this.currentPage);
  this.crearGrafico();
}

  crearGrafico(): void {
    if(this.chart) {
      this.chart.destroy(); // destruye si ya hay gráfico
    }

    // Ejemplo: mostrar cantidad por fecha (puedes adaptar)
    const etiquetas = this.movimientos.map(mov => new Date(mov.fecha).toLocaleDateString());
    const cantidades = this.movimientos.map(mov => mov.cantidad);

    const ctx = (document.getElementById('graficoStock') as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Cantidad Movimientos',
          data: cantidades,
          borderColor: 'rgba(33, 150, 243, 1)',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Cantidad'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  exportarExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.movimientos.map(mov => ({
      Fecha: new Date(mov.fecha).toLocaleString(),
      Tipo: mov.tipo,
      Cantidad: mov.cantidad,
      Observación: mov.observacion || '-'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'movimientos_stock.xlsx');
  }

  exportarPDF(): void {
    const doc = new jsPDF();
    doc.setTextColor(20, 20, 20);
    doc.text('Movimientos de Stock', 14, 10);
    autoTable(doc, {
      head: [['Fecha', 'Tipo', 'Cantidad', 'Observación']],
      body: this.movimientos.map((mov) => [
        new Date(mov.fecha).toLocaleString(),
        mov.tipo,
        mov.cantidad,
        mov.observacion || '-',
      ]),
      headStyles: { fillColor: [33, 150, 243] },
      styles: { fontSize: 9 }
    });
    doc.save('movimientos_stock.pdf');
  }
}
