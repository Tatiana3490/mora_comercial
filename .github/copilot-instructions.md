**Flujo de Autenticación (Resumen)**

- **Endpoints principales**:
  - `POST /api/v1/auth/login` — Login con `OAuth2PasswordRequestForm` (username=email, password). Respuesta: `{ access_token, token_type: "bearer", user }`.
  - `POST /api/v1/auth/refresh-token` — Refresca el token. Requiere Authorization: `Bearer <token>`.
  - `GET  /api/v1/usuarios/me` — Obtener perfil del usuario autenticado.

- **Formato del token**:
  - JWT firmado con HS256.
  - Payload incluye `sub` (email) y `exp` (expiración).
  - Configuración en `app/core/config.py`: `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`.

- **Cómo se crea/verifica el token**:
  - `app/core/security.py` contiene `create_access_token(subject, expires_delta)` y `get_current_user` (dependencia para proteger endpoints).
  - En tests se usa `create_access_token(subject=email)` para generar tokens válidos.

- **Roles y autorización**:
  - Roles principales: `ADMIN`, `COMERCIAL`.
  - Operaciones restringidas a `ADMIN`: creación y eliminación de usuarios, listado de audit logs.

- **Auditoría (Audit logs)**:
  - Operaciones mutativas (`create_user`, `update_user`, `delete_user`) escriben registros en la tabla `AuditLog`.
  - CRUD de auditoría en `app/crud/audit_crud.py` y endpoints en `app/api/v1/endpoints/audit.py` (solo ADMIN).

- **Rate limiting**:
  - Implementado con `slowapi` en `app/core/rate_limiting.py`.
  - Políticas por defecto (ajustables):
    - `login`: `5/minute`
    - `refresh`: `10/minute`
    - `create_user`: `10/hour`
    - `delete_user`: `5/hour`
  - En el entorno de test se desactiva la limitación mediante la variable de entorno `TESTING=1`.

**Ejemplos de uso**

- Login (form-data OAuth2):

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -F "username=admin@example.com" \
  -F "password=AdminPass123"
```

- Usar token en peticiones protegidas:

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  http://localhost:8000/api/v1/usuarios/me
```

**Variables de entorno relevantes**

- `SECRET_KEY` — clave secreta para firmar JWT (mantener privada).
- `ALGORITHM` — algoritmo JWT (por defecto `HS256`).
- `ACCESS_TOKEN_EXPIRE_MINUTES` — duración del access token.
- `TESTING` — si está a `1`, se desactiva rate limiting para permitir ejecuciones de test deterministas.

**Ejecución local / pruebas**

- Ejecutar la aplicación (desarrollo):

```bash
# en bash
export SECRET_KEY="tu_clave_secreta"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Ejecutar tests (desactivando rate limiting):

```bash
export TESTING=1
export PYTHONPATH=.
pytest -q tests/test_audit_and_auth.py
```

**Notas de seguridad y despliegue**

- Mantener `SECRET_KEY` fuera del repositorio (use vault/secret manager).
- Ajustar límites de rate limiting según patrones de tráfico y WAF.
- Revisar logs de auditoría periódicamente y exportarlos a un sistema centralizado (SIEM) en producción.

Si querés, puedo añadir ejemplos automatizados (scripts `curl` o Postman collection) o ampliar la sección de despliegue (Docker/CI/CD).
