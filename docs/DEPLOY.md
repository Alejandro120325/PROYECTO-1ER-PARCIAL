# 🚀 Despliegue: Supabase + Railway + Vercel

Guía paso a paso para poner online el Explorador Solar.

**Arquitectura:**
- **Supabase** → base de datos PostgreSQL
- **Railway** → servidor Express (`/api/auth/*`)
- **Vercel** → frontend estático (`public/`)

> Si quieres todo en un solo lugar, también puedes desplegar **solo en Railway** (sirve frontend + API). Las dos opciones se documentan abajo.

---

## 1. Supabase — base de datos

1. Crea cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo. Anota la contraseña de la DB.
2. Ve a **SQL Editor → New query**, pega el contenido de [`server/migrations/001_users.sql`](../server/migrations/001_users.sql) y haz clic en **Run**. Verás la tabla `users` creada.
3. Ve a **Project Settings → Database → Connection string → URI** y copia la cadena. Usa **Transaction pooler** (puerto 6543) para mejor rendimiento con Railway.

   Forma final:
   ```
   postgresql://postgres.xxxx:tu_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

   Guárdala — es tu `DATABASE_URL`.

---

## 2. Railway — backend Express

1. Crea cuenta en [railway.app](https://railway.app) y conecta tu repo de GitHub.
2. **New project → Deploy from GitHub repo** → selecciona este repo.
3. Railway detectará Node.js y usará `npm start` automáticamente (también lee `railway.json`).
4. Ve a la pestaña **Variables** y añade estas:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | la URI que copiaste de Supabase |
   | `JWT_SECRET` | una cadena aleatoria larga (ver siguiente paso) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | `https://tu-app.vercel.app` (más adelante) |

   Para generar `JWT_SECRET` localmente:
   ```bash
   npm run gen:secret
   ```

5. En **Settings → Networking** habilita **Generate Domain**. Anota la URL pública, p.ej. `https://explorador-solar.up.railway.app`.
6. Verifica que funcione: abre `https://tu-railway.up.railway.app/api/status` y debe responder JSON con `status: ...`.

---

## 3. Vercel — frontend

Tienes dos opciones:

### Opción A · Frontend separado en Vercel (recomendado)

1. Crea cuenta en [vercel.com](https://vercel.com) y conecta el repo.
2. Al importar el proyecto, en **Build & Output Settings**:
   - **Build Command**: dejar vacío
   - **Output Directory**: `public`
   - **Framework Preset**: Other
   (o simplemente acepta lo que detecta `vercel.json`).
3. Antes de desplegar, **edita `public/index.html`** y pon la URL de Railway en la meta:
   ```html
   <meta name="api-url" content="https://explorador-solar.up.railway.app">
   ```
4. Haz commit y push. Vercel auto-despliega.
5. Anota la URL final, p.ej. `https://explorador-solar.vercel.app`.
6. **Vuelve a Railway** y actualiza la variable `CORS_ORIGIN` con esa URL:
   ```
   CORS_ORIGIN=https://explorador-solar.vercel.app
   ```
   Railway redespliega solo.

### Opción B · Todo en Railway (un solo deploy)

Si prefieres un solo servicio, **no necesitas Vercel**. Railway ya sirve el frontend desde `public/` (gracias a `app.use(express.static(...))` en `server.js`).
- Deja `<meta name="api-url" content="">` vacío en `index.html`.
- Pon `CORS_ORIGIN=https://tu-app.up.railway.app` (mismo origen).

---

## 4. Desarrollo local

```bash
git clone <tu-repo>
cd "PROYECTO 1ER PARCIAL"
npm install
cp .env.example .env
# edita .env y rellena DATABASE_URL + JWT_SECRET
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000).

Para probar que la DB funciona, abre la consola del navegador y registra un usuario desde el modal. El usuario debe aparecer en la tabla `users` de Supabase (Dashboard → Table Editor).

---

## 5. Endpoints del API

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| `GET` | `/api/status` | — | `{ status, code, env }` |
| `POST` | `/api/auth/register` | `{ name, email, password }` | `{ user, token }` |
| `POST` | `/api/auth/login` | `{ email, password }` | `{ user, token }` |
| `GET` | `/api/auth/me` | — (header `Authorization: Bearer <token>`) | `{ user }` |

El token JWT se almacena en `localStorage.auth_token` y se envía automáticamente en `Authorization: Bearer ...` por `apiFetch()` ([public/js/config.js](../js/config.js)).

---

## 6. Troubleshooting

**`ERR_BAD_REQUEST` o CORS**
- Revisa que `CORS_ORIGIN` en Railway incluya exactamente la URL del frontend (sin slash final).

**`relation "users" does not exist`**
- No corriste la migración. Ejecuta [`server/migrations/001_users.sql`](../server/migrations/001_users.sql) en el SQL Editor de Supabase.

**`JWT_SECRET no configurado correctamente`**
- Genera uno real con `npm run gen:secret` y ponlo en las variables de Railway.

**Conexión a Supabase falla con SSL**
- Asegúrate de usar la URL del **pooler** (puerto 6543) y no la directa (5432).

**Al hacer login en producción no se guarda la sesión**
- El navegador puede estar bloqueando cookies/storage en sitios mixtos. Confirma que `api-url` apunte a HTTPS, no HTTP.
