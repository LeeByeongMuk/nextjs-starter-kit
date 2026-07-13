#!/usr/bin/env node
// npm run setup — 의존성 + 벤더링 에이전트 스킬 설치
// 모든 명령어는 하드코딩된 빌드 스크립트 (사용자 입력 없음)

import { execFileSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });

const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const title = (step, msg) => console.log(`\n${cyan(`[${step}]`)} ${msg}`);

title('1/2', '의존성 설치');
run('npm', ['install']);

title('2/2', '벤더링 에이전트 스킬 (.agents/skills)');
const skills = [
  'vercel-react-best-practices',
  'vercel-composition-patterns',
  'web-design-guidelines',
];
for (const skill of skills) {
  try {
    run('npx', [
      '-y',
      'skills',
      'add',
      'vercel-labs/agent-skills',
      '--skill',
      skill,
      '--yes',
    ]);
  } catch {
    console.log(`  → ${skill} 설치 실패 (건너뜀)`);
  }
}

console.log('\n\x1b[32m설정 완료!\x1b[0m');
