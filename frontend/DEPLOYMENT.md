# Guía de Deployment - Tec Bot

## Problema: "Failed to load module script" con MIME type "text/plain"

Este error ocurre cuando el servidor web no está configurado para servir archivos JavaScript con el MIME type correcto (`application/javascript`). Este documento explica cómo solucionarlo en diferentes plataformas.

---

## 🚀 Build de Producción

Antes de desplegar, asegúrate de crear un build de producción:

```bash
cd frontend
npm install
npm run build
```

Esto generará una carpeta `dist/` con todos los archivos optimizados.

---

## 🌐 Deployment según Plataforma

### 1. Nginx

**Paso 1:** Copia el build al servidor
```bash
scp -r dist/* user@server:/var/www/chatbot/
```

**Paso 2:** Usa la configuración de nginx incluida
```bash
# Copia la configuración
sudo cp nginx.conf /etc/nginx/sites-available/chatbot

# Crea symlink
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/

# Verifica la configuración
sudo nginx -t

# Reinicia nginx
sudo systemctl restart nginx
```

**Configuración mínima alternativa:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/chatbot/dist;
    index index.html;

    # CRÍTICO: Incluir MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Asegurar que .js se sirve correctamente
    location ~* \.js$ {
        add_header Content-Type "application/javascript" always;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 2. Apache

**Paso 1:** Copia el build
```bash
scp -r dist/* user@server:/var/www/html/chatbot/
```

**Paso 2:** El archivo `.htaccess` ya está incluido en `public/`
Asegúrate de que se copie a la carpeta `dist/` durante el build.

**Paso 3:** Verifica que Apache tiene módulos habilitados
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
sudo a2enmod expires
sudo systemctl restart apache2
```

**Configuración de VirtualHost (opcional):**
```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    DocumentRoot /var/www/html/chatbot

    <Directory /var/www/html/chatbot>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # CRÍTICO: MIME types
        AddType application/javascript .js .jsx
        AddType text/css .css
        AddType application/json .json
        AddType application/manifest+json .webmanifest
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/chatbot-error.log
    CustomLog ${APACHE_LOG_DIR}/chatbot-access.log combined
</VirtualHost>
```

---

### 3. Vercel

**Opción A: Deploy desde Git (Recomendado)**

1. Conecta tu repositorio a Vercel
2. Configura el proyecto:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. Vercel detectará automáticamente `vercel.json`

**Opción B: Deploy desde CLI**

```bash
npm install -g vercel
cd frontend
vercel --prod
```

El archivo `vercel.json` ya incluye la configuración correcta de MIME types.

---

### 4. Netlify

**Opción A: Deploy desde Git (Recomendado)**

1. Conecta tu repositorio a Netlify
2. Configura el build:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

3. Netlify detectará `netlify.toml` automáticamente

**Opción B: Deploy desde CLI**

```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

Los archivos `netlify.toml` y `public/_redirects` ya están configurados.

---

### 5. GitHub Pages

**Paso 1:** Instala gh-pages
```bash
npm install --save-dev gh-pages
```

**Paso 2:** Agrega scripts a `package.json`
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Paso 3:** Actualiza `vite.config.js` con la base correcta
```javascript
export default defineConfig({
  base: '/nombre-del-repo/',
  // ... resto de configuración
})
```

**Paso 4:** Deploy
```bash
npm run deploy
```

---

### 6. Firebase Hosting

**Paso 1:** Instala Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

**Paso 2:** Inicializa Firebase
```bash
firebase init hosting
# Selecciona:
# - Public directory: dist
# - Single-page app: Yes
# - Automatic builds: No
```

**Paso 3:** Crea `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript; charset=utf-8"
          }
        ]
      },
      {
        "source": "**/*.css",
        "headers": [
          {
            "key": "Content-Type",
            "value": "text/css; charset=utf-8"
          }
        ]
      }
    ]
  }
}
```

**Paso 4:** Deploy
```bash
npm run build
firebase deploy
```

---

## 🔧 Troubleshooting

### Error persiste después de deployment

1. **Limpia caché del navegador**
   - Chrome: Ctrl+Shift+Delete → Clear cache
   - O usa modo incógnito

2. **Verifica que el build se completó correctamente**
   ```bash
   cd frontend
   rm -rf dist node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Verifica los archivos generados**
   ```bash
   ls -la dist/
   # Debe contener index.html y carpeta assets/
   ```

4. **Verifica MIME types en DevTools**
   - Abre DevTools (F12)
   - Pestaña Network
   - Recarga la página
   - Busca archivos .js
   - Verifica que Content-Type sea `application/javascript`

5. **Prueba el build localmente**
   ```bash
   npm run preview
   ```
   - Si funciona local pero no en producción, es un problema del servidor

### Manifest.json syntax error

Si ves "Manifest: Line 1, column 1, Syntax error":

1. **Verifica que manifest.json esté en public/**
   ```bash
   ls -la frontend/public/manifest.json
   ```

2. **Verifica que se copie al build**
   ```bash
   ls -la frontend/dist/manifest.json
   ```

3. **Si falta, cópialo manualmente**
   ```bash
   cp frontend/public/manifest.json frontend/dist/
   ```

4. **Verifica MIME type del manifest**
   - Debe ser `application/manifest+json`
   - Agrega en nginx/apache:
     ```
     AddType application/manifest+json .webmanifest
     ```

### Assets no se cargan (404 errors)

1. **Verifica la ruta base en vite.config.js**
   ```javascript
   export default defineConfig({
     base: '/', // Debe coincidir con tu URL
   })
   ```

2. **Verifica rutas en index.html**
   - Todas deben empezar con `/` (rutas absolutas)
   - No usar `./` (rutas relativas)

3. **Verifica configuración del servidor**
   - Nginx: `root /var/www/chatbot/dist;`
   - Apache: `DocumentRoot /var/www/html/chatbot`

---

## ✅ Checklist Pre-Deployment

Antes de hacer deploy, verifica:

- [ ] `npm run build` ejecuta sin errores
- [ ] Carpeta `dist/` contiene `index.html`
- [ ] Carpeta `dist/assets/` contiene archivos .js y .css
- [ ] Variables de entorno están configuradas (`.env`)
- [ ] Archivo de configuración del servidor está presente
  - [ ] nginx.conf (Nginx)
  - [ ] .htaccess (Apache)
  - [ ] vercel.json (Vercel)
  - [ ] netlify.toml (Netlify)
- [ ] Service Worker `sw.js` está en `public/`
- [ ] Manifest `manifest.json` está en `public/`
- [ ] Íconos PWA están en `public/`

---

## 📝 Variables de Entorno

Crea un archivo `.env` en `frontend/` antes del build:

```env
VITE_API_URL='https://tu-api.com/api/v1/chat'
CHATBOT_VERSION='0.0.2'
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_END_TIME=
VITE_MAINTENANCE_WHITELIST_IPS=''
VITE_ENABLE_BACKEND_HEALTH_CHECK=true
VITE_READ_ONLY_MODE=false
```

**Importante:**
- Las variables deben empezar con `VITE_` para ser accesibles en el frontend
- Nunca expongas secretos o API keys en variables `VITE_`
- Regenera el build después de cambiar variables

---

## 🔒 Seguridad en Producción

1. **Habilita HTTPS**
   ```bash
   # Certbot para Let's Encrypt (nginx)
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d tu-dominio.com
   ```

2. **Configura CSP (Content Security Policy)**
   ```nginx
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
   ```

3. **Habilita HSTS**
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   ```

4. **Revisa las variables de entorno**
   - No expongas URLs internas
   - No incluyas credenciales

---

## 📚 Referencias

- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- [Nginx MIME Types](https://nginx.org/en/docs/http/ngx_http_core_module.html#types)
- [Apache mod_mime](https://httpd.apache.org/docs/current/mod/mod_mime.html)
- [Vercel Configuration](https://vercel.com/docs/configuration)
- [Netlify Configuration](https://docs.netlify.com/configure-builds/file-based-configuration/)

---

## 🆘 Soporte

Si el problema persiste:

1. Revisa los logs del servidor:
   ```bash
   # Nginx
   sudo tail -f /var/log/nginx/error.log

   # Apache
   sudo tail -f /var/log/apache2/error.log
   ```

2. Comparte los siguientes detalles:
   - Plataforma de hosting (nginx/apache/vercel/etc)
   - Mensaje de error completo
   - Screenshot de DevTools → Network tab
   - Contenido de `dist/index.html` (primeras 50 líneas)

3. Contacta al equipo de desarrollo
