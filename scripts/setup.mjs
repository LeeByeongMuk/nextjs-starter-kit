#!/usr/bin/env node
import { execFileSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Windows의 npm/npx는 .cmd 실행을 위해 shell이 필요하다.
const run = (cmd, args) =>
  execFileSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

run('npm', ['ci']);

if (process.argv.includes('--skills')) {
  const skills = [
    'vercel-react-best-practices',
    'vercel-composition-patterns',
    'web-design-guidelines',
  ];
  const vercelSkillsRef = '1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62';
  run('npx', [
    '-y',
    'skills@1.8.1',
    'add',
    `https://github.com/vercel-labs/agent-skills/tree/${vercelSkillsRef}`,
    ...skills.flatMap(skill => ['--skill', skill]),
    '--yes',
  ]);
  const impeccableRef = 'f2baa414a87d9acf1e21ccf776bfaec0262ad6df';
  run('npx', [
    '-y',
    'skills@1.8.1',
    'add',
    `https://github.com/pbakaus/impeccable/tree/${impeccableRef}/.agents/skills/impeccable`,
    '--skill',
    'impeccable',
    '--agent',
    'codex',
    'claude-code',
    '--yes',
  ]);
}

console.log('설정 완료. npm run mock과 npm run dev를 각각 실행하세요.');
console.log('AI 스킬은 선택 사항입니다: npm run setup -- --skills');
