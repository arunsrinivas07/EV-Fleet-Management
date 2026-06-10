import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve(process.cwd(), './.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });
}

const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('\n❌ Error: DATABASE_URL is not set!');
  console.error('Please add your Supabase connection string to the .env file as DATABASE_URL.');
  console.error('Example:');
  console.error('DATABASE_URL=postgres://postgres.[your-project-id]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres\n');
  process.exit(1);
}

const sqlFiles = [
  { name: 'schema.sql', path: './supabase/schema.sql' },
  { name: 'full_schema.sql', path: './supabase/full_schema.sql' },
  { name: 'fix_rls.sql', path: './supabase/fix_rls.sql' }
];

async function runMigration() {
  console.log('🔄 Connecting to database...');
  const client = new Client({ connectionString });
  await client.connect();
  console.log('✅ Connected successfully.');

  try {
    for (const file of sqlFiles) {
      console.log(`\n⏳ Running ${file.name}...`);
      const filePath = path.resolve(process.cwd(), file.path);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Migration file not found: ${file.path}`);
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the SQL statements
      await client.query(sql);
      console.log(`✅ Finished ${file.name}`);
    }

    console.log('\n⏳ Configuring Realtime Publication...');
    const realtimeSql = `
      -- Create publication if not exists
      do $$
      begin
        if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
          create publication supabase_realtime;
        end if;
      end $$;

      -- Add public.vehicles to realtime replication
      do $$
      begin
        if not exists (
          select 1 from pg_publication_rel pr 
          join pg_class c on pr.prrelid = c.oid 
          join pg_namespace n on c.relnamespace = n.oid 
          where pr.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
          and n.nspname = 'public' and c.relname = 'vehicles'
        ) then
          alter publication supabase_realtime add table public.vehicles;
        end if;

        -- Add public.alerts to realtime replication
        if not exists (
          select 1 from pg_publication_rel pr 
          join pg_class c on pr.prrelid = c.oid 
          join pg_namespace n on c.relnamespace = n.oid 
          where pr.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
          and n.nspname = 'public' and c.relname = 'alerts'
        ) then
          alter publication supabase_realtime add table public.alerts;
        end if;
      end $$;

      -- Enforce FULL replica identity for vehicles and alerts to send updates correctly
      alter table public.vehicles replica identity full;
      alter table public.alerts replica identity full;
    `;
    await client.query(realtimeSql);
    console.log('✅ Realtime Publication configured.');

    console.log('\n⏳ Granting table privileges to anon and authenticated roles...');
    const grantsSql = `
      grant usage on schema public to anon, authenticated;
      grant select on all tables in schema public to anon, authenticated;
      grant insert, update, delete on all tables in schema public to authenticated;
      grant usage, select on all sequences in schema public to anon, authenticated;
    `;
    await client.query(grantsSql);
    console.log('✅ Privileges granted.');

    console.log('\n🎉 Supabase backend setup complete!');
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
