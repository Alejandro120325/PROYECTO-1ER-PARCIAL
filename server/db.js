// server/db.js
// Pool de conexiones PostgreSQL (Supabase compatible).
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn('⚠️  DATABASE_URL no configurado. Las rutas de auth fallarán hasta que lo configures en .env');
}

// Supabase requiere SSL. El pooler de Supabase ya lo trae habilitado, pero el driver pg
// necesita que se le indique explícitamente.
const useSsl = !!connectionString && /supabase|render|railway|neon/i.test(connectionString);

const pool = new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en cliente PG:', err);
});

module.exports = pool;
