import os
import tempfile

# Set testing mode before importing the app
os.environ["TESTING"] = "1"

from fastapi.testclient import TestClient
from sqlmodel import create_engine, SQLModel, Session, select

from app.main import app as fastapi_app
from app.db.session import get_session
from app.crud import user_crud, audit_crud
from app.models.user import UserCreate
from app.models.audit import AuditLog
from app.utils.security import create_access_token

# Import all models so SQLModel knows about them
import app.models

# Create a temporary DB file for testing
_temp_db_file = None
_test_engine = None


def setup_module(module):
    global _temp_db_file, _test_engine
    # Create a temporary file for the test database
    fd, _temp_db_file = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    # Create engine for temp DB
    _test_engine = create_engine(
        f"sqlite:///{_temp_db_file}",
        connect_args={"check_same_thread": False}
    )
    
    # Create all tables
    SQLModel.metadata.create_all(_test_engine)
    
    # Override get_session dependency to use test DB
    def override_get_session():
        with Session(_test_engine) as session:
            yield session
    
    fastapi_app.dependency_overrides[get_session] = override_get_session


def teardown_module(module):
    global _temp_db_file, _test_engine
    # Close engine
    if _test_engine:
        _test_engine.dispose()
    # Clean up temp DB file
    if _temp_db_file and os.path.exists(_temp_db_file):
        try:
            os.remove(_temp_db_file)
        except Exception:
            pass


def test_admin_creates_user_and_audit_record():
    # Prepare a DB session and create an admin user directly via CRUD
    with Session(_test_engine) as session:
        admin_in = UserCreate(nombre="Admin", email="admin@example.com", password="AdminPass123", rol="ADMIN")
        admin = user_crud.create_user(session=session, user_in=admin_in)

    # Issue token for admin
    token = create_access_token(subject=admin.email)
    headers = {"Authorization": f"Bearer {token}"}

    client = TestClient(fastapi_app)

    # Admin creates a new comercial user via API
    new_user = {
        "nombre": "Comercial",
        "email": "comercial@example.com",
        "password": "ComercialPass123",
        "rol": "COMERCIAL"
    }

    resp = client.post("/api/v1/usuarios/", json=new_user, headers=headers)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["email"] == new_user["email"]

    # Verify audit record was created
    with Session(_test_engine) as session:
        statement = select(AuditLog).where(AuditLog.action == "create_user")
        results = session.exec(statement).all()
        assert len(results) >= 1
        found = False
        for a in results:
            if a.actor_email == admin.email and a.target_email == new_user["email"]:
                found = True
                break
        assert found, "Expected audit record for create_user not found"


def test_non_admin_cannot_create_user_and_no_audit():
    # Create a commercial user directly
    with Session(_test_engine) as session:
        comercial_in = UserCreate(nombre="Comercial2", email="com2@example.com", password="Pass12345", rol="COMERCIAL")
        comercial = user_crud.create_user(session=session, user_in=comercial_in)

    # Issue token for comercial
    token = create_access_token(subject=comercial.email)
    headers = {"Authorization": f"Bearer {token}"}

    client = TestClient(fastapi_app)

    new_user = {
        "nombre": "ShouldNotCreate",
        "email": "blocked@example.com",
        "password": "BlockedPass123",
        "rol": "COMERCIAL"
    }

    resp = client.post("/api/v1/usuarios/", json=new_user, headers=headers)
    assert resp.status_code == 403

    # Verify no audit record with target email "blocked@example.com"
    with Session(_test_engine) as session:
        statement = select(AuditLog).where(AuditLog.target_email == "blocked@example.com")
        results = session.exec(statement).all()
        assert len(results) == 0


def test_admin_can_list_audit_logs():
    """Verify ADMIN can list audit logs with filters."""
    # Create admin and comercial users
    with Session(_test_engine) as session:
        admin_in = UserCreate(nombre="Admin", email="admin_audit@example.com", password="AdminPass123", rol="ADMIN")
        admin = user_crud.create_user(session=session, user_in=admin_in)

    # Issue token for admin
    token = create_access_token(subject=admin.email)
    headers = {"Authorization": f"Bearer {token}"}
    client = TestClient(fastapi_app)

    # Admin lists all audit logs
    resp = client.get("/api/v1/audits/", headers=headers)
    assert resp.status_code == 200
    logs = resp.json()
    assert isinstance(logs, list)

    # Admin filters by action
    resp = client.get("/api/v1/audits/?action=create_user", headers=headers)
    assert resp.status_code == 200
    filtered_logs = resp.json()
    assert all(log["action"] == "create_user" for log in filtered_logs)

    # Admin filters by actor_email
    resp = client.get(f"/api/v1/audits/?actor_email={admin.email}", headers=headers)
    assert resp.status_code == 200


def test_non_admin_cannot_access_audit_logs():
    """Verify non-ADMIN cannot access audit logs."""
    # Create comercial user
    with Session(_test_engine) as session:
        comercial_in = UserCreate(nombre="Comercial", email="comercial_audit@example.com", password="Pass12345", rol="COMERCIAL")
        comercial = user_crud.create_user(session=session, user_in=comercial_in)

    # Issue token for comercial
    token = create_access_token(subject=comercial.email)
    headers = {"Authorization": f"Bearer {token}"}
    client = TestClient(fastapi_app)

    # Comercial tries to list audit logs
    resp = client.get("/api/v1/audits/", headers=headers)
    assert resp.status_code == 403


