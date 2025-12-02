import sqlite3
import os

# Determinar la ruta correcta al archivo .db (dos niveles atrás)
# Esto asegura que el script, ejecutándose en app/db, acceda a mora_comercial.db en la raíz.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', '..', 'mora_comercial.db')

# --- FUNCIÓN DE INICIALIZACIÓN ---
def initialize_database():
    try:
        # Conectar a la base de datos
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Habilitar claves foráneas
        cursor.execute("PRAGMA foreign_keys = ON;")

        sql_script = """
        -- 1. TABLA USUARIO
        CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            rol TEXT CHECK(rol IN ('COMERCIAL', 'ADMIN')) NOT NULL DEFAULT 'COMERCIAL',
            activo INTEGER DEFAULT 1
        );

        -- 2. TABLA CLIENTE
        CREATE TABLE IF NOT EXISTS cliente (
            id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            nif TEXT,
            correo TEXT,
            provincia TEXT,
            direccion TEXT,
            id_comercial_propietario INTEGER,
            FOREIGN KEY (id_comercial_propietario) REFERENCES usuario(id_usuario)
        );

        -- 3. TABLA ARTICULO (Ladrillo)
        CREATE TABLE IF NOT EXISTS articulo (
            id_articulo INTEGER PRIMARY KEY AUTOINCREMENT,
            descripcion TEXT NOT NULL,
            medidas TEXT,
            color TEXT,
            precio_base_milar REAL
        );

        -- 4. TABLA PRESUPUESTO
        CREATE TABLE IF NOT EXISTS presupuesto (
            id_presupuesto INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_presupuesto TEXT,
            fecha_presupuesto TEXT, 
            lugar_suministro TEXT,
            persona_contacto TEXT,
            estado TEXT CHECK(estado IN ('BORRADOR', 'ENVIADO_ADMIN', 'APROBADO', 'DENEGADO')) DEFAULT 'BORRADOR',
            
            id_comercial_creador INTEGER NOT NULL,
            id_admin_revisor INTEGER,
            fecha_revision TEXT,
            motivo_denegacion TEXT,
            id_cliente INTEGER NOT NULL,
            
            forma_pago TEXT,
            validez_dias INTEGER,
            precio_palet REAL,
            condiciones_camion TEXT,
            condiciones_descarga TEXT,
            condiciones_impuestos TEXT,
            observaciones TEXT,

            FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
            FOREIGN KEY (id_comercial_creador) REFERENCES usuario(id_usuario),
            FOREIGN KEY (id_admin_revisor) REFERENCES usuario(id_usuario)
        );

        -- 5. TABLA PRESUPUESTO_LINEA
        CREATE TABLE IF NOT EXISTS presupuesto_linea (
            id_linea INTEGER PRIMARY KEY AUTOINCREMENT,
            id_presupuesto INTEGER NOT NULL,
            id_articulo INTEGER NOT NULL,
            
            descripcion_articulo TEXT,
            cantidad REAL, 
            unidad TEXT DEFAULT 'MILAR',
            precio_unitario_milar REAL,
            importe_total_linea REAL,
            
            FOREIGN KEY (id_presupuesto) REFERENCES presupuesto(id_presupuesto) ON DELETE CASCADE,
            FOREIGN KEY (id_articulo) REFERENCES articulo(id_articulo)
        );
        """
        
        # Ejecutar el script SQL
        cursor.executescript(sql_script)
        conn.commit()
        print("✅ Todas las tablas se crearon/verificaron exitosamente.")

    except sqlite3.Error as e:
        print(f"❌ Error durante la inicialización de la base de datos: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    initialize_database()

    # --- INSERCIÓN DE DATOS DE PRUEBA ---
def insert_test_data():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # 1. Insertar USUARIOS (1 ADMIN y 1 COMERCIAL)
        # Nota: La contraseña 'test_pass' se usa aquí solo como ejemplo. 
        # En producción, usa una librería como 'passlib' para generar un hash seguro.
        cursor.execute("INSERT INTO usuario (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)", 
                       ("Admin General", "admin@mora.com", "hash_admin_123", "ADMIN"))
        cursor.execute("INSERT INTO usuario (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)", 
                       ("Juan Comercial", "juan@mora.com", "hash_comercial_123", "COMERCIAL"))
        
        # 2. Insertar CLIENTE (Asignado al Comercial Juan)
        juan_comercial_id = 2 # Asumiendo que Juan es el ID 2
        cursor.execute("INSERT INTO cliente (nombre, nif, id_comercial_propietario) VALUES (?, ?, ?)", 
                       ("Constructora Sur S.L.", "B12345678", juan_comercial_id))
        
        # 3. Insertar ARTÍCULO (Ladrillo)
        cursor.execute("INSERT INTO articulo (descripcion, color, precio_base_milar) VALUES (?, ?, ?)",
                       ("Ladrillo cara vista rojo", "ROJO", 320.00))
        
        conn.commit()
        print("✅ Datos de prueba (2 usuarios, 1 cliente, 1 artículo) insertados exitosamente.")

    except sqlite3.IntegrityError as e:
        # Ocurre si ya intentaste insertar los datos y los email/PK ya existen
        print(f"⚠️ Los datos de prueba ya existen o hay un error de integridad: {e}")
    except sqlite3.Error as e:
        print(f"❌ Error al insertar datos: {e}")
    finally:
        if conn:
            conn.close()

# Ejecuta ambas funciones para crear las tablas e insertar datos de prueba
if __name__ == '__main__':
    initialize_database()
    insert_test_data()