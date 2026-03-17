import { writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

async function main() {
  const isRemote = process.argv.includes('--remote');
  console.log(`Seeding User Data (${isRemote ? 'remote' : 'local'})...`);

  const now = Date.now();
  const sqls = [
    "DELETE FROM users;",
    `INSERT INTO users (name, created_at) VALUES ('Alice', ${now}), ('Bob', ${now}), ('Charlie', ${now}), ('David', ${now}), ('Eve', ${now});`
  ];

  const sql = sqls.join('\n');
  const tempFile = path.join(process.cwd(), 'temp_seed.sql');
  writeFileSync(tempFile, sql);

  try {
    const remoteFlag = isRemote ? '--remote' : '--local';
    const configPath = path.resolve(__dirname, '../../../apps/api/wrangler.toml');
    const command = `npx wrangler d1 execute next-hono-d1-template-db ${remoteFlag} --file="${tempFile}" --config="${configPath}"`;
    
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    try {
      unlinkSync(tempFile);
    } catch (e) {}
  }
}

main();
