// server/routes/auth.js
// Endpoints de registro, login y perfil del usuario.
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

function getJwtSecret() {
    const s = process.env.JWT_SECRET;
    if (!s || s === 'cambia_esto_por_una_cadena_larga_y_aleatoria') {
        throw new Error('JWT_SECRET no configurado correctamente en .env');
    }
    return s;
}

function signToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        getJwtSecret(),
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();

        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
        if (existing.rows.length) {
            return res.status(409).json({ error: 'Este email ya está registrado' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [cleanName, cleanEmail, passwordHash]
        );

        const user = rows[0];
        const token = signToken(user);

        res.status(201).json({ user, token });
    } catch (err) {
        console.error('register:', err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const cleanEmail = email.trim().toLowerCase();

        const { rows } = await pool.query(
            'SELECT id, name, email, password_hash FROM users WHERE email = $1',
            [cleanEmail]
        );
        if (!rows.length) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = rows[0];
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        delete user.password_hash;
        const token = signToken(user);

        res.json({ user, token });
    } catch (err) {
        console.error('login:', err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// GET /api/auth/me — devuelve el usuario actual (requiere token)
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, name, email, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ user: rows[0] });
    } catch (err) {
        console.error('me:', err);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

module.exports = router;
