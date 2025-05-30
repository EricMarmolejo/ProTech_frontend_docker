import { Component } from '@angular/core';
import { ListaCategoriasComponent } from "./lista-categorias/lista-categorias.component";
import { AgregarCategoriasComponent } from "./agregar-categorias/agregar-categorias.component";

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [ListaCategoriasComponent,AgregarCategoriasComponent],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent {

}
