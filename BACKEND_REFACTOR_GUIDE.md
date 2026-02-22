# Guía de Refactorización Backend — Tec Bot

> **Complemento de:** `BACKEND_IMPLEMENTATION_GUIDE.md`
> Este documento describe **únicamente los cambios nuevos** derivados de la refactorización del frontend.
> No repite los 17 endpoints ya documentados en la guía original.

---

## Resumen de cambios

| # | Cambio | Impacto en Backend |
|---|--------|--------------------|
| 1 | Config del sistema desde DB (mantenimiento, read-only, health check, IP whitelist, alertas) | Nuevos modelos + endpoints + SSE |
| 2 | Modelo de IA por chat (no global) | Campo `model_used` en `conversations`, validar restricción en `/api/v1/chat/` |
| 3 | Restricciones por usuario (admin las define) | Nuevo modelo `UserRestrictions`, campo `restrictions` en respuestas de auth, validación en endpoints existentes |
| 4 | Sesiones activas (ver y cerrar sesión en otros dispositivos) | Nuevo modelo `UserSession`, `jti` en JWT, 3 nuevos endpoints |

---

## 1. Configuración del Sistema desde Base de Datos

### 1.1 Variables que se mueven del `.env` a la DB

Las siguientes variables de entorno del frontend dejan de ser la fuente de verdad.
El backend pasa a ser quien las sirve. El frontend las seguirá leyendo del `.env`
**solo como fallback** mientras el backend no tenga los endpoints implementados.

| Variable anterior | Campo en DB |
|-------------------|-------------|
| `VITE_MAINTENANCE_MODE` | `system_config.maintenance_mode` |
| `VITE_MAINTENANCE_END_TIME` | `system_config.maintenance_end_time` |
| `VITE_MAINTENANCE_WHITELIST_IPS` | `system_config.maintenance_whitelist_ips` (JSON array) |
| `VITE_ENABLE_BACKEND_HEALTH_CHECK` | `system_config.enable_health_check` |
| `VITE_READ_ONLY_MODE` | `system_config.read_only_mode` |

---

### 1.2 Nuevo Modelo: `SystemConfig`

Tabla de fila única (singleton). Solo existe un registro; se crea en la migración inicial.

```sql
CREATE TABLE system_config (
  id                        INTEGER      PRIMARY KEY DEFAULT 1,
  maintenance_mode          BOOLEAN      NOT NULL DEFAULT FALSE,
  maintenance_start_time    TIMESTAMP    NULL,        -- NULL = ya está activo si maintenance_mode=true
  maintenance_end_time      TIMESTAMP    NULL,        -- NULL = sin fecha de fin
  maintenance_whitelist_ips JSONB        NOT NULL DEFAULT '[]',   -- ["IP", "CIDR", "192.168.1.*"]
  enable_health_check       BOOLEAN      NOT NULL DEFAULT TRUE,
  read_only_mode            BOOLEAN      NOT NULL DEFAULT FALSE,
  updated_at                TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_by_id             INTEGER      NULL REFERENCES auth_user(id) ON DELETE SET NULL,
  CONSTRAINT singleton CHECK (id = 1)
);
```

**Django model (Python):**
```python
class SystemConfig(models.Model):
    maintenance_mode          = models.BooleanField(default=False)
    maintenance_start_time    = models.DateTimeField(null=True, blank=True)
    maintenance_end_time      = models.DateTimeField(null=True, blank=True)
    maintenance_whitelist_ips = models.JSONField(default=list)
    enable_health_check       = models.BooleanField(default=True)
    read_only_mode            = models.BooleanField(default=False)
    updated_at                = models.DateTimeField(auto_now=True)
    updated_by                = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )

    class Meta:
        verbose_name = "System Config"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
```

---

### 1.3 Nuevo Endpoint: `GET /api/v1/system/config/`

**Autenticación:** Opcional (JWT con `Authorization: Bearer {token}`).
**Uso:** El frontend lo llama al arrancar (usuarios autenticados y no autenticados).

La IP del cliente debe compararse contra `maintenance_whitelist_ips`. Si está en la lista,
el campo `maintenance_mode` en la respuesta debe ser `false` independientemente del valor en DB.
La verificación de IP es **completamente server-side**; el frontend ya no necesita conocer la whitelist.

