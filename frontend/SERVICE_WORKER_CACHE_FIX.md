# Guía para Limpiar Caché del Service Worker

## Problema

Cuando cambias `VITE_MAINTENANCE_MODE` y haces redeploy, algunos usuarios pueden seguir viendo la versión vieja debido al Service Worker que cachea la aplicación.

---

## ✅ Solución Implementada

Se actualizó el Service Worker (`sw.js`) con las siguientes mejoras:

### Cambios:

1. **CACHE_NAME incrementado** de `v1` a `v2`
   - Fuerza la eliminación de cachés viejos

2. **index.html NO se cachea** en precache
   - Evita que se sirva una versión vieja del HTML

3. **Network-first para HTML**
   - Siempre busca la última versión en la red
   - Solo usa cache como fallback sin conexión

4. **Cache-first para assets** (JS, CSS, imágenes)
   - Mantiene buen performance para archivos estáticos

5. **HTML nunca se cachea**
   - Garantiza que cambios de mantenimiento se reflejen inmediatamente

---

## 🔧 Para Usuarios que Ya Tienen la App Abierta

Si deployaste y algunos usuarios siguen viendo la versión vieja:

### Opción 1: Pedir que desregistren el Service Worker

Los usuarios deben:

1. **Abrir DevTools** (F12)
2. Ir a **Application** tab
3. Sidebar → **Service Workers**
4. Click en **Unregister** junto a cada SW
5. **Recargar** la página (F5)

### Opción 2: Hard Refresh

1. **Ctrl + Shift + R** (Windows/Linux)
2. **Cmd + Shift + R** (Mac)

### Opción 3: Limpiar datos del sitio

1. **DevTools** (F12)
2. **Application** tab
3. Sidebar → **Storage**
4. Click **Clear site data**
5. Recargar

---

## 🚀 Para Futuros Deploys

Después de este fix, los usuarios **automáticamente** verán la nueva versión:

### Cómo Funciona Ahora:

1. Usuario recarga la página (F5 normal)
2. Service Worker ve que es navegación HTML
3. **Busca primero en la red** (network-first)
4. Obtiene la última versión del servidor
5. Usuario ve inmediatamente el modo mantenimiento ✅

### Si No Hay Conexión:

1. Service Worker detecta que la red falló
2. Sirve la página offline (`/offline.html`)
3. Usuario ve mensaje de "Sin conexión"

---

## 📋 Checklist Post-Deploy

Después de hacer deploy:

- [ ] Espera 1-2 minutos para que el deploy complete
- [ ] Abre la app en tu navegador
- [ ] F12 → Console
- [ ] Busca: `[ServiceWorker] Activate`
- [ ] Si ves esto, el nuevo SW está activo ✅
- [ ] Recarga con F5 normal
- [ ] Debe mostrar modo mantenimiento (si está activado)

---

## 🐛 Si Aún Hay Problemas

### Verificar Service Worker Actual:

```javascript
// En la consola del navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    console.log('SW:', registration);
  });
});
```

### Forzar Update del Service Worker:

```javascript
// En la consola del navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.update();
    console.log('SW updated');
  });
});
```

### Desregistrar Todos los Service Workers:

```javascript
// En la consola del navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
    console.log('SW unregistered');
  });
});
// Luego recargar: location.reload()
```

---

## 🔍 Verificar en DevTools

### Application → Service Workers:

Debes ver:
- **Status:** activated and is running
- **Source:** `/sw.js`
- **Scope:** `/`

### Application → Cache Storage:

Debes ver:
- **tecbot-v2** (nuevo)
- ~~tecbot-v1~~ (debería ser eliminado automáticamente)

Si ves ambos, el viejo no se eliminó. Elimínalo manualmente.

### Network → Headers:

Para el documento HTML principal:
```
Cache-Control: no-cache, no-store, must-revalidate, proxy-revalidate
```

---

## 📝 Notas Técnicas

### Network-First Strategy:

```javascript
// Para navegación/HTML
if (event.request.mode === 'navigate') {
  event.respondWith(
    fetch(event.request)  // ← Primero intenta red
      .catch(() => caches.match(OFFLINE_URL))  // ← Cache solo si falla
  );
}
```

### Cache-First Strategy:

```javascript
// Para assets estáticos
event.respondWith(
  caches.match(event.request)  // ← Primero busca en cache
    .then(cached => cached || fetch(event.request))  // ← Red si no hay cache
);
```

### No Cache para HTML:

```javascript
// En fetch response
if (!event.request.url.endsWith('.html')) {
  cache.put(event.request, response);  // Solo cachea NO-HTML
}
```

---

## 🎯 Resultado Esperado

Después de este fix:

| Escenario | Resultado |
|-----------|-----------|
| Deploy nuevo + F5 | ✅ Ve nueva versión inmediatamente |
| Deploy nuevo + cerrar/abrir | ✅ Ve nueva versión |
| Modo mantenimiento ON | ✅ Todos ven página de mantenimiento |
| Modo mantenimiento OFF | ✅ Todos ven app normal |
| Sin conexión | ✅ Ven página offline |

---

## 💡 Tips

1. **Incrementa CACHE_NAME** cada vez que hagas cambios críticos al SW
   ```javascript
   const CACHE_NAME = 'tecbot-v3';  // v2 → v3
   ```

2. **No cachees HTML** nunca en un PWA con modo mantenimiento

3. **Network-first** siempre para navegación principal

4. **Cache-first** está OK para assets con hash (Vite los genera automáticamente)

---

## 🆘 Soporte

Si después de este fix los usuarios SIGUEN viendo versión vieja:

1. Verifica que el nuevo `sw.js` se deployó:
   ```
   https://tu-dominio.com/sw.js
   ```
   Debe tener `CACHE_NAME = 'tecbot-v2'`

2. Verifica headers del servidor en Network tab

3. Pide a usuarios que limpien cache manualmente (una sola vez)

4. Considera deshabilitar SW temporalmente si es crítico:
   ```javascript
   // En index.html, comentar el registro del SW
   // navigator.serviceWorker.register('/sw.js')
   ```

---

**Última actualización:** 2025-11-22
**Versión SW:** v2
