// server.js
// Servidor Express principal: sirve el frontend estático y expone /api/*.
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./server/routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- CORS ----------
// Lista blanca desde CORS_ORIGIN (separada por comas). Vacío = permitir cualquier origen.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, cb) {
        if (!origin) return cb(null, true);                // mismo origen / curl / SSR
        if (allowedOrigins.length === 0) return cb(null, true); // sin lista → todo permitido
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true
}));

// ---------- Body parser ----------
app.use(express.json({ limit: '1mb' }));

// ---------- Estáticos del frontend ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- API ----------
app.get('/api/status', (req, res) => {
    res.json({
        status: 'Motor de salto en línea y operativo',
        code: 200,
        env: process.env.NODE_ENV || 'development'
    });
});

app.use('/api/auth', authRoutes);

// Cualquier otra ruta no definida por el API → entrega index.html (SPA fallback)
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
    console.error('💥', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

// ---------- Start ----------
app.listen(PORT, () => {
    console.log(`🚀 Explorador Solar transmitiendo en: http://localhost:${PORT}`);
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️  DATABASE_URL no configurado. Configura .env para que funcione el registro/login.');
    }
});
