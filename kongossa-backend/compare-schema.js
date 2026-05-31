// save as compare-schema.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function compareSchema() {
  // Query database columns for User table
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'User' 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `;
  
  console.log("=== CURRENT DATABASE COLUMNS (User table) ===");
  console.table(columns);
  
  console.log("\n=== EXPECTED FROM PRISMA SCHEMA ===");
  console.log("Fields to add if missing:");
  console.log("- transfiUserId (TEXT, nullable)");
  
  // Check if column exists
  const hasTransfi = columns.find(c => c.column_name === 'transfiUserId');
  if (!hasTransfi) {
    console.log("\n🔴 MISSING COLUMN: transfiUserId");
    console.log("✅ SQL TO ADD: ALTER TABLE \"User\" ADD COLUMN \"transfiUserId\" TEXT;");
  } else {
    console.log("\n✅ Column 'transfiUserId' already exists");
  }
  
  await prisma.$disconnect();
}

compareSchema();