# app/crud/presupuesto_crud.py

from typing import List, Optional

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.presupuesto import (
    Presupuesto,
    PresupuestoCompletoCreate,
    PresupuestoUpdate,
    PresupuestoCompletoRead,
)
from app.models.presupuesto_linea import (
    PresupuestoLinea,
    PresupuestoLineaRead,
)
from app.models.client import Client
from app.models.articulo import Articulo


# ============================
#    HELPERS DE MONTAJE
# ============================

def build_presupuesto_completo_read(
    presupuesto: Presupuesto,
) -> PresupuestoCompletoRead:
    """
    Construye el esquema PresupuestoCompletoRead
    a partir de la entidad Presupuesto (incluyendo líneas y totales).
    """

    total_bruto = 0.0
    total_descuento = 0.0
    total_neto = 0.0

    lineas_read: List[PresupuestoLineaRead] = []

    for linea in presupuesto.lineas or []:
        # Cálculos de línea (usando nombres correctos)
        bruto_linea = (linea.cantidad or 0.0) * (linea.precio_unitario or 0.0)
        descuento_linea = bruto_linea * (linea.descuento or 0.0) / 100.0
        neto_linea = bruto_linea - descuento_linea

        total_bruto += bruto_linea
        total_descuento += descuento_linea
        total_neto += neto_linea

        # Mapeamos a esquema de lectura de línea
        lineas_read.append(
            PresupuestoLineaRead(
                # 👇 CORRECCIONES AQUÍ 👇
                id=linea.id,                        # Antes: id_linea
                id_presupuesto=linea.id_presupuesto,
                id_articulo=linea.id_articulo,
                cantidad=linea.cantidad,            # Antes: cantidad_m2
                precio_unitario=linea.precio_unitario, # Antes: precio_m2
                descuento=linea.descuento,          # Antes: descuento_pct
                descripcion=linea.descripcion,      # Antes: descripcion_articulo
            )
        )

    return PresupuestoCompletoRead(
        # Cabecera
        # 👇 CORRECCIÓN AQUÍ TAMBIÉN 👇
        id=presupuesto.id,              # Antes: id_presupuesto
        numero_presupuesto=presupuesto.numero_presupuesto,
        fecha_presupuesto=presupuesto.fecha_presupuesto,
        lugar_suministro=presupuesto.lugar_suministro,
        persona_contacto=presupuesto.persona_contacto,
        estado=presupuesto.estado,
        fecha_revision=presupuesto.fecha_revision,
        motivo_denegacion=presupuesto.motivo_denegacion,
        forma_pago=presupuesto.forma_pago,
        validez_dias=presupuesto.validez_dias,
        precio_palet=presupuesto.precio_palet,
        condiciones_camion=presupuesto.condiciones_camion,
        condiciones_descarga=presupuesto.condiciones_descarga,
        condiciones_impuestos=presupuesto.condiciones_impuestos,
        observaciones=presupuesto.observaciones,
        id_cliente=presupuesto.id_cliente,
        id_comercial_creador=presupuesto.id_comercial_creador,
        id_admin_revisor=presupuesto.id_admin_revisor,
        # Líneas
        lineas=lineas_read,
        # Totales calculados
        total_bruto=total_bruto,
        total_descuento=total_descuento,
        total_neto=total_neto,
    )

# ============================
#    READ OPERATIONS
# ============================

def get_presupuesto_by_id(
    session: Session,
    presupuesto_id: int,
) -> Optional[Presupuesto]:
    """
    Obtiene un presupuesto por su ID (entidad de BD).
    """
    return session.get(Presupuesto, presupuesto_id)


def get_presupuesto_completo_by_id(
    session: Session,
    presupuesto_id: int,
) -> Optional[PresupuestoCompletoRead]:
    """
    Obtiene un presupuesto por ID y lo devuelve como PresupuestoCompletoRead.
    """
    presupuesto = session.get(Presupuesto, presupuesto_id)
    if not presupuesto:
        return None
    return build_presupuesto_completo_read(presupuesto)


def get_presupuestos_by_client(
    session: Session,
    client_id: int,
) -> List[Presupuesto]:
    """
    Lista todos los presupuestos (entidad BD) de un cliente concreto.
    """
    statement = select(Presupuesto).where(Presupuesto.id_cliente == client_id)
    return list(session.exec(statement).all())


def get_presupuestos_completos_by_client(
    session: Session,
    client_id: int,
) -> List[PresupuestoCompletoRead]:
    """
    Lista todos los presupuestos de un cliente como PresupuestoCompletoRead.
    """
    presupuestos = get_presupuestos_by_client(session, client_id)
    return [build_presupuesto_completo_read(p) for p in presupuestos]


def get_presupuestos(
    session: Session,
    skip: int = 0,
    limit: int = 100,
) -> List[Presupuesto]:
    """Devuelve la lista paginada de presupuestos (solo entidad cabecera)."""
    statement = select(Presupuesto).offset(skip).limit(limit)
    return session.exec(statement).all()


