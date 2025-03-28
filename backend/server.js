const express = require('express');
const session = require('express-session');
const initDB = require('./config/db');
const cors = require('cors');
const mailsRouters = require('./app/routes/mail');

const app = express();
const port = process.env.PORT;

app.use(cors({
    origin: ['http://localhost:8080'],
    credentials: true
}));

// Configure express to use JSON and URL encoded request bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure middleware for sessions
app.use(session({
    secret: 'yourSecretKey', // TODO: Change this to a secure key
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // TODO: change to true in production (HTTPS: process.env.NODE_ENV === 'production')
        httpOnly: true,
        maxAge: 60 * 60 * 1000 // 1 hour
    }
}));

// Configure routes
const teamRouters = require('./app/routes/team');
app.use(teamRouters);

const userRouters = require('./app/routes/user');
app.use('/', userRouters);

const resultadosRouters = require('./app/routes/result');
app.use(resultadosRouters);

const instalacionesRouters = require('./app/routes/facility');
app.use(instalacionesRouters);

const reservasRouters = require('./app/routes/reservation');
app.use(reservasRouters);

// Init express app
app.listen(port, () => {
    console.log(`La app está en línea en el puerto ${port}`);
});

app.use(mailsRouters);

// Init DB
initDB();
