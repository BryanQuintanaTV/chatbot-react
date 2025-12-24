# 🐳 Coolify Deployment Guide

Guía específica para desplegar Tec Bot en Coolify usando Nixpacks.

---

## ✅ Pre-requisitos

- Instancia de Coolify funcionando
- Repositorio Git (GitHub, GitLab, etc.)
- Branch con los últimos cambios pusheados

---

## 🚀 Deploy en Coolify - Paso a Paso

### 1️⃣ Crear Nuevo Proyecto

1. En Coolify, ve a **Projects**
2. Click en **+ New**
3. Selecciona **Public Repository** o conecta tu cuenta de Git
4. Ingresa la URL de tu repositorio:
   ```
   https://github.com/tu-usuario/chatbot-react.git
   ```
5. Selecciona la rama: `claude/analyze-integrate-features-01F8zfWyt6ktesxA7wujQTrd`

### 2️⃣ Configurar el Build

**Build Settings:**

| Configuración | Valor |
|---------------|-------|
| **Build Pack** | Nixpacks (auto-detectado) |
| **Base Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm run start` |
| **Port** | `3000` |
| **Dockerfile** | *(dejar vacío, usar Nixpacks)* |

**⚠️ IMPORTANTE:** Asegúrate de configurar **Base Directory** como `frontend`

### 3️⃣ Variables de Entorno

Ve a **Environment Variables** y agrega:

```env
# Backend API
VITE_API_URL=https://tu-backend.tu-dominio.com/api/v1/chat

# App Info
CHATBOT_VERSION=0.0.2
NODE_ENV=production

# Features
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_END_TIME=
VITE_MAINTENANCE_WHITELIST_IPS=
VITE_ENABLE_BACKEND_HEALTH_CHECK=true
VITE_READ_ONLY_MODE=false