def get_presupuestos_completos(
    session: Session,
    skip: int = 0,
    limit: int = 100,
) -> List[PresupuestoCompletoRead]:
    """
    Devuelve la lista paginada de presupuestos como PresupuestoCompletoRead
    (cabecera + líneas + totales).
    """
    presupuestos = get_presupuestos(session, skip=skip, limit=limit)
    return [build_presupuesto_completo_read(p) for p in presupuestos]


# ============================
#    CREATE OPERATION
# ============================

def create_presupuesto_completo(
    session: Session,
    presupuesto_in: PresupuestoCompletoCreate,
) -> Presupuesto:
    """
    Crea un presupuesto completo:
    - Cabecera (Presupuesto)
    - Líneas (PresupuestoLinea)

    Body esperado (PLANO):
    {
      ...campos de presupuesto...
      "lineas": [ {...}, {...} ]
    }

    Además:
    - Valida que el id_cliente exista.
    - Valida que cada id_articulo de las líneas exista.
    """

    # 0) Validar que el cliente exista
    cliente = session.get(Client, presupuesto_in.id_cliente)
    if not cliente:
        raise HTTPException(
            status_code=400,
            detail=f"Cliente con id_cliente={presupuesto_in.id_cliente} no existe",
        )

    # 0.1) Validar que todos los artículos de las líneas existan
    for linea_in in (presupuesto_in.lineas or []):
        articulo = session.get(Articulo, linea_in.id_articulo)
        if not articulo:
            raise HTTPException(
                status_code=400,
                detail=f"Artículo con id_articulo={linea_in.id_articulo} no existe",
            )

    # 1) Separar datos de cabecera (todos los campos menos 'lineas')
    cabecera_data = presupuesto_in.model_dump(exclude={"lineas"})

    # 2) Crear la cabecera del presupuesto
    presupuesto = Presupuesto(**cabecera_data)
    session.add(presupuesto)
    session.flush()  # Para obtener presupuesto.id_presupuesto antes del commit

    # 3) Crear las líneas, forzando id_presupuesto desde la cabecera
    for linea_in in (presupuesto_in.lineas or []):
        # Ignoramos cualquier id_presupuesto que venga en el body
        linea_data = linea_in.model_dump(exclude={"id_presupuesto"})

        linea = PresupuestoLinea(
            **linea_data,
            id_presupuesto=presupuesto.id,
        )
        session.add(linea)

    # 4) Confirmar en base de datos
    session.commit()

    # 5) Refrescar la cabecera para que tenga las relaciones cargadas
    session.refresh(presupuesto)

    return presupuesto


# ============================
#    UPDATE OPERATION
# ============================

def update_presupuesto(
    session: Session,
    presupuesto: Presupuesto,
    presupuesto_in: PresupuestoUpdate,
) -> Presupuesto:
    """
    Actualiza un presupuesto existente.
    """
    
    # Convertimos los datos de entrada a diccionario
    data = presupuesto_in.model_dump(exclude_unset=True, exclude={"lineas"})

    # ---------------------------------------------------------------
    # 1. LÓGICA DE ESTADOS (CORREGIDA)
    # ---------------------------------------------------------------
    
    # CASO A: El presupuesto YA ESTABA ACEPTADO en la Base de Datos
    # Significa que alguien lo está editando después de aprobarse.
    if presupuesto.estado == "ACEPTADO":
        # Forzamos vuelta a Pendiente
        presupuesto.estado = "PENDIENTE"
        # Y borramos cualquier intento de mantenerlo aceptado desde fuera
        if "estado" in data:
            del data["estado"]

    # CASO B: El presupuesto ESTÁ PENDIENTE (o Rechazado)
    else:
        # Aquí NO hacemos nada especial.
        # Si el Admin envía estado="ACEPTADO", PERMITIMOS que pase.
        pass

    # ---------------------------------------------------------------
    # 2. APLICAR CAMBIOS
    # ---------------------------------------------------------------
    for key, value in data.items():
        setattr(presupuesto, key, value)

    # ---------------------------------------------------------------
    # 3. GESTIÓN DE LÍNEAS
    # ---------------------------------------------------------------
    if presupuesto_in.lineas is not None:
        # A) Borrar líneas existentes
        for linea_antigua in list(presupuesto.lineas):
            session.delete(linea_antigua)
        
        # B) Crear líneas nuevas
        for linea_in in presupuesto_in.lineas:
            nueva_linea = PresupuestoLinea(
                id_presupuesto=presupuesto.id,
                id_articulo=linea_in.id_articulo,
                descripcion=linea_in.descripcion,
                cantidad=linea_in.cantidad,
                precio_unitario=linea_in.precio_unitario,
                descuento=linea_in.descuento
            )
            session.add(nueva_linea)

    session.add(presupuesto)
    session.commit()
    session.refresh(presupuesto)
    return presupuesto