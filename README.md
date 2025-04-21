# DeportesURJC - Web App para Gestión Deportiva Universitaria

Este proyecto forma parte de mi Trabajo de Fin de Grado.  
Está desarrollado con el stack MERN: **MongoDB Atlas**, **Express.js**, **React** y **Node.js**.

## 🔧 Tecnologías principales

- **Frontend**: React
- **Backend**: Node.js + Express
- **Base de datos**: MongoDB Atlas
- **Contenerización**: Docker + Docker Compose
---

## 🚀 Despliegue en local (modo desarrollo)

### Requisitos:
- Node.js instalado
- Acceso a una base de datos MongoDB (como MongoDB Atlas)

### Pasos:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Alexrguez9/deportesURJC.git
   cd deportesURJC
   ```
2. Crea un archivo .env en la raíz del proyecto con las siguientes variables:
   ```
   NODE_ENV=development
   BACKEND_PORT=4000
   FRONTEND_URL=http://localhost:8080
   MONGO_ATLAS_URI=<tu_uri_de_mongo_atlas>
   SESSION_SECRET=<tu_clave_secreta_para_sesiones>
   SENDGRID_API_KEY=<clave_sendgrid> # Si no necesitas enviar correos reales (por ejemplo en desarrollo), puedes dejar esta variable vacía o sin definir.
   ```
3. Abre dos terminales:

**Terminal 1 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 1 (Backend):**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## 🐳 Despliegue con Docker
Este proyecto puede ejecutarse en contenedores Docker. Las imágenes están disponibles en DockerHub bajo la cuenta del desarrollador.

### Pasos:
Asegúrate de tener Docker y Docker Compose instalados.

Crea un archivo .env en la raíz del proyecto con las variables mencionadas arriba.

Ejecuta:
```
docker-compose up --build
```
Esto levantará los servicios de frontend y backend conectados a la base de datos MongoDB Atlas.


## 🧪 Tests
### Ejecutar todos los tests
```
npm run test
```

### Ejecutar tests con cobertura
```
npm run test:coverage
```

## ℹ️ Notas adicionales
- El valor NODE_ENV puede cambiarse a production si se desea ejecutar en modo optimizado, por ejemplo al servir el frontend con serve o al desplegar en un servidor real.
- Actualmente no se ha realizado un despliegue completo en producción (con dominio y servidor web), pero se han generado imágenes Docker listas para ello.
