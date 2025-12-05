# Mora Comercial API

Backend FastAPI con autenticación JWT, auditoría y rate limiting integrados. Frontend Vite + React con catálogo de materiales.

## 🚀 Inicio Rápido

### Requisitos previos

- **Python 3.10+**
- **Node.js 18+ y npm**
- **SQLite** (incluido en Python)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Tatiana3490/mora_comercial.git
cd mora-comercial-api
```

### 2. Configurar ambiente Python

```bash
# Crear y activar virtualenv
python -m venv venv

# En bash / WSL / Git Bash (Windows):
source venv/Scripts/activate

# En PowerShell (Windows):
# & venv/Scripts/Activate.ps1

# En Linux / macOS:
# source venv/bin/activate

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

```bash
# Bash / WSL / Linux / macOS
export SECRET_KEY="tu_clave_secreta_local"
export PYTHONPATH=.

# PowerShell (Windows)
# $env:SECRET_KEY="tu_clave_secreta_local"
# $env:PYTHONPATH="."
```

### 4. Instalar dependencias del frontend

```bash
cd app/brick-catalog-pro-main
npm install
cd ../../
```

### 5. Inicializar la base de datos con usuario admin

La aplicación **crea automáticamente un usuario administrador** al arrancar si no existe.

**Credenciales por defecto:**
- Email: `admin@example.com`
- Contraseña: `AdminPass123`

Alternativamente, puedes ejecutar el script de inicialización manualmente:

```bash
# Usar credenciales por defecto
python scripts/init_db.py

# O especificar credenciales personalizadas
python scripts/init_db.py --admin-email mi.admin@empresa.com --admin-password MiPassword123
```

### 6. Ejecutar backend (desarrollo)

```bash
export SECRET_KEY="tu_clave_secreta_local"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en `http://localhost:8000`. 
- API: `http://localhost:8000/api/v1/`
- OpenAPI Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 7. Ejecutar frontend (desarrollo)

En una terminal nueva:
```bash
cd app/brick-catalog-pro-main
npm run dev
```

El frontend estará disponible en `http://localhost:5173` (o la URL que imprima la terminal).

---

## 📋 Comandos Útiles

### Pruebas de autenticación y auditoría

```bash
# Ejecutar suite de tests (8 tests)
export TESTING=1
export PYTHONPATH=.
pytest -q tests/test_audit_and_auth.py
```

### Pruebas manuales con curl

**Login con credenciales por defecto:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -F "username=admin@example.com" \
  -F "password=AdminPass123"
```

Respuesta (guardar `access_token`):
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": { "id_usuario": 1, "email": "admin@example.com", "rol": "ADMIN" }
}
```

**Obtener perfil del usuario autenticado:**
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  http://localhost:8000/api/v1/usuarios/me
```

**Crear usuario (ADMIN only):**
```bash
curl -X POST "http://localhost:8000/api/v1/usuarios/" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Comercial User",
    "email": "comercial@example.com",
    "password": "ComercialPass123",
    "rol": "COMERCIAL"
  }'
```

**Listar auditoría (ADMIN only):**
```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
  "http://localhost:8000/api/v1/audits/"
```

---

## 🔐 Flujo de Autenticación

- **Login:** `POST /api/v1/auth/login` (OAuth2 form data)
  - Parámetros: `username` (email), `password`
  - Respuesta: `access_token`, `token_type`, `user`

- **Refrescar token:** `POST /api/v1/auth/refresh-token`
  - Header: `Authorization: Bearer <current_token>`
  - Respuesta: nuevo `access_token`

- **Obtener usuario autenticado:** `GET /api/v1/usuarios/me`
  - Header: `Authorization: Bearer <token>`

**Token JWT:**
- Firmado con HS256
- Expira en `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 60 min)
- Contiene `sub` (email) y `exp` (expiración)

---

## 📊 Auditoría

Todas las operaciones mutativas (`create_user`, `update_user`, `delete_user`) generan registros en la tabla `AuditLog`:
- `action`: tipo de operación
- `actor_email`: quién realizó la acción
- `target_email`: usuario afectado (si aplica)
- `timestamp`: fecha/hora
- `details`: información adicional (IDs, etc.)

**Endpoints de auditoría (ADMIN only):**
- `GET /api/v1/audits/` — listar con filtros (actor, target, action, fecha)
- `GET /api/v1/audits/{log_id}` — obtener un registro

---

## 🗄️ Inicialización de la Base de Datos

### Usuario Administrador Automático

La aplicación **crea automáticamente un usuario administrador** en el primer arranque si no existe:

