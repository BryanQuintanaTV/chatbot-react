# Maintenance Mode IP Whitelist

## Descripción

Esta funcionalidad permite que ciertas direcciones IP puedan bypasear la página de mantenimiento y acceder a la aplicación normalmente, incluso cuando `VITE_MAINTENANCE_MODE=true`.

## Casos de Uso

- Permitir que administradores accedan durante mantenimiento
- Permitir que equipos de desarrollo/testing prueben la aplicación
- Permitir acceso a IPs específicas de oficina o VPN
- Habilitar acceso a equipos de soporte técnico

## Configuración

### 1. Variable de Entorno

Agrega la variable `VITE_MAINTENANCE_WHITELIST_IPS` a tu archivo `.env`:

```env
# Modo de mantenimiento activado
VITE_MAINTENANCE_MODE=true

# Lista de IPs permitidas (separadas por comas)
VITE_MAINTENANCE_WHITELIST_IPS='192.168.1.100,203.0.113.45'
```

### 2. Formatos Soportados

#### IPs Exactas
```env
VITE_MAINTENANCE_WHITELIST_IPS='192.168.1.100'
```

#### Múltiples IPs
```env
VITE_MAINTENANCE_WHITELIST_IPS='192.168.1.100,10.0.0.5,203.0.113.45'
```

#### Notación CIDR (rangos de red)
```env
# Permite toda la subred 192.168.1.0/24 (192.168.1.0 - 192.168.1.255)
VITE_MAINTENANCE_WHITELIST_IPS='192.168.1.0/24'

# Permite toda la red privada de clase A
VITE_MAINTENANCE_WHITELIST_IPS='10.0.0.0/8'
```

#### Wildcards (comodines)
```env
# Permite cualquier IP que empiece con 192.168.1
VITE_MAINTENANCE_WHITELIST_IPS='192.168.1.*'

# Permite cualquier IP que empiece con 10.0
VITE_MAINTENANCE_WHITELIST_IPS='10.0.*.*'
```

#### Combinación de Formatos
```env
VITE_MAINTENANCE_WHITELIST_IPS='192.168.1.100,10.0.0.0/8,172.16.*,203.0.113.45'
```

## Cómo Encontrar Tu IP

### Método 1: Usando el Componente IPDebugger

1. Importa y agrega el componente `IPDebugger` temporalmente a cualquier página:

```jsx
import { IPDebugger } from '@/components/IPDebugger';

export function MiPagina() {
  return (
    <div>
      {/* Tu contenido */}
      <IPDebugger />
    </div>
  );
}
```

2. Abre la aplicación en el navegador
3. Verás tu IP actual y el estado de whitelist
4. Copia la IP y agrégala a la variable de entorno
5. Remueve el componente `IPDebugger` cuando termines

### Método 2: Usando la Consola del Navegador

1. Abre la aplicación (sin modo mantenimiento primero)
2. Abre las DevTools del navegador (F12)
3. En la consola, si estás whitelisted, verás un mensaje:
   ```
   Maintenance mode bypassed: IP 192.168.1.100 is whitelisted
   ```

### Método 3: Servicios Web

Visita cualquiera de estos sitios para conocer tu IP pública:
- https://ipify.org
- https://ifconfig.me
- https://api.ipify.org

## Bypass de Desarrollo (localStorage)

Para desarrollo y testing, también puedes activar un bypass usando localStorage:

### Activar Bypass
Abre la consola del navegador y ejecuta:
```javascript
localStorage.setItem('bypass-maintenance', 'true');
```

### Desactivar Bypass
```javascript
localStorage.removeItem('bypass-maintenance');
```

### Verificar Estado
```javascript
localStorage.getItem('bypass-maintenance'); // Retorna 'true' o null
```

**⚠️ Nota:** Este método solo funciona en el navegador específico donde lo configuras. Es útil para desarrollo local pero NO debe usarse en producción.

## Ejemplo Completo

### Archivo `.env`
```env
# Activar modo mantenimiento
VITE_MAINTENANCE_MODE=true

# Fecha de fin estimada (opcional)
VITE_MAINTENANCE_END_TIME=2025-12-01T10:00:00Z

# Permitir IPs de oficina y administradores
VITE_MAINTENANCE_WHITELIST_IPS='203.0.113.45,192.168.1.0/24,10.0.0.5'
```

### Comportamiento Esperado

Con esta configuración:
- ✅ La IP `203.0.113.45` puede acceder
- ✅ Cualquier IP en el rango `192.168.1.0` a `192.168.1.255` puede acceder
- ✅ La IP `10.0.0.5` puede acceder
- ❌ Cualquier otra IP verá la página de mantenimiento

## Seguridad

### Mejores Prácticas

1. **No expongas las IPs whitelisted públicamente**
   - Mantén el archivo `.env` fuera del control de versiones
   - No compartas las IPs en documentación pública

2. **Usa rangos restrictivos**
   - Prefiere IPs exactas sobre wildcards amplios
   - Evita permitir rangos muy grandes si no es necesario

3. **Actualiza la whitelist regularmente**
   - Remueve IPs que ya no necesitan acceso
   - Revisa la lista después de cada mantenimiento

4. **Combina con autenticación**
   - La whitelist NO reemplaza la autenticación
   - Los usuarios whitelisted aún necesitan credenciales válidas

### Limitaciones

1. **Solo IP Pública**
   - El hook `useClientIP` obtiene la IP pública del cliente
   - Si usas proxy/VPN, verás la IP del proxy

