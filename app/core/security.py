# app/core/security.py

from passlib.context import CryptContext

# Usamos pbkdf2_sha256, estándar y sin límite raro de 72 bytes
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Devuelve el hash seguro de una contraseña en texto plano.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Comprueba si la contraseña en texto plano coincide con el hash almacenado.
    """
    return pwd_context.verify(plain_password, hashed_password)
