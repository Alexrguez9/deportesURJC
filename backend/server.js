const express = require('express');
const initDB = require('./config/db');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://localhost:5173' }));


// Configurar express para parsear JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Traemos rutas del equipo
const teamRouters = require('./app/routes/equipo');
app.use(teamRouters);

// Traemos rutas del usuario
const userRouters = require('./app/routes/user');
app.use(userRouters);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`La app está en línea en el puerto ${port}`);
});

// Inicializar bbdd
initDB();
