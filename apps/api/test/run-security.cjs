const {spawnSync}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');
process.chdir(path.join(__dirname,'..'));
const env={...process.env,DATABASE_URL:'postgresql://postgres:postgres@localhost:5433/aura_security_regression?schema=public'};
function run(command,args){const r=spawnSync(command,args,{env,stdio:'inherit',windowsHide:true});if(r.status!==0)process.exit(r.status||1);}
const exists=spawnSync('docker',['exec','aura-atlas-db','psql','-U','postgres','-d','postgres','-tAc',"SELECT 1 FROM pg_database WHERE datname = 'aura_security_regression'"],{encoding:'utf8',windowsHide:true});
if(exists.status!==0){console.error('Inicia PostgreSQL local con docker compose up -d.');process.exit(1);}
if(exists.stdout.trim()!=='1')run('docker',['exec','aura-atlas-db','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-c','CREATE DATABASE aura_security_regression;']);
run(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy']);
let generatedSchema='';
try{generatedSchema=fs.readFileSync(require.resolve('.prisma/client/schema.prisma',{paths:[path.dirname(require.resolve('@prisma/client'))]}),'utf8');}catch{}
// Prisma formats the copied schema; whitespace alone must not regenerate a locked Windows engine.
const schemaShape=value=>value.replace(/\s+/g,'');
if(schemaShape(generatedSchema)!==schemaShape(fs.readFileSync('prisma/schema.prisma','utf8')))run(process.execPath,['node_modules/prisma/build/index.js','generate']);
run(process.execPath,['node_modules/@nestjs/cli/bin/nest.js','build']);
run(process.execPath,['test/security-regression.cjs']);