**Lógica de `maintenance_mode` efectivo:**
```python
from ipaddress import ip_address, ip_network

def is_ip_whitelisted(client_ip: str, whitelist: list[str]) -> bool:
    try:
        addr = ip_address(client_ip)
    except ValueError:
        return False
    for entry in whitelist:
        entry = entry.strip()
        if '*' in entry:
            # Wildcard: "192.168.1.*" → convierte a CIDR
            network_str = entry.replace('.*', '.0/24').replace('*', '0/8')
            try:
                if addr in ip_network(network_str, strict=False):
                    return True
            except ValueError:
                if str(addr).startswith(entry.replace('*', '')):
                    return True
        else:
            try:
                if addr in ip_network(entry, strict=False):
                    return True
            except ValueError:
                if str(addr) == entry:
                    return True
    return False
```

**Response (200):**
```json
{
  "maintenanceMode": false,
  "maintenanceStartTime": "2026-03-01T08:00:00Z",
  "maintenanceEndTime": "2026-03-01T10:00:00Z",
  "enableHealthCheck": true,
  "readOnlyMode": false,
  "alerts": [
    {
      "id": 1,
      "type": "warning",
      "translations": {
        "es": "El sistema estará en mantenimiento el 1 de marzo.",
        "en": "The system will be under maintenance on March 1st."
      },
      "startTime": "2026-02-28T00:00:00Z",
      "endTime": null
    }
  ]
}
```

**Notas:**
- `alerts` se filtra según el contexto del request:
  - Sin token → solo alertas `target_type = 'all'`
  - Con token → alertas `all`, `authenticated`, y las específicas del usuario autenticado
- `maintenanceMode: true` y `maintenanceStartTime` no nulo en el futuro indica **mantenimiento programado** (el frontend muestra un banner de aviso, no bloquea el acceso).
- `maintenanceMode: true` y `maintenanceStartTime` en el pasado (o nulo) indica **mantenimiento activo** (el frontend bloquea el acceso).
- Obtener IP del cliente: usar `request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))`.

---

### 1.4 Nuevo Endpoint: `GET /api/v1/events/stream/` — SSE Autenticado

**Autenticación:** Requerida (`Authorization: Bearer {token}`).
**Uso:** El frontend mantiene esta conexión abierta cuando el usuario está autenticado.
Permite recibir cambios en tiempo real (mantenimiento, suspensión, alertas).

**Content-Type:** `text/event-stream`

**Eventos que puede emitir el servidor:**

```
event: system_config_update
data: {"maintenanceMode":false,"readOnlyMode":false,"enableHealthCheck":true,"maintenanceStartTime":null,"maintenanceEndTime":null}

event: account_suspended
data: {"reason":"Violación de términos de servicio","suspendedUntil":"2026-03-15T00:00:00Z","isPermanent":false}

event: account_unsuspended
data: {}

event: alert_created
data: {"id":3,"type":"info","translations":{"es":"Mensaje","en":"Message"},"startTime":"2026-02-22T00:00:00Z","endTime":null}

event: alert_deleted
data: {"id":3}

event: restrictions_updated
data: {"canCreateChats":true,"canChangeAvatar":false,"canChangeName":true,"canChangeEmail":true,"canChangeSemester":true,"canChangeCareer":true,"canChangeModel":true,"canEditChatOptions":true,"canChangePassword":true}

event: ping
data: {}
```

**Implementación recomendada con Django + Redis:**

```python
# views.py
import json
import redis
from django.http import StreamingHttpResponse

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

def sse_stream(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = validate_jwt(token)  # implementar según tu auth actual
    if not user:
        return HttpResponse(status=401)

    def event_stream():
        pubsub = r.pubsub()
        # Canales globales y del usuario específico
        pubsub.subscribe('system:config', f'user:{user.id}:events')
        try:
            # Enviar estado actual al conectarse
            config = SystemConfig.get()
            yield format_sse('system_config_update', serialize_config(config))
            yield format_sse('ping', {})

            for message in pubsub.listen():
                if message['type'] == 'message':
                    # message['channel'] y message['data'] son strings JSON
                    payload = json.loads(message['data'])
                    yield format_sse(payload['event'], payload['data'])
        finally:
            pubsub.unsubscribe()

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # Para Nginx
    return response

def format_sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"
```

