# Guía de Implementación del Backend - Tec Bot Chatbot

## 📋 Resumen

El frontend ya está completamente preparado para conectarse al backend. Solo necesitas:
1. Implementar los endpoints listados abajo
2. Cambiar `USE_DUMMY_DATA = false` en `frontend/src/services/api.js`
3. Actualizar `API_BASE_URL` con la URL de tu backend

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                    │
│  - Login/Register/Settings                              │
│  - ChatPage con historial                               │
│  - Sistema de reportes                                  │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS (apichat.bryanquintana.com)
┌──────────────────▼──────────────────────────────────────┐
│              DJANGO REST API                            │
│  - Autenticación JWT                                    │
│  - Endpoints de chat (SSE streaming)                    │
│  - Sistema de reportes                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│         OLLAMA (LLM Engine) + ChromaDB (RAG)           │
│  - Modelo: Llama 3.1 8B (cuantizado Q4)                │
│  - Vector DB: ChromaDB para documentos TECNM           │
│  - Embeddings: sentence-transformers                    │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              POSTGRESQL DATABASE                        │
│  - users, conversations, messages                       │
│  - reports, message_logs                                │
└─────────────────────────────────────────────────────────┘
```

### Componentes Clave

- **LLM**: Llama 3.1 8B ejecutándose en Ollama (local)
- **RAG**: ChromaDB con embeddings multilingües para documentos del TECNM
- **Backend**: Django + DRF con streaming SSE
- **BD**: PostgreSQL para persistencia
- **Auth**: JWT con tokens de 7 días

## 🔑 Endpoints Requeridos

### 1. POST `/api/auth/register`
Registrar un nuevo usuario.

**Request Body:**
```json
{
  "email": "user@chihuahua2.tecnm.mx",
  "password": "password123",
  "name": "Juan Pérez"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@chihuahua2.tecnm.mx",
    "name": "Juan Pérez",
    "semester": null,
    "career": null,
    "avatar": null,
    "profileComplete": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- 400: `{ "detail": "auth.emailAlreadyExists", "code": "EMAIL_EXISTS" }`
- 400: `{ "detail": "auth.passwordTooWeak", "code": "WEAK_PASSWORD" }`
- 422: Validation error

**Nota:** El frontend espera errores con `detail` como translation key (ejemplo: "auth.emailAlreadyExists") para mostrar mensajes traducidos al usuario.

---

### 2. POST `/api/auth/login`
Iniciar sesión.

**Request Body:**
```json
{
  "email": "user@chihuahua2.tecnm.mx",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@chihuahua2.tecnm.mx",
    "name": "Juan Pérez",
    "semester": "5",
    "career": "ingenieria-sistemas-computacionales",
    "avatar": "avatar1",
    "profileComplete": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- 401: `{ "detail": "auth.invalidCredentials", "code": "INVALID_PASSWORD" }` - Cuando la contraseña es incorrecta
- 404: `{ "detail": "auth.accountNotFound", "code": "ACCOUNT_NOT_FOUND" }` - Cuando no existe una cuenta con ese email
- 422: Validation error

**Nota:** El frontend distingue entre cuenta no encontrada y contraseña incorrecta para dar feedback específico al usuario.

---

### 3. GET `/api/auth/me`
Obtener datos del usuario actual (requiere autenticación).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@chihuahua2.tecnm.mx",
  "name": "Juan Pérez",
  "semester": "5",
  "career": "ingenieria-sistemas-computacionales",
  "avatar": "avatar1",
  "profileComplete": true
}
```

**Errores:**
- 401: Invalid or expired token

---

### 4. PUT `/api/auth/profile`
Actualizar perfil del usuario.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "Juan Pérez González",
  "semester": "6",
  "career": "ingenieria-sistemas-computacionales",
  "avatar": "avatar2"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@chihuahua2.tecnm.mx",
  "name": "Juan Pérez González",
  "semester": "6",
  "career": "ingenieria-sistemas-computacionales",
  "avatar": "avatar2",
  "profileComplete": true
}
```

**Errores:**
- 401: Unauthorized
- 422: Validation error

---

### 5. PUT `/api/auth/password`
Cambiar contraseña.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Errores:**
- 401: Unauthorized or incorrect current password
- 422: Validation error

---

### 6. DELETE `/api/auth/account`
Eliminar cuenta del usuario.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true
}
```