# Port (Coolify lo asigna automáticamente, pero por si acaso)
PORT=3000
```

**📌 Nota Importante sobre Variables `VITE_*`:**

Las variables que empiezan con `VITE_` se **inyectan durante el build**, no en runtime:

- Si cambias una variable `VITE_*`, debes hacer **Redeploy** (no basta con reiniciar)
- Se "embeben" en el código JavaScript durante la compilación
- Para verificar: busca en `dist/assets/*.js` después del build

### 4️⃣ Health Check (Opcional pero Recomendado)

**Health Check Settings:**

- **Protocol:** HTTP
- **Path:** `/`
- **Port:** `3000`
- **Expected Status:** `200`
- **Interval:** `30s`
- **Timeout:** `10s`
- **Retries:** `3`

### 5️⃣ Dominio

**Opción A: Usar dominio de Coolify**
- Coolify genera automáticamente: `tu-app.coolify-instance.com`

**Opción B: Dominio personalizado**
1. Ve a **Domains**
2. Click **+ Add Domain**
3. Ingresa: `chatbot.tu-dominio.com`
4. Configura DNS:
   ```
   Type: CNAME
   Name: chatbot
   Value: tu-coolify-instance.com
   ```
5. Coolify genera SSL automáticamente con Let's Encrypt

### 6️⃣ Deploy

1. Click en **Deploy**
2. Coolify ejecutará:
   - Clone del repositorio
   - Nixpacks build
   - npm install
   - npm run build
   - npm run start

**Verifica los logs:**
- Ve a la pestaña **Logs** en tiempo real
- Busca: `✅ Server running on port 3000`

---

## 🐛 Troubleshooting Específico de Coolify

### ❌ Error: "npm ci can only install when package.json and package-lock.json are in sync"

**Causa:** El `package-lock.json` no está sincronizado con `package.json`

**Solución:**
```bash
# Local
cd frontend
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

✅ **Ya está solucionado** en el último commit (7c215d3)

### ❌ Error: "Missing: express@4.21.2 from lock file"

**Causa:** El `package-lock.json` no incluye express

**Solución:** Mismo que arriba, ya solucionado en el último commit.

### ❌ Build falla en paso de "npm ci"

**Síntoma:**
```
#16 5.574 npm error Missing: express@4.21.2 from lock file
```

**Solución:**

1. **Asegúrate de tener el último código:**
   ```bash
   git pull origin claude/analyze-integrate-features-01F8zfWyt6ktesxA7wujQTrd
   ```

2. **Verifica que package-lock.json existe en frontend:**
   ```bash
   ls -la frontend/package-lock.json
   # Debe mostrar el archivo con tamaño ~385KB
   ```

3. **Redeploy en Coolify:**
   - Coolify → Deploy → Redeploy

### ❌ Build exitoso pero App crashea al iniciar

**Síntoma:** Build completa pero la app no inicia

**Verifica logs:**
```
# Debe aparecer:
✅ Server running on port 3000
🌐 Environment: production
📁 Serving from: /app/dist
```

**Si no aparece:**

1. **Verifica que server.js existe:**
   ```bash
   ls -la frontend/server.js
   # Debe existir
   ```

2. **Verifica Start Command en Coolify:**
   - Debe ser: `npm run start`
   - NO usar: `node server.js` (el script npm run start lo hace)

3. **Verifica que el build generó dist/:**
   - En logs de build, busca: `vite build`
   - Debe aparecer: `✓ built in XXms`

### ❌ Página en blanco - Error MIME type

**Síntoma:** App inicia pero página muestra en blanco

**Solución:**

1. **Abre DevTools (F12) → Console**
   - ¿Ves error de MIME type? El `server.js` ya lo soluciona

2. **Verifica que server.js se deployó:**
   ```bash
   # En Coolify logs durante deploy, busca:
   COPY . /app/.
   # Debe incluir server.js
   ```

3. **Fuerza rebuild:**
   - Coolify → Settings → Clear Build Cache
   - Redeploy

### ❌ Variables de entorno no funcionan

**Síntoma:** `import.meta.env.VITE_API_URL` es `undefined`

**Diagnóstico:**

Variables `VITE_*` se inyectan en **build time**:

1. **Verifica que las agregaste ANTES del build:**
   - Coolify → Environment Variables
   - Las variables deben estar ahí ANTES de hacer deploy

2. **Si las agregaste DESPUÉS del primer deploy:**
   ```bash
   # DEBES hacer Redeploy, no solo Restart
   Coolify → Deploy → Redeploy
   ```

3. **Verifica en el código bundleado:**
   ```bash
   # En container de Coolify (si tienes acceso)
   grep -r "VITE_API_URL" /app/dist/assets/*.js
   # Debe mostrar la URL real, no la variable
   ```

### ❌ Error 502 Bad Gateway

**Síntoma:** Coolify muestra 502 al acceder a la app

**Causas comunes:**

1. **Puerto incorrecto:**
   - Verifica que la app escucha en el puerto que Coolify espera
   - `server.js` usa: `process.env.PORT || 3000`
   - Coolify inyecta `PORT` automáticamente

2. **App no inició:**
   - Revisa logs: Coolify → Logs
   - Busca: `Server running on port`

3. **Health check fallando:**
   - Desactiva temporalmente health check
   - Si la app funciona sin health check, ajusta la configuración

### ❌ App funciona en build local pero falla en Coolify

**Pasos de diagnóstico:**

1. **Verifica Node version:**
   ```toml
   # En nixpacks.toml
   [phases.setup]
   nixPkgs = ['nodejs_20']  # Debe ser Node 20
   ```

2. **Simula el build de Coolify localmente:**
   ```bash
   cd frontend
   rm -rf node_modules dist package-lock.json
   npm install
   npm run build
   npm run start

   # Abre http://localhost:3000
   ```

3. **Compara variables de entorno:**
   - Local: `.env`
   - Coolify: Environment Variables tab
   - Deben coincidir

---

## 📊 Monitoreo en Coolify

### Ver Logs en Tiempo Real

**Durante Deploy:**
- Coolify → Logs (pestaña)
- Se actualizan automáticamente

**En Runtime:**
- Coolify → Logs
- Filtra por servicio si tienes múltiples

### Métricas

Coolify muestra:
- **CPU Usage**
- **Memory Usage**
- **Network Traffic**
- **Container Status**

Accede en: Application → Metrics

---

## 🔄 Configuración de Auto-Deploy

**Activar Auto-Deploy:**

1. Coolify → Settings → Git
2. Enable **Auto Deploy**
3. Selecciona **Branch** a monitorear
4. Coolify deployeará automáticamente en cada push

**Desactivar:**
- Toggle **Auto Deploy** a OFF
- Deploy manual: Coolify → Deploy

---

## 📁 Archivos Requeridos (Ya Configurados)

Estos archivos deben estar en el repositorio:

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `nixpacks.toml` | `/frontend/` | Configuración de Nixpacks |
| `server.js` | `/frontend/` | Servidor Express con MIME types |
| `package.json` | `/frontend/` | Scripts build/start |
| `package-lock.json` | `/frontend/` | Lock file sincronizado ✅ |
| `vite.config.js` | `/frontend/` | Config de Vite |

---

## 🎯 Checklist Pre-Deploy

Antes de deployar en Coolify:

- [x] `nixpacks.toml` está en `frontend/`
- [x] `server.js` está en `frontend/`
- [x] `package.json` tiene `"start": "node server.js"`
- [x] `express` está en dependencies
- [x] `package-lock.json` está sincronizado ✅
- [ ] Variables de entorno configuradas en Coolify
- [ ] Base Directory = `frontend`
- [ ] Branch correcta seleccionada
- [ ] Build local funciona: `npm run build && npm run start`

---

## 🔒 Seguridad en Coolify

### SSL/HTTPS

Coolify genera SSL automáticamente con Let's Encrypt:

1. Agrega dominio personalizado
2. Espera ~2 minutos
3. Coolify solicita y configura certificado automáticamente

### Headers de Seguridad

El `server.js` ya incluye:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`

**Para CSP adicional:**

Agrega en `server.js` si necesitas:
```javascript
res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'");
```

---

## 🔗 Diferencias: Coolify vs Railway

| Feature | Coolify | Railway |
|---------|---------|---------|
| **Auto SSL** | ✅ Let's Encrypt | ✅ Automático |
| **Nixpacks** | ✅ Soportado | ✅ Nativo |
| **Self-hosted** | ✅ Sí | ❌ Cloud only |
| **Precio** | Gratis (self-host) | $5 crédito/mes |
| **Container Registry** | Configurable | Automático |
| **CLI** | API disponible | Railway CLI |

**Mismo código funciona en ambas** gracias a Nixpacks! 🎉

---

## 📚 Referencias

- [Coolify Docs](https://coolify.io/docs)
- [Nixpacks Docs](https://nixpacks.com)
- [Troubleshooting Guide](./DEPLOYMENT.md)

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs** en Coolify Dashboard
2. **Verifica que el último commit incluye package-lock.json actualizado:**
   ```bash
   git log --oneline -5
   # Debe incluir: "fix: Update package-lock.json..."
   ```
3. **Prueba build local** antes de deploy en Coolify
4. **Consulta DEPLOYMENT.md** para troubleshooting general

---

**¡Listo para Coolify!** 🚀

El deploy debería funcionar ahora que el `package-lock.json` está sincronizado.