**Publicar un evento desde cualquier parte del backend:**
```python
import json
import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

def broadcast_config_update(config):
    payload = json.dumps({
        'event': 'system_config_update',
        'data': serialize_config(config)
    })
    r.publish('system:config', payload)

def push_suspension_to_user(user_id, suspension_info):
    payload = json.dumps({
        'event': 'account_suspended',
        'data': suspension_info
    })
    r.publish(f'user:{user_id}:events', payload)

def broadcast_alert_created(alert):
    payload = json.dumps({
        'event': 'alert_created',
        'data': serialize_alert(alert)
    })
    r.publish('system:config', payload)
```

**Disparar broadcast automáticamente al guardar:**
```python
# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=SystemConfig)
def on_config_change(sender, instance, **kwargs):
    broadcast_config_update(instance)
```

**Nginx — deshabilitar buffering para SSE:**
```nginx
location /api/v1/events/ {
    proxy_pass         http://django;
    proxy_buffering    off;
    proxy_cache        off;
    proxy_set_header   Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding on;
}
```

---

### 1.5 Nuevo Endpoint: `GET /api/v1/system/config/public/` — Polling No Autenticado

**Autenticación:** No requerida.
**Uso:** Usuarios no autenticados consultan cada 30 segundos para detectar cambios de mantenimiento.

Este endpoint es idéntico a `GET /api/v1/system/config/` pero:
- No incluye alertas dirigidas a usuarios autenticados o específicos.
- La verificación de IP aplica igual.

**Response (200):** Igual que `/api/v1/system/config/` pero `alerts` solo contiene las de `target_type = 'all'`.

> Puedes usar el mismo view y solo cambiar el comportamiento según si hay token en el header.

---

### 1.6 Nuevos Modelos y Endpoints: Sistema de Alertas

#### Modelo: `Language`

```python
class Language(models.Model):
    code = models.CharField(max_length=10, unique=True)  # "es", "en", "fr"
    name = models.CharField(max_length=50)               # "Español", "English"
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Language"
```

#### Modelo: `SystemAlert`

```python
class SystemAlert(models.Model):
    TYPE_CHOICES = [('info', 'Info'), ('warning', 'Warning'), ('error', 'Error')]
    TARGET_CHOICES = [
        ('all', 'Todos'),
        ('authenticated', 'Solo autenticados'),
        ('specific', 'Usuarios específicos'),
        ('filter', 'Filtro (carrera/semestre)'),
    ]

    type          = models.CharField(max_length=10, choices=TYPE_CHOICES, default='info')
    start_time    = models.DateTimeField()
    end_time      = models.DateTimeField(null=True, blank=True)  # None = no tiene fecha de fin
    target_type   = models.CharField(max_length=15, choices=TARGET_CHOICES, default='all')
    target_users  = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name='targeted_alerts'
    )
    target_filters = models.JSONField(default=dict, blank=True)
    # Ejemplo target_filters: {"careers": ["ingenieria-sistemas-computacionales"], "semesters": ["5", "6"]}
    created_at    = models.DateTimeField(auto_now_add=True)
    created_by    = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='created_alerts'
    )

    @property
    def is_active(self):
        now = timezone.now()
        if now < self.start_time:
            return False
        if self.end_time and now > self.end_time:
            return False
        return True

    class Meta:
        verbose_name = "System Alert"
        ordering = ['-created_at']
```

#### Modelo: `AlertTranslation`

```python
class AlertTranslation(models.Model):
    alert    = models.ForeignKey(SystemAlert, on_delete=models.CASCADE, related_name='translations_set')
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    message  = models.TextField()

    class Meta:
        unique_together = ('alert', 'language')
        verbose_name = "Alert Translation"
```

#### Serialización de alerta para el frontend

```python
def serialize_alert(alert, user=None):
    translations = {}
    for t in alert.translations_set.select_related('language').all():
        translations[t.language.code] = t.message
    return {
        'id': alert.id,
        'type': alert.type,
        'translations': translations,   # {"es": "...", "en": "..."}
        'startTime': alert.start_time.isoformat(),
        'endTime': alert.end_time.isoformat() if alert.end_time else None,
    }
```

