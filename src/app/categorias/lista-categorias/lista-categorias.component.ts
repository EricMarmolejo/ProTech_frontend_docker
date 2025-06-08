import { Component, OnInit } from '@angular/core';
import { CategoriaService, Categoria } from '../../shared/services/categorias.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-categorias',
  templateUrl: './lista-categorias.component.html',
  styleUrls: ['./lista-categorias.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ListaCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  cargando = true;
  error = '';
  imagenBaseUrl = 'https://pro-tech-backend.vercel.app/uploads/';

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar categorías';
        this.cargando = false;
      }
    });
  }
   editarCategoria(categoria: Categoria): void {
    console.log('Editar categoría:', categoria);
    // Aquí puedes redirigir o abrir un modal
  }

  eliminarCategoria(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.categoriaService.eliminarCategoria(id).subscribe({
        next: () => {
          this.categorias = this.categorias.filter(cat => cat._id !== id);
        },
        error: () => {
          this.error = 'Error al eliminar la categoría';
        }
      });
    }
  }
}
