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
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:8080',
            'http://localhost:3000',
            'https://deportes-urjc.vercel.app'
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS error: Origin ${origin} not allowed`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
    exposedHeaders: ['Set-Cookie']
};

// Middlewares y rutas
app.use(cors(corsOptions));
app.use(cookieParser());

// Session configuration with conditional store for testing
const sessionConfig = {
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 60 * 60 * 1000, // 1 hora
        domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let the browser determine the domain
    }
};

// Only use MongoStore if not in test environment
const mongoUri = process.env.NODE_ENV === 'test' 
    ? process.env.MONGO_ATLAS_URI_TESTS 
    : process.env.MONGO_ATLAS_URI;

if (mongoUri && process.env.NODE_ENV !== 'test') {
    sessionConfig.store = MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: 'sessions',
        ttl: 60 * 60 // 1 hora
    });
}

app.use(session(sessionConfig));

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

// Init DB and start server only if this file is run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`La app está en línea en el puerto ${port}`);
        initDB();
    });
} else {
    initDB(); // Also initialize for tests
}

// Exportamos para usarlo en tests
module.exports = app;
