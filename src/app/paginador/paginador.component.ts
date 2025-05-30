// paginador.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.component.html',
  styleUrls: ['./paginador.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginadorComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.pageChange.emit(nuevaPagina); // ✅ Solo emitimos, sin cambiar currentPage aquí
  }

  paginas(): number[] {
    // Opcional: limitar a 5 páginas visibles, o mostrar todas
    const paginas = [];
    for (let i = 1; i <= this.totalPages; i++) {
      paginas.push(i);
    }
    return paginas;
  }
}
