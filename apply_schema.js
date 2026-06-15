// ==============================================================================
// GISEC Technologies Platform - Database Schema Applier & Seeder (Dependency-Free Entry)
// Run this script to automatically:
// 1. Install required Postgres client dependencies
// 2. Connect to Supabase DB and create tables from schema.sql
// 3. Populate course tracks, modules, and schedules from public/data/courses.json
//
// Execution command: node apply_schema.js
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Load Environment Variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.local file not found. Please verify configuration.');
    process.exit(1);
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const equalIdx = trimmed.indexOf('=');
    if (equalIdx > 0) {
      const key = trimmed.slice(0, equalIdx).trim();
      let val = trimmed.slice(equalIdx + 1).trim();
      
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });
  
  return env;
}

const env = loadEnv();
const directUrl = env.DIRECT_URL;

if (!directUrl || directUrl.includes('[YOUR-PASSWORD]')) {
  console.error('❌ Error: DIRECT_URL is missing or contains the placeholder "[YOUR-PASSWORD]" inside .env.local.');
  console.error('👉 Please replace "[YOUR-PASSWORD]" in your .env.local file with your actual database password, save it, and run the script again.');
  process.exit(1);
}

// 2. Ensure "pg" library is installed
try {
  require.resolve('pg');
} catch (e) {
  console.log('⏳ Postgres driver ("pg") not found. Installing now...');
  try {
    execSync('npm install pg --no-save', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Postgres driver installed successfully.\n');
  } catch (err) {
    console.error('❌ Error: Failed to install Postgres driver ("pg"). Check your internet connection.');
    process.exit(1);
  }
}

const { Client } = require('pg');

async function runSetup() {
  console.log('⏳ Connecting to Supabase database...');
  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL connection
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully.');

    // 3. Read and execute schema.sql
    console.log('⏳ Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Running database migrations...');
    await client.query(schemaSql);
    console.log('✅ Database schema created successfully.');

    await client.end();

    // 4. Run seeder script
    console.log('\n⏳ Executing seeder script to populate tables...');
    const seedPath = path.join(__dirname, 'seed.js');
    if (fs.existsSync(seedPath)) {
      execSync('node seed.js', { stdio: 'inherit', cwd: __dirname });
    } else {
      console.log('⚠️ Warning: seed.js script not found. Skipping seeding step.');
    }

    console.log('\n🎉 GISEC Technologies Platform database setup complete and ready to use!');
  } catch (err) {
    console.error('\n❌ Database setup failed:', err.message);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
}

runSetup();