#### Filtro de alertas por usuario

```python
from django.utils import timezone
from django.db.models import Q

def get_alerts_for_user(user=None, career=None, semester=None):
    now = timezone.now()
    qs = SystemAlert.objects.filter(
        start_time__lte=now
    ).filter(
        Q(end_time__isnull=True) | Q(end_time__gte=now)
    )

    if user is None:
        # Solo alertas públicas
        return qs.filter(target_type='all')

    return qs.filter(
        Q(target_type='all') |
        Q(target_type='authenticated') |
        Q(target_type='specific', target_users=user) |
        Q(target_type='filter')  # filtrar después por target_filters
    ).distinct()
    # Para 'filter': aplicar lógica de career/semester en Python después de fetch
```

#### Endpoints de alertas (admin)

```
POST   /api/v1/system/alerts/         Crear alerta (solo admin/staff)
PUT    /api/v1/system/alerts/{id}/    Editar alerta (solo admin/staff)
DELETE /api/v1/system/alerts/{id}/    Eliminar alerta (solo admin/staff)
```

Estos endpoints publican automáticamente `alert_created` / `alert_deleted` a todos los SSE conectados via Redis al guardar/eliminar.

---

## 2. Modelo de IA por Chat

### 2.1 Campo `model_used` en `conversations`

El campo `model_used` ya existe en `messages` pero **no** en `conversations`. Hay que agregarlo.

```sql
ALTER TABLE conversations ADD COLUMN model_used VARCHAR(50) NULL DEFAULT 'auto';
```

**Django:**
```python
# En el modelo Conversation existente, agregar:
model_used = models.CharField(max_length=50, null=True, blank=True, default='auto')
```

El frontend envía y espera `modelUsed` (camelCase) en las respuestas de `/api/conversations` y `/api/conversations/{id}`.

**Endpoints afectados:**
- `POST /api/conversations` — ahora acepta `modelUsed` en el body
- `PUT /api/conversations/{id}` — ahora acepta `modelUsed` en el body
- `GET /api/conversations` — ahora devuelve `modelUsed` en cada item
- `GET /api/conversations/{id}` — ahora devuelve `modelUsed`

### 2.2 Cambio en el endpoint de chat `POST /api/v1/chat/`

El frontend ahora envía el modelo específico del chat activo (no un modelo global).
El comportamiento del backend no cambia; sigue respetando el campo `model` del request body.
Solo documentar que `model` refleja la elección por-chat del usuario.

Si el backend actualmente tiene una lógica de "modelo por usuario" o "modelo global", debe eliminarse:
el modelo se determina **únicamente** por el campo `model` enviado en el body del request.

---

## 3. Restricciones por Usuario

### 3.1 Nuevo Modelo: `UserRestrictions`

```python
class UserRestrictions(models.Model):
    user               = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='restrictions'
    )
    can_create_chats   = models.BooleanField(default=True)
    can_change_avatar  = models.BooleanField(default=True)
    can_change_name    = models.BooleanField(default=True)
    can_change_email   = models.BooleanField(default=True)
    can_change_semester = models.BooleanField(default=True)
    can_change_career  = models.BooleanField(default=True)
    can_change_model   = models.BooleanField(default=True)
    can_edit_chat_options = models.BooleanField(default=True)
    can_change_password   = models.BooleanField(default=True)
    updated_at         = models.DateTimeField(auto_now=True)
    updated_by         = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='restrictions_set_by'
    )

    class Meta:
        verbose_name = "User Restrictions"
```

El registro se crea automáticamente al crear un usuario (signal `post_save`):

```python
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_restrictions(sender, instance, created, **kwargs):
    if created:
        UserRestrictions.objects.get_or_create(user=instance)
```

El administrador las edita desde **Django Admin** (no hay panel de admin en el frontend por ahora).

---

### 3.2 Serialización de restricciones

La respuesta de los endpoints de auth ahora debe incluir el objeto `restrictions` **en camelCase**:

