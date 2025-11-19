# DeportesURJC - Web App para Gestión Deportiva Universitaria

Este proyecto forma parte de mi Trabajo de Fin de Grado y está desarrollado con el stack MERN: **MongoDB Atlas**, **Express.js**, **React** y **Node.js**.

---

## 🔧 Tecnologías principales

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB Atlas
- **Autenticación:** Express Session + Connect-Mongo
- **Testing:** Jest + React Testing Library
- **Contenedores:** Docker + Docker Compose (opcional para desarrollo y pruebas)

---

## ✨ Características principales

- **🔐 Sistema de autenticación completo**: Login/logout con sesiones persistentes
- **👥 Gestión de usuarios**: Registro, perfiles, roles (admin/usuario)
- **🏢 Gestión de instalaciones deportivas**: Salas, gimnasios, pistas
- **📅 Sistema de reservas**: Reserva de instalaciones por franjas horarias
- **🏆 Ligas internas**: Gestión de equipos y resultados deportivos
- **💰 Sistema de saldo**: Recarga virtual para pagos de servicios
- **📧 Notificaciones por email**: Confirmaciones y recordatorios
- **📱 Diseño responsive**: Optimizado para móvil y escritorio
- **🧪 Testing completo**: Cobertura de tests para frontend y backend

---

## 🚀 Despliegue en local (modo desarrollo)

### Requisitos previos

- Node.js instalado

### Pasos

1. Clona el repositorio:
    ```bash
    git clone https://github.com/Alexrguez9/deportesURJC.git
    cd deportesURJC
    ```

2. Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

    ```env
    NODE_ENV=development
    BACKEND_PORT=4000
    FRONTEND_URL=http://localhost:8080
    MONGO_ATLAS_URI="mongodb+srv://username:<password>@cluster.mongodb.net/database?retryWrites=true&w=majority"
    MONGO_ATLAS_URI_TESTS="mongodb+srv://username:<password>@cluster.mongodb.net/database_test?retryWrites=true&w=majority"
    SESSION_SECRET=<CLAVE_SECRETA_PARA_SESIONES>
    SENDGRID_API_KEY=<clave_sendgrid> # Opcional para pruebas de correo
    EMAIL_SENDER=<tu_email_verificado_en_sendgrid>
    ADMIN_EMAIL=<email_del_administrador>
    ```

    **📱 Aplicación en producción**: [https://deportes-urjc.vercel.app/](https://deportes-urjc.vercel.app/)

    ⚠️ **Importante:**  
    - Sustituye `<password>` por la contraseña de tu base de datos MongoDB Atlas.  
    - Sustituye `<CLAVE_SECRETA_PARA_SESIONES>` por una cadena segura y secreta que solo tú conozcas.
    - Configura `<tu_email_verificado_en_sendgrid>` con un email verificado en SendGrid para el envío de correos.
    - Define `<email_del_administrador>` para identificar cuentas administrativas.
    - **NUNCA subas el archivo `.env` al repositorio público** - está incluido en `.gitignore` por seguridad.
  
3. Crea un archivo .env en la carpeta frontend/ con la siguiente variable de entorno para definir la URL base de la API:

    ```env
    VITE_API_URL=http://localhost:4000
    ```
    Esto permitirá que las llamadas desde el frontend se conecten al backend a través de una URL configurable.

4. Abre dos terminales:

    - **Terminal 1 (Frontend):**
      ```bash
      cd frontend
      npm install
      npm run dev
      ```

    - **Terminal 2 (Backend):**
      ```bash
      cd backend
      npm install
      npm run dev
      ```

---

## 🌐 Aplicación en Producción

La aplicación está desplegada y disponible en:
**🔗 [https://deportes-urjc.vercel.app/](https://deportes-urjc.vercel.app/)**

### Configuración de Producción
- **Frontend**: Desplegado en Vercel
- **Backend**: Desplegado en Render
- **Base de datos**: MongoDB Atlas (producción)
- **Variables de entorno**: Configuradas en las respectivas plataformas de despliegue

### Diferencias con desarrollo local
- `NODE_ENV=production`
- `FRONTEND_URL=https://deportes-urjc.vercel.app`
- `VITE_API_URL` apunta al backend en producción
- Cookies configuradas con `sameSite: 'None'` y `secure: true`

---

## 🐳 Despliegue con Docker (opcional)

Este proyecto también puede ejecutarse en contenedores Docker para facilitar el despliegue y la replicabilidad en diferentes entornos.

### Pasos

1. Asegúrate de tener **Docker** y **Docker Compose** instalados.

2. Crea un archivo `.env` en la carpeta `backend/` con las variables mencionadas anteriormente.

3. Ejecuta:
    ```bash
    docker-compose up --build
    ```
    Esto levantará los servicios de **frontend** y **backend** conectados a la base de datos **MongoDB Atlas**.

---

## 🧪 Tests

El proyecto incluye tests completos para ambos componentes:

### Backend Tests
```bash
cd backend
npm test                    # Ejecutar todos los tests
npm run test:coverage      # Ejecutar tests con cobertura
```

### Frontend Tests
```bash
cd frontend
npm test                    # Ejecutar todos los tests
npm run test:coverage      # Ejecutar tests con cobertura
```

### Tests en CI/CD
Los tests se ejecutan automáticamente en GitHub Actions para cada pull request y push a las ramas principales.

---

## ℹ️ Notas adicionales

### Seguridad y Configuración
- La variable `SESSION_SECRET` es clave para la seguridad de las sesiones de usuario y debe mantenerse secreta.
- Usa contraseñas fuertes y guárdalas de forma segura.
- Para producción, gestiona las variables de entorno en la plataforma de despliegue y nunca las subas al repositorio.

### Base de Datos
- La base de datos principal se gestiona con **MongoDB Atlas**.
- Se incluye una base de datos separada para tests que permite verificar la funcionalidad sin afectar datos de desarrollo.
- Las sesiones se almacenan persistentemente en MongoDB usando `connect-mongo`.

### Arquitectura
- **Frontend**: React con Vite para desarrollo rápido y builds optimizados.
- **Backend**: Express.js con arquitectura MVC (Modelos, Vistas, Controladores).
- **Autenticación**: Sistema de sesiones seguras sin tokens JWT, ideal para aplicaciones web.
- **Testing**: Cobertura completa con Jest y React Testing Library.

### Despliegue
- **Frontend**: Desplegado en **Vercel** ([https://deportes-urjc.vercel.app/](https://deportes-urjc.vercel.app/))
- **Backend**: Configurado para **Render** u otras plataformas Node.js
- **Docker**: Opcional para desarrollo local y testing de integración
- **CI/CD**: GitHub Actions para testing automático
