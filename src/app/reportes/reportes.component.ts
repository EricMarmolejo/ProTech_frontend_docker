import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { ReportesService } from '../shared/services/Reportes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // para ngModel

import { Chart, ChartType, registerables } from 'chart.js';
import { PaginadorComponent } from '../paginador/paginador.component';
Chart.register(...registerables);

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginadorComponent],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('miGrafico') miGrafico!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  pedidos: any[] = [];
  productos: any[] = [];
  stock: any[] = [];
  perfil: any = null;

  filtroPedidos: string = '';
  filtroProductos: string = '';
  filtroStock: string = '';

  totalPedidos = 0;
  totalProductos = 0;
  totalStock = 0;
  totalVentas = 0;

  // PAGINACIÓN PEDIDOS
  paginaPedidosActual = 1;
  pedidosPorPagina = 3;

  // PAGINACIÓN PRODUCTOS
  paginaProductosActual = 1;
  productosPorPagina = 10;

  // PAGINACIÓN STOCK
  paginaStockActual = 1;
  stockPorPagina = 10;

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    this.inicializarGrafico();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  inicializarGrafico() {
    this.chart = new Chart(this.miGrafico.nativeElement.getContext('2d')!, {
      type: 'bar' as ChartType,
      data: {
        labels: [],
        datasets: [
          {
            label: 'Pedidos por Estado',
            data: [],
            backgroundColor: ['#0d6efd', '#ffc107', '#dc3545'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { enabled: true },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  cargarDatos(): void {
  this.reportesService.obtenerPedidos().subscribe({
    next: (p: any) => {
      this.pedidos = Array.isArray(p)
        ? p
        : p?.data || p?.pedidos || [];

      this.totalPedidos = this.pedidos.length;

      this.totalVentas = this.pedidos
        .filter((pedido: any) => pedido.estado !== 'cancelado')
        .reduce(
          (acc: number, pedido: any) =>
            acc + (Number(pedido.total) || 0),
          0
        );

      this.generarGraficoEstados();
    },
    error: (err) => {
      console.error('Error pedidos:', err);
    },
  });

  this.reportesService.obtenerProductos().subscribe({
    next: (p: any) => {
      console.log('PRODUCTOS =>', p);

      this.productos = Array.isArray(p)
        ? p
        : p?.data || p?.productos || [];

      this.totalProductos = this.productos.length;
    },
    error: (err) => {
      console.error('Error productos:', err);
    },
  });

  this.reportesService.obtenerStock().subscribe({
    next: (s: any) => {
      console.log('STOCK =>', s);

      this.stock = Array.isArray(s)
        ? s
        : s?.data || s?.stock || [];

      this.totalStock = this.stock.reduce(
        (acc: number, item: any) =>
          acc + (Number(item.cantidad) || 0),
        0
      );
    },
    error: (err) => {
      console.error('Error stock:', err);
    },
  });

  this.reportesService.obtenerPerfil().subscribe({
    next: (u) => {
      this.perfil = u;
    },
    error: (err) => {
      console.error('Error perfil:', err);
    },
  });
}
  // Filtros para pedidos
  get pedidosFiltrados(): any[] {
    if (!this.filtroPedidos.trim()) return this.pedidos;
    const texto = this.filtroPedidos.toLowerCase();
    return this.pedidos.filter(
      (p) =>
        p.usuario?.nombre?.toLowerCase().includes(texto) ||
        p.estado?.toLowerCase().includes(texto)
    );
  }

  // Paginación pedidos
  get pedidosFiltradosPaginados(): any[] {
    const inicio = (this.paginaPedidosActual - 1) * this.pedidosPorPagina;
    return this.pedidosFiltrados.slice(inicio, inicio + this.pedidosPorPagina);
  }

  resetearPaginaPedidos() {
    this.paginaPedidosActual = 1;
  }

  // Filtro para productos
  get productosFiltrados(): any[] {
    if (!this.filtroProductos.trim()) return this.productos;
    const texto = this.filtroProductos.toLowerCase();
    return this.productos.filter((p) => p.nombre.toLowerCase().includes(texto));
  }

  // Paginación productos
  get productosFiltradosPaginados(): any[] {
    const inicio = (this.paginaProductosActual - 1) * this.productosPorPagina;
    return this.productosFiltrados.slice(
      inicio,
      inicio + this.productosPorPagina
    );
  }

  resetearPaginaProductos() {
    this.paginaProductosActual = 1;
  }

  // Filtro para stock (opcional)
  get stockFiltrado(): any[] {
    if (!this.filtroStock.trim()) return this.stock;
    const texto = this.filtroStock.toLowerCase();
    return this.stock.filter(
      (item) =>
        item.producto?.nombre?.toLowerCase().includes(texto) ||
        item.tipo?.toLowerCase().includes(texto)
    );
  }

  // Paginación stock
  get stockFiltradoPaginado(): any[] {
    const inicio = (this.paginaStockActual - 1) * this.stockPorPagina;
    return this.stockFiltrado.slice(inicio, inicio + this.stockPorPagina);
  }

  resetearPaginaStock() {
    this.paginaStockActual = 1;
  }

  // Getters para total páginas
  get totalPaginasPedidos(): number {
    return Math.ceil(this.pedidosFiltrados.length / this.pedidosPorPagina) || 1;
  }

  get totalPaginasProductos(): number {
    return (
      Math.ceil(this.productosFiltrados.length / this.productosPorPagina) || 1
    );
  }

  get totalPaginasStock(): number {
    return Math.ceil(this.stockFiltrado.length / this.stockPorPagina) || 1;
  }

  generarGraficoEstados(): void {
    if (!this.chart) return;
    const conteo: { [key: string]: number } = {};
    this.pedidos.forEach((p) => {
      conteo[p.estado] = (conteo[p.estado] || 0) + 1;
    });

    this.chart.data.labels = Object.keys(conteo);
    this.chart.data.datasets[0].data = Object.values(conteo);
    this.chart.update();
  }

  // Exportar a CSV (Pedidos)
  exportarPedidosCSV(): void {
    const encabezados = ['ID', 'Usuario', 'Dirección', 'Total', 'Estado'];
    const filas = this.pedidosFiltrados.map((p) => [
      p._id,
      p.usuario?.nombre || '',
      p.direccion?.direccion || '',
      p.total,
      p.estado,
    ]);

    this.descargarCSV('pedidos.csv', [encabezados, ...filas]);
  }

  // Exportar a CSV (Productos)
  exportarProductosCSV(): void {
    const encabezados = ['Nombre', 'Precio'];
    const filas = this.productosFiltrados.map((p) => [p.nombre, p.precio]);

    this.descargarCSV('productos.csv', [encabezados, ...filas]);
  }

  // Exportar a CSV (Stock)
  exportarStockCSV(): void {
    const encabezados = ['Producto', 'Cantidad', 'Tipo'];
    const filas = this.stockFiltrado.map((s) => [
      s.producto?.nombre || '',
      s.cantidad,
      s.tipo,
    ]);

    this.descargarCSV('stock.csv', [encabezados, ...filas]);
  }

  private descargarCSV(nombreArchivo: string, filas: any[][]) {
    const csvContent = filas
      .map((e) => e.map((v) => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
