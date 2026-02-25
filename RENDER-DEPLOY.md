# Despliegue del Backend en Render

## Pasos para desplegar en Render

### 1. Preparar el repositorio
Asegúrate de que el código esté en GitHub con los cambios realizados.

### 2. Crear cuenta en Render
- Ve a [render.com](https://render.com)
- Regístrate con tu cuenta de GitHub

### 3. Crear un nuevo Web Service
1. En el dashboard de Render, click en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `SIDAF-PUNO`
5. Configura:
   - **Name:** `sidaf-backend`
   - **Branch:** `main`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Build Command:** (dejar vacío)
   - **Start Command:** (dejar vacío)

### 4. Configurar Variables de Entorno
En la sección **"Environment"**, agrega estas variables:

| Variable | Valor |
|----------|-------|
| `PORT` | `8083` |
| `DB_HOST` | `ep-delicate-sound-ailtkjb8-pooler.c-4.us-east-1.aws.neon.tech` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `neondb` |
| `DB_USERNAME` | `neondb_owner` |
| `DB_PASSWORD` | `npg_g9BpjO5woiJA` |
| `CORS_ORIGINS` | `https://tu-frontend.vercel.app` |
| `JWT_SECRET` | `una-clave-secreta-muy-larga-para-produccion` |

### 5. Desplegar
- Click en **"Create Web Service"**
- Espera a que termine el build (puede tomar 5-10 minutos)
- Una vez desplegado, obtendras una URL como: `https://sidaf-backend.onrender.com`

### 6. Probar la API
Prueba el endpoint:
```
https://sidaf-backend.onrender.com/api/hello
```

## Notas importantes
- Render asigna un subdominio `.onrender.com`
- El primer despliegue puede tomar varios minutos
- La base de datos Neon debe estar activa (verifica en el panel de Neon)