```python
def serialize_restrictions(user):
    try:
        r = user.restrictions
    except UserRestrictions.DoesNotExist:
        r = None
    return {
        'canCreateChats':    getattr(r, 'can_create_chats', True),
        'canChangeAvatar':   getattr(r, 'can_change_avatar', True),
        'canChangeName':     getattr(r, 'can_change_name', True),
        'canChangeEmail':    getattr(r, 'can_change_email', True),
        'canChangeSemester': getattr(r, 'can_change_semester', True),
        'canChangeCareer':   getattr(r, 'can_change_career', True),
        'canChangeModel':    getattr(r, 'can_change_model', True),
        'canEditChatOptions': getattr(r, 'can_edit_chat_options', True),
        'canChangePassword': getattr(r, 'can_change_password', True),
    }
```

---

### 3.3 Endpoints modificados — auth

#### `POST /api/auth/login` — Response actualizada

```json
{
  "user": {
    "id": "uuid",
    "email": "user@chihuahua2.tecnm.mx",
    "name": "Juan Pérez",
    "semester": "5",
    "career": "ingenieria-sistemas-computacionales",
    "avatar": "avatar1",
    "profileComplete": true,
    "restrictions": {
      "canCreateChats": true,
      "canChangeAvatar": true,
      "canChangeName": true,
      "canChangeEmail": true,
      "canChangeSemester": true,
      "canChangeCareer": true,
      "canChangeModel": true,
      "canEditChatOptions": true,
      "canChangePassword": true
    }
  },
  "token": "eyJ..."
}
```

#### `GET /api/auth/me` — Response actualizada

Misma estructura que login: incluir `restrictions` en el objeto `user`.

---

### 3.4 Endpoints modificados — validación de restricciones

Cuando el backend recibe un request a estos endpoints, debe verificar la restricción correspondiente.
Si está restringido: responder `403 Forbidden` con el código adecuado.

| Endpoint | Restricción que verificar | Código de error |
|----------|--------------------------|-----------------|
| `PUT /api/auth/profile` (campo `name`) | `can_change_name` | `RESTRICTION_CHANGE_NAME` |
| `PUT /api/auth/profile` (campo `email`) | `can_change_email` | `RESTRICTION_CHANGE_EMAIL` |
| `PUT /api/auth/profile` (campo `semester`) | `can_change_semester` | `RESTRICTION_CHANGE_SEMESTER` |
| `PUT /api/auth/profile` (campo `career`) | `can_change_career` | `RESTRICTION_CHANGE_CAREER` |
| `PUT /api/auth/password` | `can_change_password` | `RESTRICTION_CHANGE_PASSWORD` |
| `POST /api/auth/avatar` | `can_change_avatar` | `RESTRICTION_CHANGE_AVATAR` |
| `POST /api/conversations` | `can_create_chats` | `RESTRICTION_CREATE_CHATS` |
| `PUT /api/conversations/{id}` | `can_edit_chat_options` | `RESTRICTION_EDIT_CHAT` |

**Formato de error:**
```json
{
  "detail": "settings.restricted",
  "code": "RESTRICTION_CHANGE_NAME"
}
```

El frontend usa `code` para mostrar el mensaje adecuado al usuario.

---

### 3.5 Restricción de modelo en el chat

Si `can_change_model = false`, el backend debe ignorar el campo `model` del request de chat y
forzar el uso de `pytorch` (modelo básico, sin opción de elegir).

```python
# En el view de POST /api/v1/chat/
requested_model = request.data.get('model', 'auto')
if user and not user.restrictions.can_change_model:
    requested_model = 'pytorch'
```

---

### 3.6 SSE push de restricciones al usuario

Cuando un admin modifica las restricciones de un usuario desde Django Admin,
si ese usuario tiene una sesión SSE activa debe recibir las nuevas restricciones en tiempo real:

```python
# En el admin de UserRestrictions o en su signal post_save:
@receiver(post_save, sender=UserRestrictions)
def on_restrictions_change(sender, instance, **kwargs):
    push_restrictions_to_user(instance.user_id, serialize_restrictions(instance.user))

def push_restrictions_to_user(user_id, restrictions_data):
    payload = json.dumps({
        'event': 'restrictions_updated',
        'data': restrictions_data
    })
    r.publish(f'user:{user_id}:events', payload)
```

---

## 4. Sesiones Activas

### 4.1 JWT con `jti` (JWT ID)

