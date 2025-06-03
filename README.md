# DeportesURJC - Web App para Gestión Deportiva Universitaria

Este proyecto forma parte de mi Trabajo de Fin de Grado y está desarrollado con el stack MERN: **MongoDB Atlas**, **Express.js**, **React** y **Node.js**.

---

## 🔧 Tecnologías principales

- **Frontend:** React
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB Atlas
- **Contenedores:** Docker + Docker Compose (opcional para desarrollo y pruebas)

---

## 🚀 Despliegue en local (modo desarrollo)

### Requisitos previos

- Node.js instalado
- Acceso a una base de datos MongoDB (como MongoDB Atlas)

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
    MONGO_ATLAS_URI=<tu_uri_de_mongo_atlas>
    SESSION_SECRET=<tu_clave_secreta_para_sesiones>
    SENDGRID_API_KEY=<clave_sendgrid> # Opcional para pruebas de correo
    ```

3. Abre dos terminales:

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

## 🐳 Despliegue con Docker (opcional)

Este proyecto también puede ejecutarse en contenedores Docker para facilitar el despliegue y la replicabilidad en diferentes entornos.  
> ⚠️ Actualmente, no se ha realizado un despliegue completo en producción en plataformas como Netlify, AWS o Vercel.

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

- Ejecutar todos los tests:
  ```bash
  npm run test
