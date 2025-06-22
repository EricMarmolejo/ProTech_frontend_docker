import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InicioComponent } from './inicio/inicio.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ReportesComponent } from './reportes/reportes.component';
import { PerfilComponent } from './perfil/perfil.component';
import { SoporteComponent } from './soporte/soporte.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { GestionProductosComponent } from './gestion-productos/gestion-productos.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { EditarProductosComponent } from './gestion-productos/editar-productos/editar-productos.component';
import { ListaProductosComponent } from './productos/lista-productos/lista-productos.component';
import { DetalleProductoComponent } from './productos/detalle-producto/detalle-producto.component';
import { CarritoComponent } from './orden/carrito/carrito.component';
import { ResumenOrdenComponent } from './orden/resumen-orden/resumen-orden.component';
import { PedidosClientesComponent } from './Pedidos/pedidos-clientes/pedidos-clientes.component';
import { PedidosAdminComponent } from './Pedidos/pedidos-admin/pedidos-admin.component';
import { VerDetalleComponent } from './Pedidos/ver-detalle/ver-detalle.component';
import { EditarCategoriaComponent } from './categorias/editar-categoria/editar-categoria.component';

export const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // Rutas públicas
  {
    path: 'login',
    title: 'Iniciar Sesión',
    component: LoginComponent,
  },
  {
    path: 'register',
    title: 'Registro',
    component: RegisterComponent,
  },

  // Rutas protegidas
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent, title: 'Inicio' },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        title: 'Usuarios',
        data: { roles: ['admin'] },
      },
      {
        path: 'lista_productos',
        component: ListaProductosComponent,
        title: 'Productos',
        data: { roles: ['cliente', 'admin'] },
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        title: 'Reportes',
        data: { roles: ['admin'] },
      },
      {
        path: 'perfil',
        component: PerfilComponent,
        title: 'Perfil',
        data: { roles: ['cliente', 'admin'] },
      },
      {
        path: 'soporte',
        component: SoporteComponent,
        title: 'Soporte',
        data: { roles: ['cliente', 'admin'] },
      },
      {
        path: 'productos',
        component: GestionProductosComponent,
        title: 'Gestión de productos',
        data: { roles: ['admin'] },
      },
      {
        path: 'producto/:id',
        component: DetalleProductoComponent,
        title: 'Detalle de producto',
        data: { roles: ['cliente', 'admin'] },
      },
      {
        path: 'carrito',
        component: CarritoComponent,
        title: 'Carrito de compras',
        data: { roles: ['cliente'] },
      },
      {
        path: 'resumen-orden',
        component: ResumenOrdenComponent,
        title: 'Resumen de la orden',
        data: { roles: ['cliente'] },
      },
      {
        path: 'Mis_pedidos',
        component: PedidosClientesComponent,
        title: 'Mis pedidos',
        data: { roles: ['cliente'] },
      },
      {
        path: 'Pedidos',
        component: PedidosAdminComponent,
        title: 'Pedidos',
        data: { roles: ['admin'] },
      },
      {
        path: 'Pedidos/:id',
        component: VerDetalleComponent,
        title: 'Detalle pedido',
        data: { roles: ['admin', 'cliente'] },
      },
      {
        path: 'stock/:idProducto/:tipo',
        loadComponent: () =>
          import('./formulario-stock/formulario-stock.component').then(
            (m) => m.FormularioStockComponent
          ),
        title: 'Registrar movimiento de stock',
        data: { roles: ['admin'] },
      },
      {
        path: 'stock/:idProducto',
        loadComponent: () =>
          import('./movimientos-stock/movimientos-stock.component').then(
            (m) => m.MovimientosStockComponent
          ),
        title: 'Ver movimientos de stock',
        data: { roles: ['admin'] },
      },
      {
        path: 'categorias',
        component: CategoriasComponent,
        title: 'Gestión de categorías',
        data: { roles: ['admin'] },
      },
      {
        path: 'categoria/editar/:id',
        component: EditarCategoriaComponent,
        title: 'Editar categoría',
        data: { roles: ['admin'] },
      },
      {
        path: 'productos/editar/:id',
        component: EditarProductosComponent,
        title: 'Editar producto',
        data: { roles: ['admin'] },
      },
    ],
  },

  // Ruta para 404 (debe ir al final)
  {
    path: '**',
    title: '404',
    component: NotFoundComponent,
  },
];