La estructura actual del JWT es `{ sub, exp, iat }`.
Hay que agregar el claim `jti` (un UUID único por token) para poder identificar y revocar sesiones individuales.

```python
import uuid

def create_access_token(user_id: str) -> str:
    payload = {
        'sub': user_id,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(days=7),
        'jti': str(uuid.uuid4()),   # <-- NUEVO
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
```

**Importante:** Esta es la única forma de invalidar tokens JWT sin cambiar a refresh tokens.
El middleware de autenticación debe verificar que el `jti` del token esté presente y activo en `UserSession`.

---

### 4.2 Nuevo Modelo: `UserSession`

```python
class UserSession(models.Model):
    user         = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions'
    )
    jti          = models.CharField(max_length=36, unique=True)  # UUID del JWT
    user_agent   = models.TextField(blank=True, default='')
    ip_address   = models.GenericIPAddressField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now_add=True)
    is_active    = models.BooleanField(default=True)

    class Meta:
        verbose_name = "User Session"
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['jti']),
            models.Index(fields=['user', 'is_active']),
        ]
```

**Crear sesión en login:**
```python
def login_view(request):
    # ... autenticar usuario ...
    jti = str(uuid.uuid4())
    token = create_access_token(user.id, jti)   # pasar jti al crear el token

    UserSession.objects.create(
        user=user,
        jti=jti,
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        ip_address=get_client_ip(request),
    )
    return Response({'user': serialize_user(user), 'token': token})
```

**Actualizar `last_activity` en cada request autenticado:**
```python
# En el middleware o authentication backend
class JWTAuthentication:
    def authenticate(self, request):
        token = get_token_from_header(request)
        payload = decode_jwt(token)
        jti = payload.get('jti')

        try:
            session = UserSession.objects.get(jti=jti, is_active=True)
        except UserSession.DoesNotExist:
            raise AuthenticationFailed('Session revoked or invalid.')

        # Actualizar last_activity (throttled: solo si han pasado >60s)
        now = timezone.now()
        if (now - session.last_activity).seconds > 60:
            UserSession.objects.filter(pk=session.pk).update(last_activity=now)

        return (session.user, token)
```

---

### 4.3 Nuevos Endpoints de Sesiones

#### `GET /api/auth/sessions/`

Lista todas las sesiones activas del usuario autenticado.

**Autenticación:** Requerida.

**Response (200):**
```json
{
  "sessions": [
    {
      "id": 1,
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
      "ipAddress": "189.154.104.105",
      "createdAt": "2026-02-20T10:00:00Z",
      "lastActivity": "2026-02-22T15:30:00Z",
      "isCurrent": true
    },
    {
      "id": 2,
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1",
      "ipAddress": "172.226.122.20",
      "createdAt": "2026-02-19T08:00:00Z",
      "lastActivity": "2026-02-21T22:10:00Z",
      "isCurrent": false
    }
  ]
}
```

`isCurrent` se determina comparando el `jti` del token del request con el `jti` de cada sesión.

**Implementación:**
```python
def get_sessions(request):
    current_jti = get_jti_from_request(request)
    sessions = UserSession.objects.filter(user=request.user, is_active=True)
    return Response({
        'sessions': [
            {
                'id': s.id,
                'userAgent': s.user_agent,
                'ipAddress': s.ip_address,
                'createdAt': s.created_at.isoformat(),
                'lastActivity': s.last_activity.isoformat(),
                'isCurrent': s.jti == current_jti,
            }
            for s in sessions
        ]
    })
```

---

#### `DELETE /api/auth/sessions/{session_id}/`

Cierra sesión en un dispositivo específico (revoca el token de esa sesión).
No se puede cerrar la sesión actual con este endpoint (devuelve 400 si intenta hacerlo).

**Autenticación:** Requerida.

**Response (200):**
```json
{ "success": true }
```

**Errores:**
- `400`: `{ "detail": "No puedes cerrar tu sesión actual con este endpoint.", "code": "CANNOT_REVOKE_CURRENT" }`
- `403`: Sesión no pertenece al usuario
- `404`: Sesión no encontrada

