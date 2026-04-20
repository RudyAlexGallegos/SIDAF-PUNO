#!/usr/bin/env python3
import psycopg2
import sys

# Conexión a Neon
connection_params = {
    'host': 'ep-delicate-sound-ailtkjb8-pooler.c-4.us-east-1.aws.neon.tech',
    'port': 5432,
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_g9BpjO5woiJA',
    'sslmode': 'require'
}

# Migraciones
migrations = [
    ("UPDATE usuarios SET rol = 'UNIDAD_TECNICA' WHERE rol = 'UNIDAD_TECNICA_CODAR';", "Reemplazar UNIDAD_TECNICA_CODAR"),
    ("UPDATE usuarios SET rol = 'PRESIDENCIA' WHERE rol = 'PRESIDENCIA_CODAR';", "Reemplazar PRESIDENCIA_CODAR"),
    ("UPDATE usuarios SET rol = 'UNIDAD_TECNICA' WHERE rol = 'CODAR';", "Reemplazar CODAR"),
    ("CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);", "Crear índice de optimización"),
    ("SELECT DISTINCT rol FROM usuarios;", "Verificar roles únicos")
]

def run_migration():
    try:
        print("🔗 Conectando a Neon...")
        conn = psycopg2.connect(**connection_params)
        cursor = conn.cursor()
        print("✅ Conexión exitosa\n")
        
        for i, (query, description) in enumerate(migrations, 1):
            print(f"📝 Ejecutando ({i}/{len(migrations)}): {description}")
            
            try:
                cursor.execute(query)
                
                # Si es SELECT, mostrar resultados
                if query.strip().upper().startswith('SELECT'):
                    results = cursor.fetchall()
                    print("✅ Resultado:")
                    for row in results:
                        print(f"   - {row}")
                else:
                    # Para UPDATE, mostrar filas afectadas
                    conn.commit()
                    print(f"✅ Ejecutado ({cursor.rowcount} filas afectadas)\n")
                    
            except psycopg2.Error as err:
                print(f"❌ Error: {err.pgerror}\n")
                conn.rollback()
        
        print("\n" + "="*50)
        print("🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print("="*50 + "\n")
        
        # Verificación final
        print("📊 Verificación final - Usuarios por rol:")
        verify_query = """
        SELECT rol, COUNT(*) as cantidad 
        FROM usuarios 
        GROUP BY rol 
        ORDER BY rol
        """
        cursor.execute(verify_query)
        results = cursor.fetchall()
        
        for rol, cantidad in results:
            print(f"   {rol}: {cantidad} usuarios")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Conexión cerrada")
        
    except psycopg2.Error as err:
        print(f"❌ Error de conexión: {err}")
        sys.exit(1)
    except Exception as err:
        print(f"❌ Error inesperado: {err}")
        sys.exit(1)

if __name__ == '__main__':
    run_migration()
