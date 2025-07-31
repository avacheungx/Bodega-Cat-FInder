"""
Migration script to add created_by fields to cats and bodegas tables.
This script should be run after the models have been updated.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db
from models import Cat, Bodega

def migrate_created_by_fields():
    with app.app_context():
        # Add created_by column to cats table if it doesn't exist
        try:
            with db.engine.connect() as conn:
                conn.execute(db.text("""
                    ALTER TABLE cats 
                    ADD COLUMN created_by INTEGER REFERENCES users(id)
                """))
                conn.commit()
            print("✓ Added created_by column to cats table")
        except Exception as e:
            print(f"Note: created_by column may already exist in cats table: {e}")
        
        # Add created_by column to bodegas table if it doesn't exist
        try:
            with db.engine.connect() as conn:
                conn.execute(db.text("""
                    ALTER TABLE bodegas 
                    ADD COLUMN created_by INTEGER REFERENCES users(id)
                """))
                conn.commit()
            print("✓ Added created_by column to bodegas table")
        except Exception as e:
            print(f"Note: created_by column may already exist in bodegas table: {e}")
        
        print("Migration completed successfully!")

if __name__ == "__main__":
    migrate_created_by_fields() 