```python
def revoke_session(request, session_id):
    current_jti = get_jti_from_request(request)
    session = get_object_or_404(UserSession, pk=session_id, user=request.user, is_active=True)

    if session.jti == current_jti:
        return Response({'detail': 'No puedes cerrar tu sesión actual.', 'code': 'CANNOT_REVOKE_CURRENT'}, status=400)

    session.is_active = False
    session.save(update_fields=['is_active'])
    return Response({'success': True})
```

---

#### `DELETE /api/auth/sessions/others/`

Cierra sesión en todos los demás dispositivos (mantiene solo la sesión actual activa).

**Autenticación:** Requerida.

**Response (200):**
```json
{ "success": true, "revokedCount": 3 }
```

```python
def revoke_other_sessions(request):
    current_jti = get_jti_from_request(request)
    revoked = UserSession.objects.filter(
        user=request.user, is_active=True
    ).exclude(jti=current_jti).update(is_active=False)
    return Response({'success': True, 'revokedCount': revoked})
```

---

### 4.4 Limpiar sesiones expiradas

Tarea periódica (Celery beat o cron) para eliminar sesiones cuyo JWT ya expiró:

```python
# tasks.py (Celery)
from datetime import timedelta
from django.utils import timezone

@shared_task
def cleanup_expired_sessions():
    expiry_threshold = timezone.now() - timedelta(days=7)  # Duración del JWT
    deleted, _ = UserSession.objects.filter(
        created_at__lt=expiry_threshold
    ).delete()
    return f"Deleted {deleted} expired sessions"
```

O simplemente filtrar con `is_active=True` en los queries y dejar que el middleware invalide automáticamente los de JWT expirado.

---

## 5. Resumen de todos los endpoints nuevos/modificados

### Nuevos (10)

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| `GET` | `/api/v1/system/config/` | Opcional | Config efectiva del sistema (con filtro IP whitelist) |
| `GET` | `/api/v1/system/config/public/` | No | Igual pero solo alertas públicas (para polling no autenticado) |
| `PUT` | `/api/v1/system/config/` | Admin/Staff | Actualizar configuración del sistema |
| `GET` | `/api/v1/events/stream/` | Requerida | SSE en tiempo real para usuarios autenticados |
| `POST` | `/api/v1/system/alerts/` | Admin/Staff | Crear alerta configurable |
| `PUT` | `/api/v1/system/alerts/{id}/` | Admin/Staff | Editar alerta |
| `DELETE` | `/api/v1/system/alerts/{id}/` | Admin/Staff | Eliminar alerta |
| `GET` | `/api/auth/sessions/` | Requerida | Listar sesiones activas del usuario |
| `DELETE` | `/api/auth/sessions/{id}/` | Requerida | Revocar sesión específica |
| `DELETE` | `/api/auth/sessions/others/` | Requerida | Revocar todas las sesiones excepto la actual |

### Modificados (8)

| Método | Endpoint | Cambio |
|--------|----------|--------|
| `POST` | `/api/auth/login` | Response incluye `restrictions` en user + crea `UserSession` + incluye `jti` en JWT |
| `GET` | `/api/auth/me` | Response incluye `restrictions` en user |
| `PUT` | `/api/auth/profile` | Valida restricciones `canChangeName`, `canChangeEmail`, `canChangeSemester`, `canChangeCareer` |
| `PUT` | `/api/auth/password` | Valida restricción `canChangePassword` |
| `POST` | `/api/auth/avatar` | Valida restricción `canChangeAvatar` |
| `POST` | `/api/conversations` | Valida restricción `canCreateChats` + acepta/devuelve `modelUsed` |
| `PUT` | `/api/conversations/{id}` | Valida restricción `canEditChatOptions` + acepta/devuelve `modelUsed` |
| `GET` | `/api/conversations`, `GET /api/conversations/{id}` | Devuelve `modelUsed` en cada conversación |

---

## 6. Nuevas tablas de Base de Datos (resumen)

| Tabla | Descripción |
|-------|-------------|
| `system_config` | Fila única con configuración del sistema |
| `system_alert` | Alertas configurables con fechas y targets |
| `alert_translation` | Traducciones de alertas por idioma |
| `language` | Tabla de idiomas soportados |
| `user_restrictions` | Restricciones por usuario |
| `user_session` | Sesiones activas por usuario |

### Modificación a tabla existente

