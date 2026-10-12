import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/**
 * 发布前端产物到 web/，供 jsDelivr 从本仓库加载。
 *
 * 用法：pnpm publish:web
 * 流程：构建 → 复制到 web/（ASCII 路径）与 发布/（中文路径）→ 提交并推送。
 * 用 `pnpm publish:web -- --no-push` 可只构建与复制，不提交推送。
 */

const root = process.cwd();
const card = '希灵归来';
const skipPush = process.argv.includes('--no-push');

const artifacts = [
  { from: path.join('dist', card, '界面', '状态栏', 'index.html'), to: ['status-bar', 'index.html'], legacy: ['界面', '状态栏', 'index.html'] },
  { from: path.join('dist', card, '脚本', '主控台', 'index.js'), to: ['console', 'index.js'], legacy: ['脚本', '主控台', 'index.js'] },
  { from: path.join('dist', card, '脚本', '变量结构', 'index.js'), to: ['schema', 'index.js'], legacy: ['脚本', '变量结构', 'index.js'] },
];

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
}

async function write(target, relative, source) {
  const destination = path.join(root, target, ...relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(root, source), destination, { force: true });
  return destination;
}

console.info('[publish] 构建产物…');
run('pnpm', ['build']);

console.info('[publish] 清理旧目录…');
for (const target of ['web', '发布']) {
  await rm(path.join(root, target), { recursive: true, force: true });
}

console.info('[publish] 复制到 web/ 与 发布/…');
for (const artifact of artifacts) {
  const ascii = await write('web', artifact.to, artifact.from);
  const legacy = await write('发布', artifact.legacy, artifact.from);
  console.info(`  ${path.relative(root, ascii)}  |  ${path.relative(root, legacy)}`);
}

if (skipPush) {
  console.info('[publish] 已跳过提交与推送（--no-push）。');
  process.exit(0);
}

console.info('[publish] 提交并推送…');
run('git', ['add', '-A']);
try {
  run('git', ['commit', '-m', 'chore(web): 重新发布界面与脚本产物']);
} catch {
  console.info('[publish] 没有需要提交的改动。');
}
run('git', ['push', 'origin', 'main']);

console.info('[publish] 完成。jsDelivr 地址形如：');
console.info('  https://cdn.jsdelivr.net/gh/sora878565552a-debug/Scarlet@main/web/console/index.js');
