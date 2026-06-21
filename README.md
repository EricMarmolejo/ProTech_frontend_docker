
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

### ⚙️ Instalar Plugins Necesarios

**ANTES de crear el Job**, instala estos plugins:

1. Ve a Jenkins: `http://localhost:8080`
2. Click `Manage Jenkins > Manage Plugins > Available`
3. Busca e instala:
   - ✅ **NodeJS Plugin**
   - ✅ **Git Plugin** (probablemente ya está)
   - ✅ **Pipeline** (probablemente ya está)

4. Click `Download now and install after restart`
5. Espera a que reinicie Jenkins

### ⚙️ Configurar Herramientas en Jenkins

**DESPUÉS de instalar los plugins:**

En Jenkins ve a: `Manage Jenkins > Tools`

**1. Agregar Node.js:**
docker volume create jenkins_home

docker run -d -p 8080:8080 -p 50000:50000 --name protech-jenkins -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock -u root jenkins/jenkins:ltsdocker volume create jenkins_home

docker run -d -p 8080:8080 -p 50000:50000 --name protech-jenkins -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock -u root jenkins/jenkins:lts1. Busca `NodeJS Installations`
2. Click `Add NodeJS`
3. Name: **`node-20`** (exactamente así)
4. Version: `20.11.0` (o mayor)
5. Check: `Install automatically`
6. Click `Save`

**2. Dar permisos a Docker (CRÍTICO):**

Jenkins necesita acceso a Docker. Como Jenkins corre en un contenedor, necesitamos darle acceso al socket de Docker del host.

**En Windows PowerShell**, elimina el contenedor anterior e instala con acceso correcto a Docker:

```powershell
# Primero, detener y eliminar el contenedor anterior
docker stop protech-jenkins
docker rm protech-jenkins

# Crear volumen
docker volume create jenkins_home

# Ejecutar con acceso correcto a Docker
docker run -d `
  -p 8080:8080 `
  -p 50000:50000 `
  --name protech-jenkins `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -v //var/run/docker.sock:/var/run/docker.sock `
  --group-add 991 `
  -u root `
  jenkins/jenkins:lts
```

**O alternativa más simple (si tienes Docker Desktop en Windows):**

```powershell
# Instalar docker-cli dentro de Jenkins
docker exec protech-jenkins apt-get update && apt-get install -y docker.io

# Agregar usuario jenkins al grupo docker
docker exec protech-jenkins usermod -aG docker jenkins

# Reiniciar
docker restart protech-jenkins
```

**3. Verificar que funciona:**

```bash
# Ver logs
docker logs -f protech-jenkins

# Verificar que Docker está disponible en Jenkins
docker exec protech-jenkins docker ps
```

Debería listar los contenedores sin errores.

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
