const express = require('express');
const session = require('express-session');
const initDB = require('./config/db');
const cors = require('cors');

const app = express();
const port = process.env.PORT;

app.use(cors({
    origin: ['http://localhost:8080'],
    credentials: true
}));

// Configurar express para parsear JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configurar middleware de sesión
app.use(session({
    secret: 'yourSecretKey', // Cambia esto por una clave secreta segura
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true en producción cuando use HTTPS: process.env.NODE_ENV === 'production'
        httpOnly: true,
        maxAge: 60 * 60 * 1000 // Tiempo de vida de la cookie en milisegundos (aquí, 1 hora)
    }
}));

// Traemos rutas del equipo
const teamRouters = require('./app/routes/equipo');
app.use(teamRouters);

// Traemos rutas del usuario
const userRouters = require('./app/routes/user');
app.use('/', userRouters);

// Traemos rutas de resultados
const resultadosRouters = require('./app/routes/resultado');
app.use(resultadosRouters);

// Traemos rutas de instalaciones
const instalacionesRouters = require('./app/routes/instalaciones');
app.use(instalacionesRouters);

// Traemos rutas de reservas
const reservasRouters = require('./app/routes/reservas');
app.use(reservasRouters);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`La app está en línea en el puerto ${port}`);
});

// Inicializar bbdd
initDB();