**Errores:**
- 401: Unauthorized

---

### 7. POST `/api/reports/general`
Enviar un reporte general de error o sugerencia.

**Request Body:**
```json
{
  "category": "bug",
  "title": "El botón de guardar no funciona",
  "description": "Al intentar guardar la configuración, el botón no responde y no se guardan los cambios.",
  "date": "2024-11-13T18:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "url": "https://tec-bot.com/settings"
}
```

**Campos:**
- `category` (string, required): Tipo de reporte. Valores: "bug", "feature", "ui", "performance", "other"
- `title` (string, required): Título breve del reporte (max 100 caracteres)
- `description` (string, required): Descripción detallada del problema
- `date` (ISO string, required): Fecha y hora del reporte
- `userAgent` (string, required): User agent del navegador
- `url` (string, required): URL donde ocurrió el problema

**Response (200):**
```json
{
  "success": true,
  "reportId": "uuid"
}
```

**Errores:**
- 400: Validation error (missing fields, invalid category)
- 422: Validation error

**Notas:**
- Este endpoint NO requiere autenticación (permite reportes de usuarios no registrados)
- Los reportes deben guardarse en base de datos para revisión posterior
- Se recomienda incluir rate limiting (ej: 10 reportes por IP por hora)

---

### 8. POST `/api/v1/chat/` (Streaming SSE)
Endpoint principal del chatbot con LLM + RAG.

**Request Body:**
```json
{
  "message": "¿Cuál es el proceso para solicitar residencia profesional?",
  "conversation_id": "uuid-opcional"
}
```

**Headers (Opcional - si usuario autenticado):**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Streaming SSE):**
```
data: El
data:  proceso
data:  para
data:  solicitar
data:  residencia
data:  profesional
data:  es
data: ...
data:    [DONE]
```

**Flujo del Sistema:**
1. Recibir mensaje del usuario
2. Si está autenticado, obtener conversación o crear nueva
3. Buscar documentos relevantes en ChromaDB (RAG)
4. Construir prompt del sistema con contexto del usuario
5. Llamar a Ollama con streaming
6. Enviar respuesta carácter por carácter via SSE
7. Guardar mensaje en BD al completar

**Contexto del Usuario (si autenticado):**
```json
{
  "name": "Juan Pérez",
  "semester": "5",
  "career": "ingenieria-sistemas-computacionales",
  "escuela": "ITCH_II"
}
```

**Ejemplo de Prompt al LLM:**
```
Eres un asistente virtual del ITCH II (Tecnológico Nacional de México).

Información del estudiante:
- Nombre: Juan Pérez
- Semestre: 5
- Carrera: Ingeniería en Sistemas Computacionales
- Escuela: ITCH_II

DOCUMENTOS DE REFERENCIA:
[Documento 1] reglamento_escolar.pdf:
La residencia profesional es una actividad académica que el estudiante...
--------------------------------------------------
[Documento 2] lineamientos_residencia.pdf:
Requisitos: 1) Haber cubierto el 70% de créditos...
--------------------------------------------------

Usuario: ¿Cuál es el proceso para solicitar residencia profesional?
```

**Tecnologías Usadas:**
- **Ollama**: LLM Engine local (modelo: `llama3.1:8b-instruct-q4_K_M`)
- **ChromaDB**: Vector database para RAG
- **sentence-transformers**: Embeddings (`paraphrase-multilingual-MiniLM-L12-v2`)

**Notas:**
- El endpoint debe soportar SSE (Server-Sent Events)
- No usar buffering en Nginx/Gunicorn
- Rate limiting: 30 mensajes por minuto por usuario
- Timeout: 30 segundos máximo

---

## 🔐 Implementación de JWT

### Estructura del Token
```javascript
{
  "sub": "user@chihuahua2.tecnm.mx",  // Email del usuario
  "exp": 1735689600,                  // Timestamp de expiración
  "iat": 1735603200                   // Timestamp de creación
}
```

### Duración Recomendada
- Access Token: 7 días (604800 segundos)

### Secret Key
Usa una clave secreta fuerte. Ejemplo en Python:
```python
import secrets
SECRET_KEY = secrets.token_urlsafe(32)
```

---

## 🗄️ Modelo de Base de Datos