```sql
-- conversations
ALTER TABLE conversations ADD COLUMN model_used VARCHAR(50) NULL DEFAULT 'auto';

-- users (si no está ya)
ALTER TABLE users ADD COLUMN is_suspended BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN suspended_until TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN suspension_reason TEXT NULL;
```

---

## 7. Cambio en JWT — Agregar `jti`

> **Importante:** Los tokens existentes sin `jti` serán rechazados por el nuevo middleware.
> Si hay usuarios con sesión activa al momento del deploy, su token va a fallar en la primera request
> que pase por el middleware de sesiones.
>
> **Estrategia de migración:**
> - Opción A: Hacer el check de `jti` opcional durante X días → después obligatorio.
> - Opción B: Invalidar todos los tokens actuales al hacer deploy (todos los usuarios vuelven a iniciar sesión).
> - Opción B es más simple y segura.

---

## 8. Checklist de Implementación

### Fase 1 — Configuración del Sistema
- [ ] Crear modelo `SystemConfig` con migración
- [ ] Crear migración que inserta la fila inicial (singleton)
- [ ] Implementar `GET /api/v1/system/config/` con lógica de IP whitelist
- [ ] Conectar Django Admin para editar `SystemConfig`
- [ ] Configurar Redis para Pub/Sub
- [ ] Implementar `GET /api/v1/events/stream/` (SSE autenticado)
- [ ] Implementar signals `post_save` en `SystemConfig` para broadcast vía Redis
- [ ] Configurar Nginx para SSE (`proxy_buffering off`)
- [ ] Probar broadcast de mantenimiento en tiempo real

### Fase 2 — Sistema de Alertas
- [ ] Crear modelos `Language`, `SystemAlert`, `AlertTranslation` con migraciones
- [ ] Insertar idiomas iniciales (`es`, `en`)
- [ ] Agregar `SystemAlert` al filtro de `GET /api/v1/system/config/`
- [ ] Implementar endpoints de alertas (POST, PUT, DELETE)
- [ ] Implementar broadcast SSE al crear/modificar/eliminar alertas
- [ ] Configurar Django Admin con inline de `AlertTranslation`

### Fase 3 — Restricciones por Usuario
- [ ] Crear modelo `UserRestrictions` con migración
- [ ] Crear signal `post_save` en User para crear `UserRestrictions` automáticamente
- [ ] Ejecutar migración y crear `UserRestrictions` para usuarios existentes: `python manage.py shell -c "from myapp.models import UserRestrictions; [UserRestrictions.objects.get_or_create(user=u) for u in User.objects.all()]"`
- [ ] Agregar `restrictions` al serializer de User
- [ ] Actualizar respuesta de `POST /api/auth/login` y `GET /api/auth/me`
- [ ] Agregar validación de restricciones en los endpoints indicados
- [ ] Implementar signal `post_save` en `UserRestrictions` para push SSE
- [ ] Probar desde Django Admin que las restricciones se aplican y llegan en tiempo real

### Fase 4 — Sesiones Activas
- [ ] Agregar claim `jti` a la generación de JWT
- [ ] Crear modelo `UserSession` con migración
- [ ] Crear sesión en `POST /api/auth/login`
- [ ] Actualizar middleware de autenticación para verificar `jti` en `UserSession`
- [ ] Actualizar `last_activity` en cada request autenticado (throttled)
- [ ] Implementar `GET /api/auth/sessions/`
- [ ] Implementar `DELETE /api/auth/sessions/{id}/`
- [ ] Implementar `DELETE /api/auth/sessions/others/`
- [ ] Crear tarea periódica para limpiar sesiones expiradas
- [ ] Decidir estrategia de migración de tokens existentes (ver sección 7)

### Fase 5 — Modelo de IA por Chat
- [ ] Agregar columna `model_used` a `conversations`
- [ ] Actualizar serializers de conversación para incluir `modelUsed`
- [ ] Actualizar endpoints `POST /api/conversations` y `PUT /api/conversations/{id}` para aceptar `modelUsed`
- [ ] Verificar que `POST /api/v1/chat/` usa solo el `model` del request body (no un modelo global de usuario)
- [ ] Aplicar restricción de modelo en `/api/v1/chat/` si `can_change_model = false`

---

*Generado a partir del análisis de la refactorización frontend — Tec Bot v1.1+*