- **Email:** `admin@example.com`
- **Contraseña:** `AdminPass123`
- **Rol:** `ADMIN`

### Script de Inicialización Manual

Si prefieres inicializar manualmente o cambiar las credenciales por defecto:

```bash
# Usar credenciales por defecto
python scripts/init_db.py

# Especificar credenciales personalizadas
python scripts/init_db.py --admin-email mi.admin@empresa.com --admin-password MiPassword123

# Forzar recreación del usuario admin (overwrite)
python scripts/init_db.py --force

# Ver todas las opciones
python scripts/init_db.py --help
```

**Nota:** Las credenciales se definen en `app/core/config.py` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). También puedes cambiarlas con variables de entorno:
```bash
export ADMIN_EMAIL="custom@example.com"
export ADMIN_PASSWORD="MiPassword123"
```

---

## 🚦 Rate Limiting

Protección contra fuerza bruta en endpoints sensibles:

| Endpoint | Límite | Descripción |
|----------|--------|-------------|
| POST `/auth/login` | 5/minuto | Intentos de login |
| POST `/auth/refresh-token` | 10/minuto | Refrescos de token |
| POST `/usuarios/` | 10/hora | Creación de usuarios |
| DELETE `/usuarios/{id}` | 5/hora | Eliminación de usuarios |

**Nota:** En modo test (`TESTING=1`), el rate limiting se desactiva para pruebas deterministas.

---

## 🛠️ Estructura del Proyecto

```
mora-comercial-api/
├── app/
│   ├── main.py                 # Punto de entrada FastAPI
│   ├── core/
│   │   ├── config.py           # Configuración y settings
│   │   ├── security.py         # JWT y autenticación
│   │   └── rate_limiting.py    # Rate limiting (slowapi)
│   ├── api/
│   │   └── v1/
│   │       ├── api.py          # Router principal
│   │       └── endpoints/      # Endpoints por recurso
│   ├── crud/                   # Funciones de DB (CRUD)
│   ├── models/                 # Modelos SQLModel
│   ├── db/                     # Configuración de DB y sesión
│   ├── services/               # Servicios auxiliares (PDF, etc.)
│   ├── static/                 # Imágenes y archivos estáticos
│   └── brick-catalog-pro-main/ # Frontend Vite + React
├── scripts/
│   └── seed_db.py              # Script para popular DB
├── tests/
│   └── test_audit_and_auth.py  # Tests de autenticación y auditoría
├── requirements.txt            # Dependencias Python
└── README.md                   # Este archivo
```

---

## 🌍 Producción

### Build del frontend

```bash
cd app/brick-catalog-pro-main
npm run build
# El resultado estará en dist/
cd ../../
```

### Ejecutar backend en producción

```bash
export SECRET_KEY="<clave_secreta_fuerte>"
export ALGORITHM="HS256"
export ACCESS_TOKEN_EXPIRE_MINUTES="60"
export PYTHONPATH=.

# Con gunicorn (instalar: pip install gunicorn)
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# O con uvicorn (múltiples workers)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Consideraciones de seguridad

- **SECRET_KEY:** Usar un vault/secret manager. Nunca comprometer en el repo.
- **CORS:** Actualmente permite `*`. En producción, especificar dominios permitidos en `app/main.py`.
- **HTTPS:** Configurar SSL/TLS en un reverse proxy (nginx, Caddy) o load balancer.
- **Rate Limiting:** Ajustar según patrones de tráfico esperados.
- **Auditoría:** Exportar logs periódicamente a un sistema centralizado (SIEM).

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| `ModuleNotFoundError: No module named 'app'` | Ejecuta `export PYTHONPATH=.` o `set PYTHONPATH=.` |
| Error de conexión frontend-backend | Verifica que backend corre en `http://localhost:8000` y que CORS permite el origen del frontend |
| Tests fallan con rate limiting | Asegúrate de `export TESTING=1` antes de `pytest` |
| `SECRET_KEY not found` | Define `export SECRET_KEY="..."` antes de iniciar |
| DB no se crea | Backend intenta crear BD al startup. Si falla, revisa permisos de directorio |

---

## 📝 Próximos pasos

- [ ] Integrar Postman collection para pruebas API
- [ ] Documentar endpoints detalladamente en OpenAPI
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Deploy a staging / producción
- [ ] Metricas y monitoreo

---

## 📧 Contacto / Soporte

Para preguntas o reportar bugs, crear un issue en [GitHub Issues](https://github.com/Tatiana3490/mora_comercial/issues).

---

**Última actualización:** Diciembre 2025