### Tabla: users

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| semester | VARCHAR(10) | NULLABLE |
| career | VARCHAR(100) | NULLABLE |
| avatar | VARCHAR(50) | NULLABLE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### Índices
- `idx_email`: Índice único en `email`

---

## 🔒 Seguridad

### Hashing de Contraseñas
**Python (con bcrypt):**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash password
hashed = pwd_context.hash(password)

# Verify password
is_valid = pwd_context.verify(plain_password, hashed)
```

**Node.js (con bcrypt):**
```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hash password
const hash = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hash);
```

---

## 📦 Dependencias Recomendadas

### Python (FastAPI)
```bash
pip install fastapi[all] python-jose[cryptography] passlib[bcrypt] python-multipart
```

### Node.js (Express)
```bash
npm install express jsonwebtoken bcrypt dotenv
```

---

## 🧪 Testing

### Cuenta de Prueba (Dummy Data Actual)
```
Email: test@chihuahua2.tecnm.mx
Password: Password123!
```

**Nota:** La contraseña ahora requiere ser fuerte (mayúsculas, minúsculas, números y símbolos).

---

## 🔐 Validación de Contraseñas

### Requisitos de Contraseña Fuerte

El frontend valida que las contraseñas cumplan con los siguientes requisitos:

1. **Longitud mínima**: 8 caracteres
2. **Mayúsculas**: Al menos una letra mayúscula (A-Z)
3. **Minúsculas**: Al menos una letra minúscula (a-z)
4. **Números**: Al menos un dígito (0-9)
5. **Símbolos**: Al menos un carácter especial (!@#$%^&*(),.?":{}|<>)

### Implementación Backend

**Python (FastAPI):**
```python
import re

