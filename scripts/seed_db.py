import json
import os
import sys
from sqlmodel import Session, select

# Add the project root directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import engine, create_db_and_tables, DB_FILE
from app.models.articulo import Articulo

def seed_data():
    # 1. Delete existing database file
    if os.path.exists(DB_FILE):
        print(f"Deleting existing database: {DB_FILE}")
        os.remove(DB_FILE)
    
    # 2. Create tables
    create_db_and_tables()
    
    # 3. Read data from JSON
    json_path = os.path.join(os.path.dirname(__file__), 'products.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)
    
    # 4. Insert data
    with Session(engine) as session:
        for product in products_data:
            # Map JSON fields to Articulo model fields if names match exactly
            # Note: 'datos_tecnicos' in JSON matches 'datos_tecnicos' in model
            # 'imagenes' in JSON matches 'imagenes' in model
            
            articulo = Articulo(**product)
            session.add(articulo)
        
        session.commit()
        print(f"Successfully seeded {len(products_data)} products.")

if __name__ == "__main__":
    seed_data()
