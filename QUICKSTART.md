# 🚀 Mora Comercial - Guía de Inicio Rápido

**Status**: ✅ **PROYECTO FUNCIONAL**

## Stack Tecnológico

- **Backend**: FastAPI + Python 3.12 + SQLModel
- **Frontend**: React + Vite + TypeScript
- **Database**: SQLite
- **Autenticación**: JWT (HS256)
- **RBAC**: Roles (ADMIN, COMERCIAL)
- **Auditoría**: Audit logging para operaciones mutativas

## Requisitos

- Python 3.10+
- Node.js 18+
- bash (para usar el script de inicio)

## Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```bash
cd /ruta/al/proyecto
./start.sh
```

Esto inicia:
- Backend en `http://localhost:8000`
- Frontend en `http://localhost:8080`

### Opción 2: Inicio Manual

**Terminal 1 - Backend:**
```bash
cd /ruta/al/proyecto
export PYTHONPATH=.
export SECRET_KEY="tu_clave_secreta"
python scripts/init_db.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /ruta/al/proyecto/app/brick-catalog-pro-main
npm install  # Si es la primera vez
npm run dev
```

## URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-----------|
| Frontend | http://localhost:8080 | Aplicación React |
| API | http://localhost:8000 | Backend FastAPI |
| API Docs | http://localhost:8000/docs | Swagger/OpenAPI |
| API ReDoc | http://localhost:8000/redoc | ReDoc Docs |

## Credenciales por Defecto

```
Email:    admin@example.com
Password: AdminPass123
Rol:      ADMIN
```

> 🔐 **Cambiar en producción** en `app/core/config.py`

## Pruebas de API

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -F "username=admin@example.com" \
  -F "password=AdminPass123"
```

Respuesta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "nombre": "Admin User",
    "email": "admin@example.com",
    "rol": "ADMIN",
    "activo": true
  }
}
```

### Usar Token en Peticiones Protegidas

```bash
TOKEN="<access_token_from_login>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/usuarios/me
```

### Listar Artículos

```bash
curl http://localhost:8000/api/v1/articulos/
```

## Estructura del Proyecto

```
mora-comercial-api/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/        # Endpoints (auth, user, articulo, etc.)
│   │   └── api.py            # Router principal
│   ├── crud/                 # CRUD operations
│   ├── models/               # SQLModel definitions
│   ├── db/                   # Database session & initialization
│   ├── services/             # Business logic
│   ├── core/
│   │   ├── config.py         # Configuración (SECRET_KEY, roles, etc.)
│   │   ├── security.py       # JWT, password hashing, auth
│   │   └── rate_limiting.py  # Rate limiting config
│   ├── main.py               # FastAPI app factory
│   └── brick-catalog-pro-main/  # Frontend React+Vite
├── scripts/
│   ├── init_db.py            # Script de inicialización
│   ├── api-calls.sh          # Ejemplos de curl
│   └── mora-comercial-api.postman_collection.json
├── tests/
│   └── test_audit_and_auth.py  # Test suite
├── start.sh                  # Script de inicio
├── README.md                 # Este archivo
└── mora_comercial.db         # Database (auto-creada)
```

## Variables de Entorno

Crear `.env` o exportar:

```bash
export SECRET_KEY="tu_clave_secreta_muy_larga"
export ALGORITHM="HS256"
export ACCESS_TOKEN_EXPIRE_MINUTES="60"
export TESTING="0"  # 0=producción, 1=testing (desactiva rate limiting)
```

## Funcionalidades Implementadas

### Autenticación & Autorización ✅
- [x] Login con email/password
- [x] JWT tokens (60 min por defecto)
- [x] Refresh token
- [x] Password hashing (pbkdf2_sha256)
- [x] Email validation
- [x] RBAC (ADMIN/COMERCIAL)

### Auditoría ✅
- [x] Audit logs para create/update/delete users
- [x] Registro automático de actor y timestamp
- [x] Historial de cambios

### Gestión de Usuarios ✅
- [x] CRUD de usuarios (solo ADMIN)
- [x] Cambio de contraseña
- [x] Perfil de usuario autenticado

### API ✅
- [x] Artículos (catalogo)
- [x] Clientes
- [x] Presupuestos
- [x] Líneas de presupuesto
- [x] CORS habilitado
- [x] Validación de datos con Pydantic

### Rate Limiting ⚠️
- [x] Configuración definida (login 5/min, create_user 10/hora, etc.)
- ⚠️ Decorators actualmentemente deshabilitados (slowapi incompatible con FastAPI)
- [ ] Implementación futura con middleware global

### Testing ✅
- [x] 8 tests pasando para auth, audit y RBAC
- [x] Test suite con `pytest`
- [x] Ejecución: `TESTING=1 pytest tests/`

## Próximos Pasos

1. **Rate Limiting**: Implementar con middleware global en lugar de decoradores
2. **Frontend**: Conectar login y autenticación con Redux/Zustand
3. **Producción**: Cambiar `SECRET_KEY`, configurar HTTPS, WAF
4. **CI/CD**: GitHub Actions para tests y deploy
5. **Docker**: Containerizar backend y frontend

## Troubleshooting

### Puerto 8000 en uso
```bash
lsof -i :8000
kill -9 <PID>
```

### Base de datos corrupta
```bash
rm mora_comercial.db
python scripts/init_db.py
```

### Node modules faltando
```bash
cd app/brick-catalog-pro-main
npm install
```

### Cambios no se reflejan
- Backend: El `--reload` debería detectar cambios automáticamente
- Frontend: Presionar `Ctrl+C` y reejecutar `npm run dev`

## Deployment

Ver `.github/copilot-instructions.md` para detalles de seguridad y despliegue en producción.

## Soporte

Para preguntas o issues, ver la documentación en `docs/` o crear un issue en GitHub.

---

**Última actualización**: Diciembre 5, 2025
**Versión**: 1.0.0
**Estado**: 🟢 Production Ready (Auth & API)