def validate_password_strength(password: str) -> bool:
    """
    Valida que la contraseña cumpla con los requisitos de seguridad.
    Retorna True si es válida, False si no.
    """
    if len(password) < 8:
        return False

    has_uppercase = bool(re.search(r'[A-Z]', password))
    has_lowercase = bool(re.search(r'[a-z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_special = bool(re.search(r'[^A-Za-z0-9]', password))

    return all([has_uppercase, has_lowercase, has_digit, has_special])

# En tu endpoint de registro:
if not validate_password_strength(password):
    raise HTTPException(
        status_code=400,
        detail="auth.passwordTooWeak",
        headers={"code": "WEAK_PASSWORD"}
    )
```

**Node.js (Express):**
```javascript
function validatePasswordStrength(password) {
  if (password.length < 8) return false;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return hasUppercase && hasLowercase && hasDigit && hasSpecial;
}

// En tu ruta de registro:
if (!validatePasswordStrength(password)) {
  return res.status(400).json({
    detail: "auth.passwordTooWeak",
    code: "WEAK_PASSWORD"
  });
}
```

---

## ⚠️ Códigos de Error Específicos

El frontend está preparado para manejar errores específicos con translation keys. Asegúrate de retornar estos códigos en tus respuestas de error:

### Errores de Autenticación

| Código | Translation Key | HTTP Status | Descripción |
|--------|----------------|-------------|-------------|
| `ACCOUNT_NOT_FOUND` | `auth.accountNotFound` | 404 | No existe cuenta con ese email |
| `INVALID_PASSWORD` | `auth.invalidCredentials` | 401 | La contraseña es incorrecta |
| `EMAIL_EXISTS` | `auth.emailAlreadyExists` | 400 | Ya existe una cuenta con ese email |
| `WEAK_PASSWORD` | `auth.passwordTooWeak` | 400 | La contraseña no cumple requisitos de seguridad |

### Formato de Respuesta de Error

```json
{
  "detail": "auth.accountNotFound",
  "code": "ACCOUNT_NOT_FOUND"
}
```

El frontend usa el campo `detail` como translation key. Si `detail` empieza con "auth.", automáticamente lo traduce al idioma del usuario.

### Ejemplos de Implementación

**Python (FastAPI):**
```python
# Usuario no encontrado
raise HTTPException(
    status_code=404,
    detail="auth.accountNotFound",
    headers={"code": "ACCOUNT_NOT_FOUND"}
)

# Contraseña incorrecta
raise HTTPException(
    status_code=401,
    detail="auth.invalidCredentials",
    headers={"code": "INVALID_PASSWORD"}
)
```

**Node.js (Express):**
```javascript
// Usuario no encontrado
return res.status(404).json({
  detail: "auth.accountNotFound",
  code: "ACCOUNT_NOT_FOUND"
});

// Contraseña incorrecta
return res.status(401).json({
  detail: "auth.invalidCredentials",
  code: "INVALID_PASSWORD"
});
```

---

## 🗄️ Modelo de Base de Datos - Reportes

### Tabla: general_reports

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | UUID | PRIMARY KEY |
| category | VARCHAR(50) | NOT NULL |
| title | VARCHAR(100) | NOT NULL |
| description | TEXT | NOT NULL |
| date | TIMESTAMP | NOT NULL |
| user_agent | TEXT | NOT NULL |
| url | VARCHAR(500) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| status | VARCHAR(50) | DEFAULT 'pending' |

### Índices
- `idx_category`: Índice en `category`
- `idx_status`: Índice en `status`
- `idx_created_at`: Índice en `created_at`

### Valores de status
- `pending`: Reporte pendiente de revisión
- `reviewing`: Reporte en revisión
- `resolved`: Reporte resuelto
- `closed`: Reporte cerrado sin acción

---

## 🚀 Checklist de Implementación

### Autenticación
- [ ] Instalar dependencias necesarias
- [ ] Crear modelo de base de datos para usuarios
- [ ] Implementar hashing de contraseñas
- [ ] Implementar generación y validación de JWT
- [ ] Crear endpoint POST `/api/auth/register`
- [ ] Crear endpoint POST `/api/auth/login`
- [ ] Crear endpoint GET `/api/auth/me`
- [ ] Crear endpoint PUT `/api/auth/profile`
- [ ] Crear endpoint PUT `/api/auth/password`
- [ ] Crear endpoint DELETE `/api/auth/account`
- [ ] Agregar middleware de autenticación
- [ ] Probar todos los endpoints con Postman/Thunder Client

### Reportes
- [ ] Crear modelo de base de datos para reportes generales
- [ ] Crear endpoint POST `/api/reports/general`
- [ ] Implementar validación de campos
- [ ] Agregar rate limiting por IP
- [ ] Probar endpoint con Postman/Thunder Client

### Integración Frontend
- [ ] Cambiar `USE_DUMMY_DATA = false` en frontend
- [ ] Actualizar `API_BASE_URL` en frontend
- [ ] Probar flujo completo de autenticación
- [ ] Probar envío de reportes generales

### Ollama + RAG
- [ ] Instalar Ollama en servidor
- [ ] Descargar modelo `llama3.1:8b-instruct-q4_K_M`
- [ ] Instalar ChromaDB
- [ ] Instalar sentence-transformers
- [ ] Cargar documentos del TECNM en ChromaDB
- [ ] Implementar servicio de RAG
- [ ] Implementar servicio de LLM
- [ ] Integrar RAG + LLM en endpoint de chat
- [ ] Probar streaming SSE
- [ ] Optimizar prompts del sistema

---

## 🤖 Configuración de Ollama

### Instalación

```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Descargar modelo Llama 3.1 8B (cuantizado Q4)
ollama pull llama3.1:8b-instruct-q4_K_M

# Verificar instalación
ollama list
```

### Uso en Python

```python
import ollama

# Cliente de Ollama
client = ollama.Client()

# Generar respuesta con streaming
stream = client.chat(
    model='llama3.1:8b-instruct-q4_K_M',
    messages=[
        {'role': 'system', 'content': 'Eres un asistente del TECNM...'},
        {'role': 'user', 'content': '¿Qué es la residencia profesional?'}
    ],
    stream=True
)

for chunk in stream:
    print(chunk['message']['content'], end='')
```

### Recursos Requeridos

- **RAM**: 5-6 GB durante inferencia
- **Disco**: 5 GB para el modelo
- **CPU**: 4+ cores recomendado
- **Latencia**: 1-3 segundos por respuesta (dependiendo del hardware)

---

## 🔍 Configuración de ChromaDB (RAG)

### Instalación

```bash
pip install chromadb sentence-transformers
```

### Estructura de Documentos

```
documents/
└── ITCH_II/
    ├── reglamentos/
    │   ├── reglamento_escolar.pdf
    │   └── lineamientos_titulacion.pdf
    ├── calendarios/
    │   └── calendario_2024_2025.pdf
    ├── horarios/
    │   └── sistemas_semestre_5.json
    └── planes_estudio/
        └── ingenieria_sistemas.pdf
```

### Uso Básico

```python
import chromadb
from sentence_transformers import SentenceTransformer

# Inicializar ChromaDB
client = chromadb.PersistentClient(path="./chromadb_data")

# Modelo de embeddings (multilingüe)
embedding_model = SentenceTransformer(
    'paraphrase-multilingual-MiniLM-L12-v2'
)

# Crear colección
collection = client.get_or_create_collection(
    name="ITCH_II_reglamentos",
    embedding_function=embedding_model.encode
)

# Agregar documentos
collection.add(
    documents=["Texto del reglamento...", "Texto de lineamientos..."],
    metadatas=[{"source": "reglamento.pdf"}, {"source": "lineamientos.pdf"}],
    ids=["doc1", "doc2"]
)

# Buscar documentos relevantes
results = collection.query(
    query_texts=["¿Cómo solicitar residencia?"],
    n_results=3
)
```

### Tipos de Colecciones

- `ITCH_II_reglamentos`: Reglamentos escolares
- `ITCH_II_calendarios`: Calendarios académicos
- `ITCH_II_horarios`: Horarios de clases
- `ITCH_II_planes_estudio`: Planes de estudio

---

## 💡 Notas Importantes

1. **CORS**: Asegúrate de configurar CORS en tu backend para permitir requests desde el frontend
2. **HTTPS**: En producción, usa HTTPS para todas las comunicaciones
3. **Rate Limiting**: Implementa rate limiting en los endpoints de auth para prevenir ataques de fuerza bruta
4. **Email Validation**: Valida que el email termine en `@chihuahua2.tecnm.mx`
5. **Password Strength**: Implementa validación de fuerza de contraseña (mínimo 8 caracteres)
6. **Ollama**: Asegúrate de que Ollama esté corriendo antes de iniciar el backend (`ollama serve`)
7. **ChromaDB**: Los documentos deben cargarse antes de usar el chatbot
8. **SSE Streaming**: Deshabilita buffering en Nginx para SSE (`proxy_buffering off;`)
9. **Recursos**: Monitorea RAM (6-8GB recomendados con Ollama + Django)
10. **Multi-Escuela**: El sistema está preparado para agregar más escuelas del TECNM

---

## 📚 Dependencias del Backend

### Python (requirements.txt)

```txt
# Core
Django==4.2.4
djangorestframework==3.14.0
django-cors-headers==4.3.1
gunicorn==21.2.0

# Autenticación
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# LLM y RAG
ollama==0.4.0
chromadb==0.5.23
sentence-transformers==3.3.1
langchain==0.3.11
langchain-community==0.3.11

# Base de Datos
psycopg2-binary==2.9.9
redis==5.2.1

# Procesamiento de Documentos
pypdf==5.1.0
python-docx==1.1.2
openpyxl==3.1.5

# Utilidades
python-dotenv==1.0.1
pydantic==2.10.4
pydantic-settings==2.7.0
```

---

## 🗺️ Plan de Migración

Para el plan completo de migración del backend a Ollama + RAG, consulta el documento de planificación que incluye:

- Modelos de base de datos completos (User, Conversation, Message)
- Implementación de LLM Service con Ollama
- Implementación de RAG Service con ChromaDB
- Scripts de carga de documentos
- Configuración de Nginx para SSE
- Configuración de systemd para servicios
- Checklist de implementación por fases

**Fases Estimadas:**
1. Preparación (1 semana)
2. Base de Datos (3-5 días)
3. Autenticación (1 semana)
4. LLM Integration (1 semana)
5. RAG System (1-2 semanas)
6. Testing & Deployment (1 semana)
7. Frontend Integration (2-3 días)

**Total Estimado:** 5-7 semanas

---

## 📞 Soporte

Si tienes dudas sobre la implementación, revisa:
- Frontend: `frontend/src/services/api.js` - Muestra exactamente cómo el frontend hace las llamadas
- AuthContext: `frontend/src/contexts/AuthContext.jsx` - Muestra cómo se usa la API
- Plan de Migración: Documento compartido con arquitectura completa de Ollama + RAG
- Ollama Docs: https://ollama.com/library/llama3.1
- ChromaDB Docs: https://docs.trychroma.com/
