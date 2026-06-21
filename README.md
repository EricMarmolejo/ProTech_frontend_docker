
# 🛒 ProTech Frontend

**ProTech Frontend** es la interfaz web de una tienda virtual moderna, desarrollada en Angular como parte del proyecto **ProTech**. Está diseñado para ofrecer una experiencia intuitiva tanto para administradores como para clientes, facilitando la navegación por productos, gestión de inventario y pedidos, y el control de usuarios.

---

## 📸 Capturas de pantalla

### 📦 Vista de cliente
![image](https://github.com/user-attachments/assets/2fc6b6a3-d7e0-40cb-9f4f-4ac346883109)


### 🔧 Panel de administrador
![image](https://github.com/user-attachments/assets/cead2e3d-a5c0-41f5-8b21-a877438e62b2)



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

## 🐳 Docker

### Construir imagen Docker

```bash
docker build -t protech-frontend .
```

### Ejecutar contenedor

```bash
docker run -p 80:80 protech-frontend
```

Accede a: `http://localhost`

### Usando Docker Compose

```bash
docker-compose up -d
```

Accede a Jenkins: `http://localhost:8080`

---

## 🔄 Integración Continua con Jenkins

Este proyecto incluye **Jenkinsfile** para automatizar:
- Build de Angular
- Tests unitarios
- Build y prueba de Docker
- Push automático a Docker Registry (rama main)

### ⚙️ Configuración Inicial

**Requisitos:**
- Jenkins v2.387+
- Node.js v20+
- Docker

**1. Verificar requisitos:**

```bash
# Verificar Docker
docker --version

# Verificar que Docker está corriendo
docker ps

# Verificar Node.js (en la máquina o en Jenkins)
node --version
npm --version
```

Si alguno no está instalado, instálalo antes de continuar.

**2. Instalar Jenkins:**

**En Linux/Mac:**
```bash
# Crear volumen para persistencia
docker volume create jenkins_home

# Descargar imagen (si no la tienes)
docker pull jenkins/jenkins:lts

# Ejecutar contenedor
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  --name protech-jenkins \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -u root \
  jenkins/jenkins:lts
```

**En Windows PowerShell:**
```powershell
# Crear volumen para persistencia
docker volume create jenkins_home

# Descargar imagen (si no la tienes)
docker pull jenkins/jenkins:lts

# Ejecutar contenedor
docker run -d `
  -p 8080:8080 `
  -p 50000:50000 `
  --name protech-jenkins `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -u root `
  jenkins/jenkins:lts
```

**3. Obtener contraseña inicial:**

```bash
docker exec protech-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copia la contraseña que aparece.

**4. Acceder a Jenkins:**

Abre en el navegador: `http://localhost:8080`
- Pega la contraseña
- Elige "Install suggested plugins"
- Crea usuario admin

### ⚙️ Configurar Herramientas en Jenkins

En Jenkins ve a: `Manage Jenkins > Tools`

**Agregar Node.js:**
1. Click `NodeJS Installations > Add NodeJS`
2. Name: `node-20`
3. Version: `20.11.0`
4. Check: `Install automatically`
5. Save

**Agregar Git (si no está):**
1. Click `Git Installations > Add Git`
2. Name: `Default`
3. Path: Deja en blanco para detección automática
4. Save

### 🚀 Crear Job Pipeline

1. Click `+ Nueva Tarea` (o `New Item`)
2. Nombre: `ProTech-Frontend-CI`
3. Tipo: `Pipeline`
4. Click `OK`

**Configurar:**

En **Pipeline** section:
```
Definition: Pipeline script from SCM
SCM: Git
Repository URL: https://github.com/tu-usuario/ProTech_frontend_docker.git
Branch Specifier: */main
Script Path: Jenkinsfile
```

En **Build Triggers** (opcional):
```
Check: Poll SCM
Schedule: H H * * *
```

Click **Save**

### ▶️ Ejecutar Build

1. Abre el job `ProTech-Frontend-CI`
2. Click `Build Now`
3. Ve a `Console Output` para ver los logs

**Pipeline stages:**
```
Checkout → Install → Build → Tests → Docker Build → Test Docker → Push
```

Tiempo estimado: **10-15 minutos** (primera vez con caché)

### 📋 Si Jenkins ya estaba ejecutándose

**Ver contenedores Jenkins existentes:**

```bash
# Ver todos los contenedores
docker ps -a

# Ver solo protech-jenkins
docker ps -a | findstr protech-jenkins
```

**Comandos para gestionar protech-jenkins:**

```powershell
# Obtener contraseña inicial
docker exec protech-jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Si está detenido, reiniciarlo
docker start protech-jenkins

# Ver logs en tiempo real
docker logs -f protech-jenkins

# Detener Jenkins
docker stop protech-jenkins

# Eliminar contenedor (los datos persisten en volumen)
docker rm protech-jenkins

# Eliminar volumen (CUIDADO: borra todos los datos de Jenkins)
docker volume rm jenkins_home
```

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
