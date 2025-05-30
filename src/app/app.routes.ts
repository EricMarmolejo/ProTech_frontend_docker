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
import { AuthGuard } from './shared/guards/auth.guard'; // si tienes uno
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

export const routes: Routes = [
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

  // Rutas protegidas dentro del dashboard
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard], // opcional si tienes autenticación
    children: [
      {
        path: 'inicio',
        component: InicioComponent,
        title: 'Inicio',
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        title: 'Usuarios',
      },
      {
        path: 'lista_productos',
        component: ListaProductosComponent,
        title: 'Productos'
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        title: 'Reportes',
      },
      {
        path: 'perfil',
        component: PerfilComponent,
        title: 'Perfil',
      },
      {
        path: 'soporte',
        component: SoporteComponent,
        title: 'Soporte',
      },
      {
        path: 'productos',
        component: GestionProductosComponent,
        title: 'Gestion de productos',
      },
      {
        path: 'producto/:id',
        component:DetalleProductoComponent,
      },
      {
        path: 'carrito',
        component:CarritoComponent,
        title:'Carrito de compras'
      },
      {
        path:'resumen-orden',
        component: ResumenOrdenComponent,
        title: 'Resumen de la orden'
      },
      {
        path:'Mis_pedidos',
        component:PedidosClientesComponent,
        title: 'Mis pedidos'
      },
      {
        path:'Pedidos',
        component:PedidosAdminComponent,
        title:'Pedidos'
      },
      {
        path:'Pedidos/:id',
        component:VerDetalleComponent,
        title:'Detalle pedido'
      },
      {
        path: 'stock/:idProducto/:tipo',
        loadComponent: () =>
          import('./formulario-stock/formulario-stock.component').then(
            (m) => m.FormularioStockComponent
          ),
        title: 'Registrar movimiento de stock',
      },
      {
        path: 'stock/:idProducto',
        loadComponent: () =>
          import('./movimientos-stock/movimientos-stock.component').then(
            (m) => m.MovimientosStockComponent
          ),
        title: 'Ver movimientos de stock',
      },
      {
        path: 'categorias',
        component: CategoriasComponent,
        title: 'Gestion de categorias',
      },
      {
        path: 'productos/editar/:id',
        component: EditarProductosComponent, // o un componente separado si prefieres
        title: 'Editar producto',
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
    ],
  },

  // Ruta para 404
  {
    path: '**',
    title: '404',
    component: NotFoundComponent,
  },
  {
    path:'',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
