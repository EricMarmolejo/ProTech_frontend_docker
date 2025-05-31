
# 🛒 ProTech Frontend

**ProTech Frontend** es la interfaz web de una tienda virtual moderna, desarrollada en Angular como parte del proyecto **ProTech**. Está diseñado para ofrecer una experiencia intuitiva tanto para administradores como para clientes, facilitando la navegación por productos, gestión de inventario y pedidos, y el control de usuarios.

---

## 📸 Capturas de pantalla

### 📦 Vista de cliente
![image](https://github.com/user-attachments/assets/2fc6b6a3-d7e0-40cb-9f4f-4ac346883109)


### 🔧 Panel de administrador
![image](https://github.com/user-attachments/assets/cead2e3d-a5c0-41f5-8b21-a877438e62b2)


> *Nota: Puedes añadir tus capturas en `docs/screenshots/`.*

---

## 🚀 Características principales

- 📋 Catálogo de productos dinámico con filtros y paginación.
- 🔐 Autenticación y autorización por roles (cliente y administrador).
- 🧩 Panel administrativo para gestionar:
  - Productos
  - Stock
  - Pedidos
  - Usuarios
- 📈 Reportes interactivos con filtros, exportación y gráficos.
- 🎨 Interfaz responsive con diseño modular.
- 🌐 Comunicación con backend (API REST) usando servicios Angular.
- 🧪 Pruebas unitarias con Karma y Jasmine.

---

## 🧰 Tecnologías usadas

| Tecnología     | Versión / Enlace                         |
|----------------|------------------------------------------|
| Angular        | 17.3.16                                  |
| TypeScript     | ~5.3.2                                   |
| Node.js        | Recomendado: >=18.x                      |
| HTML/CSS       | Estilos personalizados (sin Tailwind)    |
| Angular Router | Para navegación                         |
| RxJS           | Para manejo reactivo de datos            |
| Chart.js / ApexCharts | Para gráficos de reportes       |

---

## ⚙️ Instalación y ejecución local

1. **Clonar el repositorio:**

```bash
git clone https://github.com/Juanda09/ProTech_frontend.git
cd ProTech_frontend
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Levantar servidor de desarrollo:**

```bash
ng serve
```

4. **Acceder desde el navegador:**

```
http://localhost:4200/
```

---

## 🗺️ Estructura de rutas

| Ruta                    | Descripción                                |
|-------------------------|--------------------------------------------|
| `/login`                | Página de inicio de sesión                 |
| `/register`             | Registro de nuevos usuarios                |
| `/home`                 | Página principal del catálogo              |
| `/admin/dashboard`      | Panel administrativo                       |
| `/admin/products`       | Gestión de productos                       |
| `/admin/users`          | Gestión de usuarios                        |
| `/reports`              | Módulo de reportes                         |

---

## 🧪 Pruebas

- **Ejecutar pruebas unitarias:**

```bash
ng test
```

- **Ejecutar pruebas E2E (si están configuradas):**

```bash
ng e2e
```

---

## 📁 Estructura de carpetas destacadas

```
src/
├── app/
│   ├── auth/              # Autenticación y guardias
│   ├── shared/            # Componentes y servicios comunes
│   ├── components/        # Componentes generales (header, cards, etc.)
│   ├── pages/             # Vistas principales (home, login, admin)
│   ├── services/          # Servicios HTTP
├── assets/
│   ├── images/            # Recursos visuales
│   └── styles/            # CSS personalizados
```

---

## ✅ Buenas prácticas aplicadas

- Modularización del código con lazy loading.
- Uso de `environment.ts` para variables globales como URLs del backend.
- Tipado estricto de datos con interfaces y modelos.
- Protección de rutas con `CanActivate`.
- Separación de lógica de presentación y lógica de negocio.
- Componentes standalone para reutilización flexible.

---

## 🔗 Enlaces útiles

- [Repositorio Backend (FastAPI)](https://github.com/Juanda09/ProTech_backend) *(si aplica)*
- [Documentación oficial de Angular](https://angular.io/)
- [Guía de estilos Angular](https://angular.io/guide/styleguide)

---

## 🤝 Contribuir

¿Quieres contribuir al proyecto? ¡Sigue estos pasos!

1. Haz un fork del repositorio.
2. Crea una rama con tu nueva funcionalidad: `git checkout -b feature/nueva-funcionalidad`.
3. Realiza los cambios y haz commit: `git commit -m "Agrega nueva funcionalidad"`.
4. Haz push a tu rama: `git push origin feature/nueva-funcionalidad`.
5. Abre un Pull Request detallando tus cambios.

---

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT.

---

## 👤 Autor

**Juan David Huertas Zapata**  
📧 h0774762@gmail.com  
📱 3143312325  
🔗 [Perfil GitHub](https://github.com/Juanda09)
