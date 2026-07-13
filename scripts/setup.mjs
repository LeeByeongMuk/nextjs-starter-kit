#!/usr/bin/env node
// npm run setup — 의존성 설치 + 벤더링 에이전트 스킬 재설치

import { execFileSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Windows에서 npm/npx는 .cmd 셔틀이라 shell 없이 spawn되지 않는다
const run = (cmd, args) =>
  execFileSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

const cyan = s => `\x1b[36m${s}\x1b[0m`;
const title = (step, msg) => console.log(`\n${cyan(`[${step}]`)} ${msg}`);

title('1/2', '의존성 설치');
run('npm', ['install']);

title('2/2', '벤더링 에이전트 스킬 (.agents/skills)');
const skills = [
  'vercel-react-best-practices',
  'vercel-composition-patterns',
  'web-design-guidelines',
];
run('npx', [
  '-y',
  'skills',
  'add',
  'vercel-labs/agent-skills',
  ...skills.flatMap(skill => ['--skill', skill]),
  '--yes',
]);

console.log('\n\x1b[32m설정 완료!\x1b[0m');
