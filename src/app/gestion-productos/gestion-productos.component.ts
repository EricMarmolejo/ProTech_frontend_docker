import { Component } from '@angular/core';
import { ListaProductosComponent } from "./lista-productos/lista-productos.component";
import { AgregarProductosComponent } from "./agregar-productos/agregar-productos.component";

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [ListaProductosComponent, AgregarProductosComponent],
  templateUrl: './gestion-productos.component.html',
  styleUrl: './gestion-productos.component.css'
})
export class GestionProductosComponent {

}
