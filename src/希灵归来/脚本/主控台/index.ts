import { ConsoleData, EMPTY_DATA, normalize } from './model';
import { CONSOLE_STYLE } from './styles';
import { ConsoleShell, createShell } from './ui';

/** 事件监听在脚本 iframe 与宿主窗口之间做兼容查找。 */
function hostWindow(): Window {
  try {
    if (window.parent && window.parent !== window) return window.parent;
  } catch {
    /* 跨域时回退到自身 */
  }
  return window;
}

function bindEvent(handler: (...args: unknown[]) => void) {
  const candidates = [window, hostWindow()] as unknown as Array<Record<string, unknown>>;
  for (const target of candidates) {
    const fn = target.eventOn;
    if (typeof fn === 'function') {
      (fn as (name: string, cb: (...args: unknown[]) => void) => void).call(target, 'mag_variable_update_ended', handler);
      return true;
    }
  }
  return false;
}

function readStatData(): unknown {
  const options = { type: 'message', message_id: 'latest' } as never;
  try {
    if (typeof Mvu !== 'undefined' && typeof Mvu.getMvuData === 'function') {
      const data = Mvu.getMvuData(options) as { stat_data?: unknown } | undefined;
      if (data && typeof data.stat_data === 'object') return data.stat_data;
    }
  } catch {
    /* 回退到 getVariables */
  }
  try {
    const variables = getVariables(options) as { stat_data?: unknown } | undefined;
    if (variables && typeof variables.stat_data === 'object') return variables.stat_data;
  } catch {
    /* 变量尚未初始化 */
  }
  return null;
}

function injectStyle(doc: Document) {
  const id = 'xiling-console-style';
  if (doc.getElementById(id)) return;
  const style = doc.createElement('style');
  style.id = id;
  style.textContent = CONSOLE_STYLE;
  doc.head.appendChild(style);
}

$(async () => {
  await waitGlobalInitialized('Mvu');

  const doc = hostWindow().document;
  injectStyle(doc);

  const shell: ConsoleShell = createShell();
  shell.mount(doc);

  function refresh() {
    const statData = readStatData();
    const data: ConsoleData = statData ? normalize(statData) : EMPTY_DATA;
    shell.update(data);
  }

  refresh();
  bindEvent(refresh);
});