def test_admin_updates_user_creates_audit():
    """Verify update user operation creates audit log."""
    # Create admin and target user
    admin_id = None
    admin_email = None
    target_id = None
    target_email = None
    
    with Session(_test_engine) as session:
        admin_in = UserCreate(nombre="Admin", email="admin_update@example.com", password="AdminPass123", rol="ADMIN")
        admin = user_crud.create_user(session=session, user_in=admin_in)
        admin_id = admin.id_usuario
        admin_email = admin.email
        
        target_in = UserCreate(nombre="Target", email="target_update@example.com", password="TargetPass123", rol="COMERCIAL")
        target = user_crud.create_user(session=session, user_in=target_in)
        target_id = target.id_usuario
        target_email = target.email

    token = create_access_token(subject=admin_email)
    headers = {"Authorization": f"Bearer {token}"}
    client = TestClient(fastapi_app)

    # Admin updates target user
    update_data = {"nombre": "Target Updated"}
    resp = client.put(f"/api/v1/usuarios/{target_id}", json=update_data, headers=headers)
    assert resp.status_code == 200
    updated_data = resp.json()
    assert updated_data["nombre"] == "Target Updated"

    # Verify audit log was created
    with Session(_test_engine) as session:
        statement = select(AuditLog).where(
            AuditLog.action == "update_user",
            AuditLog.actor_email == admin_email,
            AuditLog.target_email == target_email
        )
        results = session.exec(statement).all()
        assert len(results) >= 1


def test_user_updates_own_profile_creates_audit():
    """Verify user updating own profile creates audit log."""
    user_id = None
    user_email = None
    
    with Session(_test_engine) as session:
        user_in = UserCreate(nombre="User", email="user_self_update@example.com", password="UserPass123", rol="COMERCIAL")
        user = user_crud.create_user(session=session, user_in=user_in)
        user_id = user.id_usuario
        user_email = user.email

    token = create_access_token(subject=user_email)
    headers = {"Authorization": f"Bearer {token}"}
    client = TestClient(fastapi_app)

    # User updates own profile
    update_data = {"nombre": "User Updated"}
    resp = client.put(f"/api/v1/usuarios/{user_id}", json=update_data, headers=headers)
    assert resp.status_code == 200

    # Verify audit log was created
    with Session(_test_engine) as session:
        statement = select(AuditLog).where(
            AuditLog.action == "update_user",
            AuditLog.actor_email == user_email
        )
        results = session.exec(statement).all()
        assert len(results) >= 1


def test_admin_deletes_user_creates_audit():
    """Verify delete user operation creates audit log."""
    # Create admin and target user
    admin_id = None
    admin_email = None
    target_id = None
    target_email = None
    
    with Session(_test_engine) as session:
        admin_in = UserCreate(nombre="Admin", email="admin_delete@example.com", password="AdminPass123", rol="ADMIN")
        admin = user_crud.create_user(session=session, user_in=admin_in)
        admin_id = admin.id_usuario
        admin_email = admin.email
        
        target_in = UserCreate(nombre="Target", email="target_delete@example.com", password="TargetPass123", rol="COMERCIAL")
        target = user_crud.create_user(session=session, user_in=target_in)
        target_id = target.id_usuario
        target_email = target.email

    token = create_access_token(subject=admin_email)
    headers = {"Authorization": f"Bearer {token}"}
    client = TestClient(fastapi_app)

    # Admin deletes target user
    resp = client.delete(f"/api/v1/usuarios/{target_id}", headers=headers)
    assert resp.status_code == 204

    # Verify audit log was created
    with Session(_test_engine) as session:
        statement = select(AuditLog).where(
            AuditLog.action == "delete_user",
            AuditLog.actor_email == admin_email,
            AuditLog.target_email == target_email
        )
        results = session.exec(statement).all()
        assert len(results) >= 1


def test_non_admin_cannot_delete_user_no_audit():
    """Verify non-ADMIN cannot delete user and no audit log is created."""
    # Create comercial user and target
    comercial_email = None
    target_id = None
    target_email = None
    
    with Session(_test_engine) as session:
        comercial_in = UserCreate(nombre="Comercial", email="comercial_delete@example.com", password="CommPass123", rol="COMERCIAL")
        comercial = user_crud.create_user(session=session, user_in=comercial_in)
        comercial_email = comercial.email
        
        target_in = UserCreate(nombre="Target", email="target_delete2@example.com", password="TargetPass123", rol="COMERCIAL")
        target = user_crud.create_user(session=session, user_in=target_in)
        target_id = target.id_usuario
        target_email = target.email

    token = create_access_token(subject=comercial_email)
    headers = {"Authorization": f"Bearer {token}"}
    client = TestClient(fastapi_app)

    # Comercial tries to delete target user
    resp = client.delete(f"/api/v1/usuarios/{target_id}", headers=headers)
    assert resp.status_code == 403

    # Verify NO audit log was created
    with Session(_test_engine) as session:
        statement = select(AuditLog).where(
            AuditLog.action == "delete_user",
            AuditLog.target_email == target_email
        )
        results = session.exec(statement).all()
        assert len(results) == 0