2. **IPs Dinámicas**
   - Si tu ISP asigna IPs dinámicas, pueden cambiar
   - Considera usar CIDR o wildcards para rangos

3. **Múltiples NATs**
   - En redes corporativas con múltiples NATs, puede haber complejidades
   - Consulta con tu equipo de red para la IP correcta

## Troubleshooting

### La IP Whitelisted Aún Ve Mantenimiento

1. **Verifica la configuración:**
   ```bash
   # En la terminal, imprime la variable
   echo $VITE_MAINTENANCE_WHITELIST_IPS
   ```

2. **Verifica que reiniciaste el servidor:**
   ```bash
   # Las variables de entorno requieren reinicio
   npm run dev
   ```

3. **Usa IPDebugger para debug:**
   - Agrega `<IPDebugger />` y verifica el estado

4. **Revisa la consola del navegador:**
   - Debe mostrar: "Maintenance mode bypassed: IP xxx.xxx.xxx.xxx is whitelisted"

### El Hook Tarda Mucho en Cargar

- El hook `useClientIP` hace fetch a APIs externas (ipify.org, ipapi.co)
- Puede tardar 1-3 segundos la primera vez
- Si hay problemas de red, verás un spinner mientras carga
- Considera usar localStorage bypass para desarrollo local

### Formato de IP Incorrecto

```env
# ❌ Incorrecto - espacios extra
VITE_MAINTENANCE_WHITELIST_IPS=' 192.168.1.1 , 10.0.0.5 '

# ✅ Correcto - sin espacios extra
VITE_MAINTENANCE_WHITELIST_IPS='192.168.1.1,10.0.0.5'

# ✅ También correcto - el parser limpia espacios alrededor de comas
VITE_MAINTENANCE_WHITELIST_IPS='192.168.1.1, 10.0.0.5'
```

## Testing

### Probar la Funcionalidad

1. **Activa modo mantenimiento:**
   ```env
   VITE_MAINTENANCE_MODE=true
   VITE_MAINTENANCE_WHITELIST_IPS=''
   ```
   - Debes ver la página de mantenimiento

2. **Agrega tu IP a la whitelist:**
   ```env
   VITE_MAINTENANCE_WHITELIST_IPS='<tu-ip-aqui>'
   ```
   - Reinicia el servidor
   - Debes ver la aplicación normal

3. **Prueba con CIDR:**
   ```env
   VITE_MAINTENANCE_WHITELIST_IPS='192.168.0.0/16'
   ```
   - Si tu IP empieza con 192.168, deberías acceder

4. **Prueba localStorage bypass:**
   - Remueve tu IP de la whitelist
   - En consola: `localStorage.setItem('bypass-maintenance', 'true')`
   - Recarga la página - debes acceder

## Arquitectura Técnica

### Archivos Modificados

- **`src/hooks/useClientIP.js`**: Hook para obtener IP del cliente
- **`src/lib/ipWhitelist.js`**: Utilidades de whitelist (matching, CIDR, wildcards)
- **`src/App.jsx`**: Lógica de verificación antes de mostrar mantenimiento
- **`src/components/IPDebugger.jsx`**: Componente de debugging
- **`.env.example`**: Variable de entorno documentada

### Flujo de Verificación

```
┌─────────────────────────────────┐
│ App.jsx se carga                │
│ isMaintenanceMode = true        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ useClientIP() obtiene IP        │
│ (fetch a ipify.org/ipapi.co)    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ isIPWhitelisted(clientIP)       │
│ - Verifica IP exacta            │
│ - Verifica CIDR                 │
│ - Verifica wildcards            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ isMaintenanceBypassEnabled()    │
│ - Verifica localStorage         │
└────────────┬────────────────────┘
             │
       ┌─────┴─────┐
       │           │
     Yes           No
       │           │
       ▼           ▼
  ┌────────┐  ┌───────────────┐
  │ App    │  │ Maintenance   │
  │ Normal │  │ Page          │
  └────────┘  └───────────────┘
```

## Integración con Backend

Actualmente, la whitelist se verifica **solo en el frontend**. Para mayor seguridad, considera implementar la misma lógica en el backend:

```python
# Django/FastAPI example
MAINTENANCE_WHITELIST_IPS = ['192.168.1.0/24', '203.0.113.45']

def is_ip_whitelisted(request_ip: str) -> bool:
    for pattern in MAINTENANCE_WHITELIST_IPS:
        if matches_pattern(request_ip, pattern):
            return True
    return False

@middleware
def maintenance_middleware(request):
    if MAINTENANCE_MODE and not is_ip_whitelisted(request.META['REMOTE_ADDR']):
        return MaintenanceResponse()
    return next(request)
```

## Referencias

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [CIDR Notation](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)
- [ipify API](https://www.ipify.org/)
- [React Hooks](https://react.dev/reference/react)

## Changelog

### v1.0.0 (2025-11-22)
- ✨ Implementación inicial de whitelist de IPs
- ✨ Soporte para IPs exactas, CIDR y wildcards
- ✨ Hook useClientIP para obtener IP pública
- ✨ Componente IPDebugger para testing
- ✨ Bypass con localStorage para desarrollo
- 📝 Documentación completa

## Soporte

Si tienes problemas o preguntas:
1. Revisa esta documentación primero
2. Usa el componente `IPDebugger` para debugging
3. Revisa la consola del navegador para logs
4. Contacta al equipo de desarrollo
