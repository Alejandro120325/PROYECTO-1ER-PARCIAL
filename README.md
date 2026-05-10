# 🌌 EXPLORADOR DEL SISTEMA SOLAR AAA

![Three.js](https://img.shields.io/badge/Three.js-Black?style=for-the-badge&logo=three.js&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-Green?style=for-the-badge&logo=greensock&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

Experiencia web inmersiva de alto impacto visual diseñada para la exploración astronómica. Este proyecto utiliza un motor **3D fotorrealista** basado en WebGL y una interfaz futurista bajo la estética *"Gold & Dark"*. Integra un sistema completo de autenticación y una arquitectura de servidor profesional.

---

## 🚀 Características Principales

- **Scattering Cinemático:** Los planetas inician en posiciones orbitales aleatorias en cada carga, garantizando una vista dinámica y única.
- **Escalado AAA:** Cuerpos celestes con tamaños optimizados y texturas de alta resolución para una fidelidad visual superior.
- **HUD Futurista:** Panel de control inspirado en *"Solar System Scope"* con telemetría astronómica y datos técnicos detallados.
- **Auth System UI:** Interfaz premium con modales de **Login** y **Registro** vinculados a un backend seguro.
- **Persistencia de Datos:** Gestión de usuarios y preferencias mediante base de datos relacional.

---

## 🛠️ Stack Tecnológico

- **Frontend:** `Three.js` (Motor 3D), `GSAP` (Animaciones cinemáticas), `HTML5/CSS3` (Efecto Glassmorphism).
- **Backend:** `Node.js` con el framework `Express`.
- **Base de Datos:** `PostgreSQL` alojado en `Supabase`.
- **Seguridad:** Autenticación basada en `JSON Web Tokens (JWT)`.

---

## 📂 Estructura del Proyecto

La arquitectura está organizada para separar claramente la lógica del cliente de la del servidor:

```text
PROYECTO-1ER-PARCIAL/
├── css/                # Estilos globales y diseño Gold & Dark
├── js/                 # Lógica del Frontend (Motor 3D, Interacción, Texturas)
│   └── textures/       # Mapas de texturas (4K/8K) para los planetas
├── server/             # Lógica del Backend
│   ├── middleware/     # Validaciones de seguridad (JWT)
│   ├── routes/         # Definición de endpoints de la API
│   └── db.js           # Configuración de conexión a PostgreSQL
├── docs/               # Documentación técnica adicional
├── index.html          # Punto de entrada de la interfaz de usuario
├── server.js           # Punto de entrada del servidor Express
├── .env.example        # Plantilla para variables de entorno
└── .gitignore          # Archivos excluidos del control de versiones
```

---

## ⚙️ Guía de Instalación Completa
Sigue estos pasos para replicar el entorno de desarrollo:

**1. Clonar el repositorio**

git clone [https://github.com/tu-usuario/PROYECTO-1ER-PARCIAL.git](https://github.com/tu-usuario/PROYECTO-1ER-PARCIAL.git)

**2. Instalar dependencias de Node.js**
```Bash
npm install
```

**3. Configurar variables de entorno**

Crea un archivo llamado .env en la raíz del proyecto. Copia el contenido de .env.example y rellena los valores reales:

```Bash
DATABASE_URL: Tu cadena de conexión de Supabase (PostgreSQL).

JWT_SECRET: Una cadena aleatoria segura para firmar los tokens.

PORT: Puerto del servidor (por defecto 3000).
```

**4. Preparar los Assets (Texturas)**

Asegúrate de que las imágenes de los planetas estén en la ruta correcta para que el motor 3D las cargue:
```text
Ruta: js/textures/
Archivos requeridos: sun.jpg, mercury.jpg, venus.jpg, earth.jpg, mars.jpg, jupiter.jpg, saturn.jpg, uranus.jpg, neptune.jpg, pluto.jpg, stars.jpg.
```

**6. Iniciar el servidor**

Para modo desarrollo (con recarga automática):

```Bash
npm run dev
```

---

**🛰️ Despliegue (Deployment)**

El proyecto está configurado para un despliegue híbrido:
```text
Frontend (GitHub Pages): Desplegado como sitio estático para visualización del motor 3D.

Backend (Railway/Vercel): El servidor Node.js y la base de datos PostgreSQL funcionan de forma independiente para procesar la lógica de usuarios.
```

---

**👤 Autor**

Alejandro Ojeda - Estudiante de Ingeniería en Ciencias de la Computación

[Universidad Politécnica Salesiana - Sede Quito]
