import bcrypt

# --- FUNCIONES DE UTILIDAD (Copia esto a tu proyecto real más tarde) ---

def hash_password(password: str) -> str:
    """
    Recibe una contraseña en texto plano y devuelve el hash en string.
    """
    # 1. Convertir la contraseña de texto a bytes
    pwd_bytes = password.encode('utf-8')
    
    # 2. Generar 'salt' y hashear
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
    
    # 3. Devolver como string para poder guardarlo en la Base de Datos
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compara una contraseña plana con un hash guardado.
    """
    # 1. Convertir ambos a bytes
    pwd_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    
    # 2. Comparar usando checkpw
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

# --- TU TEST ---

def ejecutar_test():
    print("--- INICIANDO TEST DE CONTRASEÑA (MODO BCRYPT NATIVO) ---")
    
    passwords_a_probar = ['admin123', 'comercial123', '12345678']

    for pwd in passwords_a_probar:
        print(f"\nProbando: '{pwd}' (Longitud: {len(pwd)})")
        
        try:
            # 1. Generar el hash
            hash_resultado = hash_password(pwd)
            print(f"  ✅ Hash generado correctamente.")
            # Opcional: imprimir una parte del hash para verificar
            # print(f"     Hash: {hash_resultado[:20]}...") 

            # 2. Verificar que la contraseña coincida con su propio hash
            coincide = verify_password(pwd, hash_resultado)
            
            if coincide:
                print("  ✅ Verificación exitosa: La contraseña coincide con el hash.")
            else:
                print("  ❌ ERROR: La verificación falló.")

        except Exception as e:
            print(f"  ❌ ERROR FATAL: {e}")

    print("\n--- FIN DEL TEST ---")

if __name__ == "__main__":
    ejecutar_test()