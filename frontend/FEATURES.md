# 🚀 Nuevas Características Implementadas

Este documento describe las características avanzadas añadidas al Chatbot de TecNM Chihuahua II.

## 📋 Tabla de Contenido

1. [Error Boundaries](#error-boundaries)
2. [Detector Offline/Online](#detector-offlineonline)
3. [PWA Completo](#pwa-completo)
4. [Exportar Conversaciones](#exportar-conversaciones)
5. [Importar Conversaciones](#importar-conversaciones)
6. [Búsqueda Avanzada](#búsqueda-avanzada)
7. [Compartir Conversaciones](#compartir-conversaciones)

---

## 🛡️ Error Boundaries

### Descripción
Manejo robusto de errores a nivel de componentes React que evita que toda la aplicación se rompa cuando ocurre un error.

### Características
- ✅ Captura errores en componentes hijos
- ✅ Interfaz amigable con sugerencias de solución
- ✅ Opciones de recuperación (reintentar, recargar, ir al inicio)
- ✅ Stack trace en modo desarrollo
- ✅ Diseño responsive y profesional

### Ubicación
- Componente: `/src/components/ErrorBoundary.jsx`
- Integrado en: `/src/main.jsx` (envuelve toda la app)

### Uso
```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 🌐 Detector Offline/Online

### Descripción
Sistema reactivo que detecta y notifica el estado de conexión a internet del usuario.

### Características
- ✅ Hook personalizado `useOnlineStatus`
- ✅ Banner persistente cuando offline
- ✅ Toast notifications al cambiar estado
- ✅ Verificación periódica cada 30 segundos
- ✅ Detección automática de eventos del navegador

### Ubicación
- Hook: `/src/hooks/useOnlineStatus.js`
- Componente: `/src/components/OfflineDetector.jsx`
- Integrado en: `/src/App.jsx`

### API del Hook
```javascript
const { isOnline, lastChecked } = useOnlineStatus();
```

---

## 📱 PWA Completo

### Descripción
Aplicación Web Progresiva (PWA) totalmente funcional que permite instalar la app como nativa.

### Características
- ✅ Manifest.json con metadata institucional
- ✅ Service Worker con estrategia cache-first
- ✅ Página offline personalizada
- ✅ Hook `usePWA` para instalación programática
- ✅ Soporte para iOS y Android
- ✅ Cache automático de assets

### Archivos
- Manifest: `/public/manifest.json`
- Service Worker: `/public/sw.js`
- Página Offline: `/public/offline.html`
- Hook: `/src/hooks/usePWA.js`
- Registro: `/src/main.jsx`

### Configuración del Manifest
```json
{
  "name": "Tec Bot - TecNM Chihuahua II",
  "short_name": "Tec Bot",
  "display": "standalone",
  "theme_color": "#92b3ca"
}
```

### API del Hook usePWA
```javascript
const { isInstallable, isInstalled, installPWA } = usePWA();

// Instalar app
await installPWA();
```

---

## 💾 Exportar Conversaciones

### Descripción
Exporta conversaciones completas en múltiples formatos con metadata.

### Características
- ✅ Formato JSON (con metadata completa)
- ✅ Formato Markdown (para documentación)
- ✅ Formato Texto plano (legible)
- ✅ Copiar al portapapeles
- ✅ Descarga automática de archivos
- ✅ Nombres de archivo con timestamp

### Ubicación
- Componente: `/src/components/ExportConversation.jsx`
- Utilidades: `/src/lib/exportConversation.js`
- Integrado en: `/src/components/Chatbot.jsx`

### Formatos de Exportación

#### JSON
```json
{
  "version": "1.0",
  "exportedAt": "2025-11-20T...",
  "metadata": {
    "title": "Conversación",
    "model": "auto",
    "totalMessages": 10
  },
  "messages": [...]
}
```

#### Markdown
```markdown
# Título de Conversación

**Fecha:** ...
**Modelo:** auto
**Total:** 10 mensajes

---

## 👤 Usuario
Pregunta...

## 🤖 Asistente
Respuesta...
```

---

## 📥 Importar Conversaciones

### Descripción
Importa conversaciones previamente exportadas con validación completa.

### Características
- ✅ Drag & Drop de archivos
- ✅ Validación de formato y estructura
- ✅ Límite de tamaño (10MB)
- ✅ Prevención de conflictos de IDs
- ✅ Feedback visual completo
- ✅ Solo archivos JSON

### Ubicación
- Componente: `/src/components/ImportConversation.jsx`
- Utilidades: `/src/lib/importConversation.js`
- Integrado en: `/src/components/Chatbot.jsx`

### Validaciones
- ✅ Tamaño máximo: 10MB
- ✅ Tipo de archivo: JSON
- ✅ Estructura de mensajes válida
- ✅ Roles válidos (user, assistant, system)
- ✅ Regeneración automática de IDs

---

## 🔍 Búsqueda Avanzada

### Descripción
Sistema completo de búsqueda en conversaciones con múltiples filtros.

### Características
- ✅ Búsqueda en contenido de mensajes
- ✅ Filtros por tipo (usuario/asistente)
- ✅ Filtros por fecha (hoy, semana, mes, todo)
- ✅ Resaltado de coincidencias
- ✅ Estadísticas en tiempo real
- ✅ Scroll infinito de resultados
- ✅ Vista previa de mensajes

### Ubicación
- Componente: `/src/components/AdvancedSearch.jsx`
- Integrado en: `/src/components/Chatbot.jsx`

### Filtros Disponibles

#### Por Tipo de Mensaje
- Mensajes de usuario
- Respuestas del asistente

#### Por Fecha
- Todo
- Hoy
- Última semana
- Último mes

### Estadísticas
- Total de resultados
- Mensajes de usuario
- Mensajes del asistente

---

## 📤 Compartir Conversaciones

### Descripción
Comparte conversaciones usando la Web Share API nativa del navegador.

### Características
- ✅ Web Share API nativa (si está disponible)
- ✅ Compartir como texto
- ✅ Compartir como archivo JSON
- ✅ Compartir como archivo Markdown
- ✅ Fallback a copiar/descargar
- ✅ Detección automática de capacidades

### Ubicación
- Componente: `/src/components/ShareConversation.jsx`
- Utilidades: `/src/lib/exportConversation.js`
- Integrado en: `/src/components/Chatbot.jsx`

### Métodos de Compartir

1. **Compartir como texto** (Web Share API)
   - Abre el menú de compartir nativo
   - Funciona en móviles y navegadores compatibles

2. **Copiar como texto**
   - Copia al portapapeles
   - Disponible en todos los navegadores

3. **Exportar JSON**
   - Descarga o comparte archivo JSON
   - Mantiene toda la metadata

4. **Exportar Markdown**
   - Descarga o comparte archivo MD
   - Formato legible para documentación

---

## 🎨 Componentes UI Nuevos

Se crearon componentes UI adicionales de shadcn/ui:

- ✅ `badge.jsx` - Etiquetas y badges
- ✅ `dropdown-menu.jsx` - Menús desplegables
- ✅ `alert.jsx` - Alertas y notificaciones
- ✅ `switch.jsx` - Interruptores toggle
- ✅ `separator.jsx` - Separadores visuales
- ✅ `scroll-area.jsx` - Áreas con scroll
- ✅ `card.jsx` - Tarjetas de contenido

Todos ubicados en: `/src/components/ui/`

---

## 📦 Dependencias Nuevas

Paquetes NPM añadidos:

```json
{
  "@radix-ui/react-dropdown-menu": "latest",
  "@radix-ui/react-switch": "latest",
  "@radix-ui/react-separator": "latest",
  "@radix-ui/react-scroll-area": "latest"
}
```

---

## 🚀 Cómo Usar las Nuevas Características

### En la Interfaz del Chatbot

Cuando hay mensajes en la conversación, aparece una barra de herramientas con 4 botones:

1. **🔍 Buscar** - Abre el diálogo de búsqueda avanzada
2. **📤 Compartir** - Despliega opciones de compartir
3. **💾 Exportar** - Muestra formatos de exportación
4. **📥 Importar** - Abre diálogo para importar conversaciones

### Atajos de Teclado Recomendados (Futuro)

```
Ctrl/Cmd + F - Búsqueda avanzada
Ctrl/Cmd + E - Exportar conversación
Ctrl/Cmd + I - Importar conversación
Ctrl/Cmd + Shift + S - Compartir
```

---

## 🔧 Configuración y Personalización

### PWA

Para personalizar el manifest:
```javascript
// public/manifest.json
{
  "name": "Tu App Name",
  "theme_color": "#tuColor"
}
```

### Service Worker

Editar estrategias de cache:
```javascript
// public/sw.js
const CACHE_NAME = 'tu-cache-v1';
```

### Límites de Importación

Cambiar tamaño máximo:
```javascript
// src/lib/importConversation.js
const maxSize = 10 * 1024 * 1024; // 10MB
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Error Boundary atrapa errores correctamente
- [ ] Detector offline muestra banner sin conexión
- [ ] PWA se puede instalar en dispositivos
- [ ] Exportar genera archivos correctos (JSON, MD, TXT)
- [ ] Importar valida y carga archivos correctamente
- [ ] Búsqueda encuentra mensajes y aplica filtros
- [ ] Compartir funciona en navegadores compatibles
- [ ] UI responsive en móvil y desktop

---

## 📝 Notas Importantes

1. **Error Boundaries**: Solo funcionan en componentes de clase, por eso `ErrorBoundary.jsx` usa sintaxis de clase.

2. **Service Worker**: Se registra automáticamente en producción. En desarrollo puede causar problemas de cache.

3. **Web Share API**: Solo funciona en contextos seguros (HTTPS) y navegadores modernos.

4. **PWA**: Requiere HTTPS para instalación (excepto en localhost).

5. **Importación**: Solo acepta archivos exportados desde esta app o con formato compatible.

---

## 🐛 Troubleshooting

### El Service Worker no se actualiza
```bash
# Desregistrar todos los SW en DevTools
Application > Service Workers > Unregister
```

### PWA no se puede instalar
- Verificar que estás en HTTPS
- Verificar que manifest.json es accesible
- Revisar consola por errores

### Importación falla
- Verificar que el JSON tiene estructura válida
- Verificar tamaño del archivo (< 10MB)
- Revisar que los roles sean válidos

---

## 📚 Referencias

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🎯 Roadmap de Mejoras Futuras

- [ ] Tests automatizados (Jest/Vitest)
- [ ] Búsqueda con regex
- [ ] Temas personalizables
- [ ] Atajos de teclado configurables
- [ ] Sincronización con backend
- [ ] Múltiples conversaciones simultáneas
- [ ] Historial de exportaciones
- [ ] Estadísticas de uso

---

**Versión:** 2.0.0
**Fecha:** 2025-11-20
**Autor:** Claude Code Agent
**Institución:** TecNM Campus Chihuahua II
