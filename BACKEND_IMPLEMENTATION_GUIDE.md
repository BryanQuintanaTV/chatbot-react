# Guía de Implementación del Backend - Sistema de Autenticación

## 📋 Resumen

El frontend ya está completamente preparado para conectarse al backend. Solo necesitas:
1. Implementar los endpoints listados abajo
2. Cambiar `USE_DUMMY_DATA = false` en `frontend/src/services/api.js`
3. Actualizar `API_BASE_URL` con la URL de tu backend

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
- 400: User already exists
- 422: Validation error

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
- 401: Invalid credentials
- 422: Validation error

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
Password: password123
```

Cuando implementes el backend, crea esta cuenta para testing.

---

## 🚀 Checklist de Implementación

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
- [ ] Cambiar `USE_DUMMY_DATA = false` en frontend
- [ ] Actualizar `API_BASE_URL` en frontend
- [ ] Probar flujo completo de autenticación

---

## 💡 Notas Importantes

1. **CORS**: Asegúrate de configurar CORS en tu backend para permitir requests desde el frontend
2. **HTTPS**: En producción, usa HTTPS para todas las comunicaciones
3. **Rate Limiting**: Implementa rate limiting en los endpoints de auth para prevenir ataques de fuerza bruta
4. **Email Validation**: Valida que el email termine en `@chihuahua2.tecnm.mx`
5. **Password Strength**: Implementa validación de fuerza de contraseña (mínimo 8 caracteres)

---

## 📞 Soporte

Si tienes dudas sobre la implementación, revisa:
- Frontend: `frontend/src/services/api.js` - Muestra exactamente cómo el frontend hace las llamadas
- AuthContext: `frontend/src/contexts/AuthContext.jsx` - Muestra cómo se usa la API
