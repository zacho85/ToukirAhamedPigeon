const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

// Parse Prisma schema file
const prismaSchema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Extract all model definitions from schema
function extractModels() {
  const modelRegex = /model (\w+) \{([^}]+)\}/g;
  const models = {};
  let match;
  
  while ((match = modelRegex.exec(prismaSchema)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    
    // Extract scalar fields
    const scalarFields = modelBody.split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (!line || line.startsWith('//') || line.startsWith('@@')) return false;
        if (line.includes('@relation') || line.includes('[]')) return false;
        
        const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Decimal', 'Json'];
        return scalarTypes.some(type => line.includes(type));
      })
      .map(line => {
        const fieldMatch = line.match(/^(\w+)/);
        return fieldMatch ? fieldMatch[1] : null;
      })
      .filter(field => field && !['id', 'createdAt', 'updatedAt'].includes(field));
    
    // Extract indexes
    const indexes = [];
    const indexLines = modelBody.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('@@index'));
    
    indexLines.forEach(line => {
      const indexMatch = line.match(/@@index\(\[(.*?)\]\)/);
      if (indexMatch) {
        const columns = indexMatch[1].split(',').map(c => c.trim().replace(/["']/g, ''));
        indexes.push(columns);
      }
    });
    
    // Extract unique constraints
    const uniqueConstraints = [];
    const uniqueLines = modelBody.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('@@unique'));
    
    uniqueLines.forEach(line => {
      const uniqueMatch = line.match(/@@unique\(\[(.*?)\]\)/);
      if (uniqueMatch) {
        const columns = uniqueMatch[1].split(',').map(c => c.trim().replace(/["']/g, ''));
        uniqueConstraints.push(columns);
      }
    });
    
    models[modelName] = {
      scalarFields,
      indexes,
      uniqueConstraints
    };
  }
  
  return models;
}

// Get column data type from schema
function getColumnDataType(modelName, columnName, models) {
  const modelBody = prismaSchema.split(`model ${modelName} {`)[1]?.split('}')[0];
  if (!modelBody) return 'TEXT';
  
  const lines = modelBody.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith(columnName)) {
      if (line.includes('Int')) return 'INTEGER';
      if (line.includes('Float')) return 'DOUBLE PRECISION';
      if (line.includes('Boolean')) return 'BOOLEAN';
      if (line.includes('DateTime')) return 'TIMESTAMP(3)';
      if (line.includes('Decimal')) return 'DECIMAL(10,2)';
      if (line.includes('Json')) return 'JSONB';
      break;
    }
  }
  return 'TEXT';
}

// Get all tables with proper case handling
async function getAllTables() {
  const result = await prisma.$queryRaw`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;
  return result;
}

async function findMissingItems() {
  console.log("🔍 Scanning database for missing schema items...\n");
  console.log("=".repeat(70));
  
  const results = {
    missingColumns: [],
    missingIndexes: [],
    missingConstraints: [],
    success: [],
    failures: []
  };
  
  try {
    // Get all tables from database (case-sensitive)
    const tables = await getAllTables();
    console.log(`📊 Found ${tables.length} tables in database`);
    
    const schemaModels = extractModels();
    const schemaTableNames = Object.keys(schemaModels);
    console.log(`📊 Found ${schemaTableNames.length} tables in schema\n`);
    
    // 1. Find missing columns
    console.log("📋 CHECKING MISSING COLUMNS...");
    for (const table of tables) {
      const tableName = table.tablename;
      
      // Check if this table exists in schema (case-sensitive)
      if (!schemaModels[tableName]) {
        console.log(`   ⚠️ Table "${tableName}" exists in DB but not in schema (skipping)`);
        continue;
      }
      
      try {
        const dbColumns = await prisma.$queryRaw`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = ${tableName} 
          AND table_schema = 'public';
        `;
        
        const existingColumns = dbColumns.map(c => c.column_name);
        const schemaFields = schemaModels[tableName].scalarFields;
        
        const missing = schemaFields.filter(field => !existingColumns.includes(field));
        
        if (missing.length > 0) {
          results.missingColumns.push({
            table: tableName,
            columns: missing.map(col => ({
              name: col,
              type: getColumnDataType(tableName, col, schemaModels)
            }))
          });
          console.log(`   📋 ${tableName}: ${missing.length} missing columns`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${tableName}: ${error.message}`);
      }
    }
    
    // 2. Find missing indexes
    console.log("\n📋 CHECKING MISSING INDEXES...");
    for (const table of tables) {
      const tableName = table.tablename;
      if (!schemaModels[tableName]) continue;
      
      try {
        const dbIndexes = await prisma.$queryRaw`
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename = ${tableName} 
          AND schemaname = 'public';
        `;
        
        const existingIndexes = dbIndexes.map(i => i.indexdef.toLowerCase());
        const schemaIndexes = schemaModels[tableName].indexes;
        
        for (const indexColumns of schemaIndexes) {
          const columnsStr = indexColumns.join(', ');
          const exists = existingIndexes.some(idx => idx.includes(columnsStr.toLowerCase()));
          
          if (!exists && indexColumns.length > 0) {
            const indexName = `${tableName}_${indexColumns.join('_')}_idx`;
            results.missingIndexes.push({
              table: tableName,
              columns: indexColumns,
              sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "${indexName}" ON "${tableName}" (${indexColumns.map(c => `"${c}"`).join(', ')});`
            });
          }
        }
        
        if (results.missingIndexes.filter(i => i.table === tableName).length > 0) {
          console.log(`   📋 ${tableName}: ${results.missingIndexes.filter(i => i.table === tableName).length} missing indexes`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking indexes for ${tableName}: ${error.message}`);
      }
    }
    
    // 3. Find missing unique constraints
    console.log("\n📋 CHECKING MISSING UNIQUE CONSTRAINTS...");
    for (const table of tables) {
      const tableName = table.tablename;
      if (!schemaModels[tableName]) continue;
      
      try {
        const dbConstraints = await prisma.$queryRaw`
          SELECT conname 
          FROM pg_constraint 
          WHERE conrelid = ${tableName}::regclass 
          AND contype = 'u';
        `;
        
        const existingConstraints = dbConstraints.map(c => c.conname);
        const schemaConstraints = schemaModels[tableName].uniqueConstraints;
        
        for (const constraintColumns of schemaConstraints) {
          const constraintName = `${tableName}_${constraintColumns.join('_')}_key`;
          if (!existingConstraints.includes(constraintName) && constraintColumns.length > 0) {
            results.missingConstraints.push({
              table: tableName,
              columns: constraintColumns,
              sql: `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" UNIQUE (${constraintColumns.map(c => `"${c}"`).join(', ')});`
            });
          }
        }
        
        if (results.missingConstraints.filter(c => c.table === tableName).length > 0) {
          console.log(`   📋 ${tableName}: ${results.missingConstraints.filter(c => c.table === tableName).length} missing constraints`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking constraints for ${tableName}: ${error.message}`);
      }
    }
    
    // 4. Generate and execute SQL for missing columns
    console.log("\n" + "=".repeat(70));
    console.log("🔧 APPLYING MISSING SCHEMA ITEMS...");
    console.log("=".repeat(70));
    
    // Add missing columns
    if (results.missingColumns.length > 0) {
      console.log("\n📝 Adding missing columns:");
      for (const item of results.missingColumns) {
        for (const col of item.columns) {
          const sql = `ALTER TABLE "${item.table}" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};`;
          try {
            await prisma.$executeRawUnsafe(sql);
            console.log(`   ✅ ADDED: ${item.table}.${col.name} (${col.type})`);
            results.success.push({ type: 'column', table: item.table, name: col.name });
          } catch (error) {
            console.log(`   ❌ FAILED: ${item.table}.${col.name} - ${error.message}`);
            results.failures.push({ type: 'column', table: item.table, name: col.name, error: error.message });
          }
        }
      }
    } else {
      console.log("\n✅ No missing columns found!");
    }
    
    // Add missing indexes
    if (results.missingIndexes.length > 0) {
      console.log("\n📝 Adding missing indexes:");
      for (const idx of results.missingIndexes) {
        try {
          await prisma.$executeRawUnsafe(idx.sql);
          console.log(`   ✅ ADDED INDEX: ${idx.table} on (${idx.columns.join(', ')})`);
          results.success.push({ type: 'index', table: idx.table, columns: idx.columns });
        } catch (error) {
          console.log(`   ❌ FAILED INDEX: ${idx.table} - ${error.message}`);
          results.failures.push({ type: 'index', table: idx.table, error: error.message });
        }
      }
    } else {
      console.log("\n✅ No missing indexes found!");
    }
    
    // Add missing constraints
    if (results.missingConstraints.length > 0) {
      console.log("\n📝 Adding missing constraints:");
      for (const constr of results.missingConstraints) {
        try {
          await prisma.$executeRawUnsafe(constr.sql);
          console.log(`   ✅ ADDED CONSTRAINT: ${constr.table} unique on (${constr.columns.join(', ')})`);
          results.success.push({ type: 'constraint', table: constr.table, columns: constr.columns });
        } catch (error) {
          console.log(`   ❌ FAILED CONSTRAINT: ${constr.table} - ${error.message}`);
          results.failures.push({ type: 'constraint', table: constr.table, error: error.message });
        }
      }
    } else {
      console.log("\n✅ No missing constraints found!");
    }
    
    // 5. Generate Final Report
    console.log("\n" + "=".repeat(70));
    console.log("📊 FINAL REPORT");
    console.log("=".repeat(70));
    
    console.log("\n🔍 MISSING ITEMS FOUND:");
    console.log(`   - Missing Columns: ${results.missingColumns.reduce((sum, t) => sum + t.columns.length, 0)}`);
    console.log(`   - Missing Indexes: ${results.missingIndexes.length}`);
    console.log(`   - Missing Constraints: ${results.missingConstraints.length}`);
    
    console.log("\n✅ SUCCESSFULLY ADDED:");
    console.log(`   - Columns: ${results.success.filter(s => s.type === 'column').length}`);
    console.log(`   - Indexes: ${results.success.filter(s => s.type === 'index').length}`);
    console.log(`   - Constraints: ${results.success.filter(s => s.type === 'constraint').length}`);
    
    if (results.failures.length > 0) {
      console.log("\n❌ FAILURES:");
      results.failures.forEach(f => {
        console.log(`   - ${f.type} on ${f.table}: ${f.error}`);
      });
    } else {
      console.log("\n🎉 ALL ITEMS ADDED SUCCESSFULLY! NO FAILURES.");
    }
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      missing: {
        columns: results.missingColumns,
        indexes: results.missingIndexes,
        constraints: results.missingConstraints
      },
      success: results.success,
      failures: results.failures
    };
    
    fs.writeFileSync('schema-sync-report.json', JSON.stringify(report, null, 2));
    console.log("\n📄 Report saved to: schema-sync-report.json");
    
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
findMissingItems().catch(console.error);