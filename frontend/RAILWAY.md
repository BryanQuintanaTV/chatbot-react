# 🚂 Railway Deployment Guide

Guía rápida para desplegar Tec Bot en Railway usando Nixpacks.

---

## ✅ Pre-requisitos

- Repositorio en GitHub
- Cuenta en [Railway.app](https://railway.app)
- Branch con los últimos cambios

---

## 🚀 Deploy en 3 Pasos

### 1️⃣ Conectar Railway a GitHub

1. Ve a [railway.app](https://railway.app) y haz login
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona el repositorio `chatbot-react`

### 2️⃣ Configurar el Proyecto

Railway detectará automáticamente la configuración, pero verifica:

**Settings → General:**
- ✅ **Root Directory:** `frontend`
- ✅ **Build Command:** `npm run build` (auto)
- ✅ **Start Command:** `npm run start` (auto)

**Settings → Variables:**

Agrega estas variables de entorno:

```env
VITE_API_URL=https://tu-backend.railway.app/api/v1/chat
NODE_ENV=production
VITE_MAINTENANCE_MODE=false
VITE_ENABLE_BACKEND_HEALTH_CHECK=true
```

**⚠️ Importante:** Las variables `VITE_*` se inyectan durante el build. Si las cambias, necesitas re-deployar.

### 3️⃣ Deploy

Railway deployeará automáticamente. Verás:

1. **Building...** - Instalando dependencias y creando build
2. **Deploying...** - Iniciando el servidor Express
3. **Active** - ✅ App lista!

**Tu URL:** `https://tu-proyecto.up.railway.app`

---

## 🔧 Configuración Avanzada

### Dominio Personalizado

**Settings → Networking → Custom Domain:**

1. Click **"Add Custom Domain"**
2. Ingresa tu dominio: `chatbot.tu-dominio.com`
3. Agrega el CNAME en tu proveedor DNS:
   ```
   CNAME chatbot -> tu-proyecto.up.railway.app
   ```
4. Railway genera SSL automáticamente

### Variables de Entorno Completas

```env
# API Backend
VITE_API_URL=https://tu-backend.railway.app/api/v1/chat

# App Info
CHATBOT_VERSION=0.0.2

# Features
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_END_TIME=
VITE_MAINTENANCE_WHITELIST_IPS=
VITE_ENABLE_BACKEND_HEALTH_CHECK=true
VITE_READ_ONLY_MODE=false

# Environment
NODE_ENV=production
```

### Configurar Branch de Deploy

**Settings → Service → Source:**

- Cambia **Source Branch** a tu rama preferida
- Por defecto usa `main` o `master`
- Puedes usar `production`, `staging`, etc.

### Healthchecks

Railway detecta automáticamente si tu app está saludable:

- **Path:** `/` (index.html)
- **Expected:** HTTP 200
- **Timeout:** 300s

---

## 🐛 Troubleshooting

### ❌ Build Fails

**Error:** `Cannot find module 'express'`

**Solución:**
```bash
# Asegúrate que express está en dependencies (no devDependencies)
# Ya está configurado en package.json
```

**Error:** `ENOENT: no such file or directory, open '.../dist/index.html'`

**Solución:**
```bash
# Verifica que el build se ejecutó
# Verifica que vite.config.js tiene outDir: 'dist'
```

### ❌ App no inicia

**Síntoma:** Build exitoso pero app crashea

**Solución:**
1. Ve a **Deployments → View Logs**
2. Verifica que veas:
   ```
   ✅ Server running on port 3000
   ```
3. Si no aparece, verifica `server.js` existe en el repo

### ❌ Página en blanco

**Síntoma:** App inicia pero página en blanco

**Solución:**
1. Abre DevTools (F12) → Console
2. Si ves error de MIME type:
   - Verifica que `server.js` se deployó
   - Re-deploy forzado: Settings → Deployments → Redeploy
3. Si ves 404 en assets:
   - Verifica que `npm run build` generó `dist/`
   - Verifica que `vite.config.js` está configurado correctamente

### ❌ Variables de entorno no funcionan

**Síntoma:** `VITE_API_URL` es undefined

**Solución:**

⚠️ **Las variables `VITE_*` se inyectan en BUILD TIME, no runtime**

1. Agrega las variables en Railway
2. Haz un **nuevo deploy** (no basta con reiniciar)
3. Verifica en el código bundleado:
   ```bash
   # Busca en dist/assets/*.js tu VITE_API_URL
   grep -r "VITE_API_URL" dist/
   ```

### ❌ CORS Errors

**Síntoma:** Errores de CORS al llamar API

**Solución:**

El frontend está en `chatbot.railway.app` pero el backend en `api.railway.app`:

1. Configura CORS en el backend:
   ```python
   # Django
   CORS_ALLOWED_ORIGINS = [
       "https://chatbot.railway.app",
       "https://tu-dominio.com",
   ]
   ```

2. O permite credentials:
   ```javascript
   // Express
   app.use(cors({
     origin: 'https://chatbot.railway.app',
     credentials: true
   }));
   ```

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

**Opción 1: Dashboard Web**
- Railway → Deployments → View Logs

**Opción 2: CLI**
```bash
npm install -g @railway/cli
railway login
railway link
railway logs
```

### Métricas

Railway muestra automáticamente:
- **CPU Usage**
- **Memory Usage**
- **Network Traffic**
- **Deploy Duration**

Accede en: Proyecto → Metrics

---

## 💰 Costos

Railway ofrece:
- **$5 de crédito gratis/mes** (Hobby Plan)
- **$0.000231 / GB-hour** para memoria
- **$0.000463 / vCPU-hour** para CPU

**Estimado para este proyecto:**
- ~$3-5 USD/mes con tráfico moderado
- Plan gratis es suficiente para desarrollo/testing

---

## 🔄 Auto-Deploy

Railway auto-deploya cuando haces push a la rama configurada:

```bash
git add .
git commit -m "Update frontend"
git push origin main  # O tu rama configurada
```

Railway detectará el push y deployeará automáticamente.

**Deshabilitar auto-deploy:**
Settings → Service → Uncheck "Auto-deploy on push"

---

## 📦 Archivos Importantes

Estos archivos ya están configurados en el repo:

| Archivo | Propósito |
|---------|-----------|
| `nixpacks.toml` | Configuración de build de Nixpacks |
| `server.js` | Servidor Express con MIME types correctos |
| `package.json` | Scripts de build y start |
| `vite.config.js` | Configuración de Vite |
| `.env.example` | Template de variables de entorno |

---

## 🎯 Checklist Pre-Deploy

Antes de deployar, verifica:

- [ ] `nixpacks.toml` está en `frontend/`
- [ ] `server.js` está en `frontend/`
- [ ] `package.json` tiene script `"start": "node server.js"`
- [ ] `express` está en dependencies
- [ ] Variables de entorno configuradas en Railway
- [ ] Branch correcta seleccionada en Railway
- [ ] Build local funciona: `npm run build && npm run start`

---

## 🔗 Enlaces Útiles

- [Railway Docs](https://docs.railway.app)
- [Nixpacks Docs](https://nixpacks.com)
- [Railway Discord](https://discord.gg/railway)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía completa para todas las plataformas

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs** en Railway Dashboard
2. **Consulta DEPLOYMENT.md** para troubleshooting detallado
3. **Verifica que el build local funciona:**
   ```bash
   cd frontend
   npm install
   npm run build
   npm run start
   # Abre http://localhost:3000
   ```
4. **Contacta al equipo de desarrollo** con los logs

---

**¡Listo!** 🎉 Tu app está en producción.
