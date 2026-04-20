const { Client } = require('pg');

// Conexión a Neon
const client = new Client({
  host: 'ep-delicate-sound-ailtkjb8-pooler.c-4.us-east-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_g9BpjO5woiJA',
  ssl: {
    rejectUnauthorized: false
  }
});

const migrations = [
  "UPDATE usuarios SET rol = 'UNIDAD_TECNICA' WHERE rol = 'UNIDAD_TECNICA_CODAR';",
  "UPDATE usuarios SET rol = 'PRESIDENCIA' WHERE rol = 'PRESIDENCIA_CODAR';",
  "UPDATE usuarios SET rol = 'UNIDAD_TECNICA' WHERE rol = 'CODAR';",
  "CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);",
  "SELECT DISTINCT rol FROM usuarios;"
];

async function runMigration() {
  try {
    console.log('🔗 Conectando a Neon...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    for (let i = 0; i < migrations.length; i++) {
      const query = migrations[i];
      console.log(`📝 Ejecutando (${i+1}/${migrations.length}): ${query.substring(0, 60)}...`);
      
      try {
        const result = await client.query(query);
        
        if (query.includes('SELECT')) {
          console.log('✅ Resultado:');
          result.rows.forEach(row => console.log('   -', row));
        } else if (result.rowCount !== null) {
          console.log(`✅ Ejecutado (${result.rowCount} filas afectadas)\n`);
        } else {
          console.log('✅ Ejecutado\n');
        }
      } catch (err) {
        console.error('❌ Error:', err.message, '\n');
      }
    }

    console.log('\n========================================');
    console.log('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('========================================\n');
    
    // Verificación final
    console.log('📊 Verificación final - Usuarios por rol:');
    const countResult = await client.query(`
      SELECT rol, COUNT(*) as cantidad 
      FROM usuarios 
      GROUP BY rol 
      ORDER BY rol
    `);
    
    countResult.rows.forEach(row => {
      console.log(`   ${row.rol}: ${row.cantidad} usuarios`);
    });

  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Conexión cerrada');
  }
}

runMigration();
