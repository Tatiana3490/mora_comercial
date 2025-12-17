from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

# 1. Base de Datos (Confirmado por tu archivo presupuesto.py)
from app.db.session import get_session

# 2. Seguridad (Confirmado por tu archivo user.py)
#    Nota: Usamos 'get_current_user' en lugar de 'get_current_active_user'
from app.utils.security import get_current_user 

from app.models.user import User
from app.models.nota import Nota, NotaCreate, NotaRead

router = APIRouter(tags=["Notas"])


# --------------------------------------------------------
# 1. CREAR NOTA (POST)
# --------------------------------------------------------
@router.post("/", response_model=NotaRead)
def create_nota(
    *,
    nota_in: NotaCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user) # <--- ¡Corregido aquí!
):
    nueva_nota = Nota(
        contenido=nota_in.contenido,
        id_cliente=nota_in.id_cliente,
        id_usuario=current_user.id_usuario
    )
    session.add(nueva_nota)
    session.commit()
    session.refresh(nueva_nota)
    return nueva_nota

# --------------------------------------------------------
# 2. LEER MIS NOTAS (GET)
# --------------------------------------------------------
# En app/api/v1/endpoints/notas.py

@router.get("/{cliente_id}", response_model=list[NotaRead])
def read_notas_cliente(
    cliente_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Empezamos buscando TODAS las notas de este cliente
    query = db.query(Nota).filter(Nota.id_cliente == cliente_id)

    # 2. FILTRO DE SEGURIDAD:
    # Si el usuario NO es "ADMIN", aplicamos el filtro extra para que solo vea las suyas.
    # (Si es ADMIN, este 'if' se ignora y por tanto lo ve todo).
    if current_user.rol != "ADMIN":
        query = query.filter(Nota.id_usuario == current_user.id_usuario)

    # 3. Ejecutamos la consulta ordenando por fecha (las más nuevas primero)
    notas = query.order_by(Nota.fecha_creacion.desc()).all()
    
    return notas
# --------------------------------------------------------
#3. ELIMINAR NOTA (DELETE)
# --------------------------------------------------------

@router.delete("/{nota_id}", response_model=dict)
def delete_nota(
    *,
    nota_id: int,
    session: Session = Depends(get_session  ),
    current_user: User = Depends(get_current_user)
):
    nota = session.get(Nota, nota_id)   
    if not nota:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
    if nota.id_usuario != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No autorizado para eliminar esta nota")    
    session.delete(nota)
    session.commit()
    return {"msg": "Nota eliminada correctamente"}  

# --------------------------------------------------------
#4. ACTUALIZAR NOTA (PUT)
# --------------------------------------------------------

# --- AÑADIR AL FINAL DE app/api/v1/endpoints/notas.py ---

@router.put("/{nota_id}", response_model=NotaRead)
def update_nota(
    nota_id: int,
    nota_update: NotaCreate, # Reutilizamos el esquema de crear (contenido)
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Buscar la nota
    nota = db.get(Nota, nota_id)
    
    if not nota:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
        
    # 2. Verificar que la nota pertenece al usuario (Seguridad)
    if nota.id_usuario != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta nota")

    # 3. Actualizar datos
    nota.contenido = nota_update.contenido
    
    # 4. Guardar en DB
    db.add(nota)
    db.commit()
    db.refresh(nota)
    
    return nota

