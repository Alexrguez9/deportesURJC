const express = require('express');
const session = require('express-session');
const initDB = require('./config/db');
const cors = require('cors');
const mailsRouters = require('./app/routes/mail');
const MongoStore = require('connect-mongo');

const app = express();
const port = process.env.BACKEND_PORT;

const cookieParser = require('cookie-parser');

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares y rutas
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_ATLAS_URI,
        collectionName: 'sessions',
        ttl: 60 * 60 // 1 hora
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 60 * 60 * 1000 // 1 hora
    }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas
const teamRouters = require('./app/routes/team');
const userRouters = require('./app/routes/user');
const resultadosRouters = require('./app/routes/result');
const instalacionesRouters = require('./app/routes/facility');
const reservasRouters = require('./app/routes/reservation');

app.use(teamRouters);
app.use('/', userRouters);
app.use(resultadosRouters);
app.use(instalacionesRouters);
app.use(reservasRouters);
app.use(mailsRouters);

// Solo si es el archivo principal
if (require.main === module) {
    app.listen(port, () => {
        console.log(`La app está en línea en el puerto ${port}`);
        initDB(); // Aquí dentro
    });
} else {
    initDB(); // También la inicializamos para los tests
}

// Exportamos para usarlo en tests
module.exports = app;
