import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PedidoService } from '../../shared/services/Pedido.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-ver-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-detalle.component.html',
  styleUrls: ['./ver-detalle.component.css'], // <-- corregido aquí
})
export class VerDetalleComponent {
  pedidoId: string = '';
  pedido: any;

  constructor(
    private route: ActivatedRoute,
    private pedidosService: PedidoService,
    private location: Location // Inyecta Location
  ) {}

  ngOnInit(): void {
    this.pedidoId = this.route.snapshot.paramMap.get('id')!;
    this.pedidosService.obtenerPedidoPorId(this.pedidoId).subscribe((res) => {
      this.pedido = res;
    });
  }

  volver(): void {
    this.location.back(); // Vuelve a la página anterior
  }

async generarFactura(): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const margenX = 14;
  const margenDerecho = 195;
  const paginaAlto = 297;
  const margenInferior = 12;
  let y = 3;

  const formatMoneda = (num: number) =>
    `$${num.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
  const formatFecha = (fecha: Date) =>
    fecha.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const convertirImgBase64 = (url: string): Promise<{ base64: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Sin contexto');
        ctx.drawImage(img, 0, 0);
        resolve({ base64: canvas.toDataURL('image/png'), width: img.width, height: img.height });
      };
      img.onerror = () => reject('Error cargando imagen');
      img.src = url;
    });
  };

  const agregarEncabezado = async () => {
    try {
      const { base64, width, height } = await convertirImgBase64('assets/ProTech.png');
      const anchoDeseado = 40;
      const altoCalculado = (anchoDeseado * height) / width;
      doc.addImage(base64, 'PNG', margenX, y, anchoDeseado, altoCalculado);
      y += altoCalculado + 2;
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error);
    }

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Factura de Pedido', margenX, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('ProTech', margenX, y);
    y += 5;
    doc.text('www.ProTech.com', margenX, y);
    y += 5;
    doc.text('contacto@protech.com | (+57) 314 331 2325', margenX, y);
    y += 7;

    doc.setLineWidth(0.8);
    doc.setDrawColor(60);
    doc.line(margenX, y, margenDerecho, y);
    y += 10;
  };

  const agregarDatosPedido = () => {
    const etiquetas = ['ID Pedido:', 'Usuario:', 'Email:', 'Fecha:', 'Estado:', 'Dirección:'];
    const valores = [
      `${this.pedido._id}`,
      `${this.pedido.usuario?.nombre || 'N/A'}`,
      `${this.pedido.usuario?.correo || 'N/A'}`,
      formatFecha(new Date(this.pedido.fecha)),
      `${this.pedido.estado}`,
      `${this.pedido.direccion?.direccion || 'No disponible'}`,
    ];

    doc.setFontSize(12);
    const lineHeight = 8;

    etiquetas.forEach((etiqueta, i) => {
      doc.setTextColor(90);
      doc.setFont('helvetica', 'bold');
      doc.text(etiqueta, margenX, y + i * lineHeight);

      doc.setTextColor(30);
      doc.setFont('helvetica', 'normal');
      const texto = doc.splitTextToSize(valores[i], 120);
      doc.text(texto, margenX + 40, y + i * lineHeight);
    });

    y += etiquetas.length * lineHeight + 10;
    doc.setDrawColor(180);
    doc.line(margenX, y, margenDerecho, y);
    y += 14;
  };

  const imprimirHeaderTabla = () => {
    const headerHeight = 10;
    doc.setFillColor(60, 90, 150);
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.rect(margenX, y, margenDerecho - margenX, headerHeight, 'F');

    const yText = y + 7;
    doc.text('Imagen', margenX + 3, yText);
    doc.text('Nombre', colNombreX, yText);
    doc.text('Cantidad', colCantidadX, yText, { align: 'right' });
    doc.text('Precio Unit.', colPrecioX, yText, { align: 'right' });
    doc.text('Subtotal', colSubtotalX, yText, { align: 'right' });

    y += headerHeight + 4;
  };

  const verificarSaltoPagina = (altura: number) => {
    if (y + altura + margenInferior > paginaAlto) {
      doc.addPage();
      y = 20;
      imprimirHeaderTabla();
    }
  };

  const agregarProductoConImagen = async (item: any, index: number) => {
    const nombreWrapped = doc.splitTextToSize(item.producto.nombre, colCantidadX - colNombreX - 6);
    const alturaTexto = nombreWrapped.length * lineHeightProducto;
    const alturaTotalFila = Math.max(altoImagen, alturaTexto) + 10;

    verificarSaltoPagina(alturaTotalFila);

    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margenX, y - 2, margenDerecho - margenX, alturaTotalFila, 'F');
    }

    const url = item.producto.imagen
      ? `http://localhost:3000/uploads/${item.producto.imagen}`
      : 'assets/default-product.png';

    try {
      const { base64 } = await convertirImgBase64(url);
      doc.addImage(base64, 'PNG', margenX, y + 2, anchoImagen, altoImagen);
      doc.setDrawColor(200);
      doc.rect(margenX, y + 2, anchoImagen, altoImagen);
    } catch {}

    const textPosY = y + 6;
    doc.setTextColor(20);
    doc.setFont('helvetica', 'normal');
    nombreWrapped.forEach((line: string, i: number) => {
      doc.text(line, colNombreX, textPosY + i * lineHeightProducto);
    });

    const precio = item.producto.precio;
    const cantidad = item.cantidad;
    const subtotal = cantidad * precio;

    doc.text(String(cantidad), colCantidadX, textPosY, { align: 'right' });
    doc.text(formatMoneda(precio), colPrecioX, textPosY, { align: 'right' });
    doc.text(formatMoneda(subtotal), colSubtotalX, textPosY, { align: 'right' });

    y += alturaTotalFila;
  };

  const imprimirPie = () => {
    y += 10;
    doc.setDrawColor(100);
    doc.setLineWidth(0.6);
    doc.line(margenX, y, margenDerecho, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Total:', colPrecioX - 10, y, { align: 'right' });
    doc.text(formatMoneda(this.pedido.total), colSubtotalX, y, { align: 'right' });

    const paginas = doc.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${paginas}`, margenX, paginaAlto - 10);
      doc.text('Gracias por su compra - www.ProTech.com', margenDerecho, paginaAlto - 10, {
        align: 'right',
      });

      doc.setTextColor(120);
      doc.setFontSize(9);
      doc.text(`Emitido: ${formatFecha(new Date())}`, margenX, paginaAlto - 16);
    }
  };

  // Constantes de tabla
  const altoImagen = 20;
  const anchoImagen = 20;
  const colNombreX = margenX + anchoImagen + 12;
  const colCantidadX = 115;
  const colPrecioX = 150;
  const colSubtotalX = 185;
  const lineHeightProducto = 7;

  // Render
  await agregarEncabezado();
  agregarDatosPedido();
  imprimirHeaderTabla();

  await this.pedido.productos.reduce(async (prev: Promise<void>, item: any, i: number) => {
    await prev;
    await agregarProductoConImagen(item, i);
  }, Promise.resolve());

  imprimirPie();
  doc.save(`Factura-${this.pedido.usuario?.nombre || 'cliente'}-${this.pedido._id}.pdf`);
}




  // Función helper para convertir URL imagen a base64
  convertirImgBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('No se pudo obtener contexto de canvas');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }
}
