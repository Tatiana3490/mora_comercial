from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

# Imports de tu proyecto
from app.db.session import get_session
from app.models.user import User, UserCreate, UserUpdate, ROL_USUARIO
from app.utils.security import get_current_user, get_password_hash
# Si quieres mantener el rate limit
from app.core.rate_limiting import rate_limit, RATE_LIMITS 
# (Opcional) Si quieres mantener auditoría, impórtalo, pero asegúrate que use id_usuario
from app.crud import audit_crud 

router = APIRouter(tags=["Usuarios"])

# --- ESQUEMA LOCAL PARA RESET PASSWORD ---
class PasswordReset(BaseModel):
    new_password: str

# 1. LISTAR USUARIOS (Solo Admin)
@router.get("/", response_model=List[User], summary="Listar usuarios")
def read_users(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    
    users = session.exec(select(User)).all()
    return users

# 2. CREAR USUARIO (Solo Admin)
@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED, summary="Crear usuario")
@rate_limit(RATE_LIMITS["create_user"])
def create_user(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    user_in: UserCreate
):
    # Seguridad
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="Solo administradores pueden crear usuarios")

    # Validar Rol
    if user_in.rol not in ROL_USUARIO:
        raise HTTPException(status_code=400, detail="Rol inválido")

    # Validar Email duplicado
    existing_user = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="El email ya está registrado")

    # Crear usuario
    new_user = User(
        nombre=user_in.nombre,
        apellidos=user_in.apellidos,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password), # Hasheamos aquí
        rol=user_in.rol,
        activo=True
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Auditoría (Opcional, protegida con try/except)
    try:
        audit_crud.create_audit(
            session, 
            action="create_user", 
            target_email=new_user.email, 
            details=f"id={new_user.id_usuario}" # Usamos id_usuario
        )
    except Exception:
        pass

    return new_user

# 3. ACTUALIZAR USUARIO (Datos generales, NO password)
@router.put("/{user_id}", response_model=User, summary="Actualizar usuario")
def update_user(
    user_id: int, 
    user_in: UserUpdate, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Buscar por id_usuario
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Actualizar campos
    user.nombre = user_in.nombre
    user.apellidos = user_in.apellidos
    user.email = user_in.email
    user.rol = user_in.rol
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# 4. 🔥 NUEVO: RESETEAR PASSWORD (Lo llama el botón de la llave)
@router.put("/{user_id}/reset-password", summary="Resetear contraseña")
def reset_password(
    user_id: int, 
    password_data: PasswordReset, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Hasheamos la nueva contraseña
    user.password_hash = get_password_hash(password_data.new_password)
    
    session.add(user)
    session.commit()
    
    return {"message": "Contraseña actualizada correctamente"}

# 5. ELIMINAR USUARIO
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar usuario")
@rate_limit(RATE_LIMITS["delete_user"])
def delete_user(
    user_id: int, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    session.delete(user)
    session.commit()
    return None