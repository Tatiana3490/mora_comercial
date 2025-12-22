from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.utils.security import get_current_user
from app.models.user import User
from app.models.nota import Nota, NotaCreate, NotaRead

router = APIRouter()

# --------------------------------------------------------
# 1. CREAR NOTA (POST)
# --------------------------------------------------------
@router.post("/", response_model=NotaRead)
def create_nota(
    *,
    nota_in: NotaCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    nueva_nota = Nota(
        contenido=nota_in.contenido,
        id_cliente=nota_in.id_cliente,
        id_usuario=current_user.id_usuario # Guardamos quién la creó, aunque todos puedan tocarla después
    )
    session.add(nueva_nota)
    session.commit()
    session.refresh(nueva_nota)
    return nueva_nota


# --------------------------------------------------------
# 2. LEER NOTAS DE UN CLIENTE (GET)
# --------------------------------------------------------
@router.get("/{cliente_id}", response_model=List[NotaRead])
def read_notas_cliente(
    cliente_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Buscamos notas del cliente
    statement = select(Nota).where(Nota.id_cliente == cliente_id)

    # Ordenamos: Las más recientes primero
    statement = statement.order_by(Nota.fecha_creacion.desc())
    
    notas = session.exec(statement).all()
    return notas


# --------------------------------------------------------
# 3. ACTUALIZAR NOTA (PUT) - LIBRE PARA TODOS
# --------------------------------------------------------
@router.put("/{nota_id}", response_model=NotaRead)
def update_nota(
    nota_id: int,
    nota_update: NotaCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Buscar la nota
    nota = session.get(Nota, nota_id)
    if not nota:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
        
    # --- 🟢 CAMBIO IMPORTANTE: HEMOS QUITADO LA RESTRICCIÓN DE SEGURIDAD ---
    # Ya no comprobamos si es dueño o admin. Si tiene usuario, puede editar.
    
    # 2. Actualizar
    nota.contenido = nota_update.contenido
    session.add(nota)
    session.commit()
    session.refresh(nota)
    return nota


# --------------------------------------------------------
# 4. ELIMINAR NOTA (DELETE) - LIBRE PARA TODOS
# --------------------------------------------------------
@router.delete("/{nota_id}", response_model=dict)
def delete_nota(
    *,
    nota_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    nota = session.get(Nota, nota_id)   
    if not nota:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
    
    # --- 🟢 CAMBIO IMPORTANTE: HEMOS QUITADO LA RESTRICCIÓN DE SEGURIDAD ---
    # Cualquiera puede borrar.
    
    session.delete(nota)
    session.commit()
    return {"msg": "Nota eliminada correctamente"}