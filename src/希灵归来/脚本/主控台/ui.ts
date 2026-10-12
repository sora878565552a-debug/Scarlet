import {
  ConsoleData,
  EMPTY_DATA,
  FACILITY_COST,
  FACILITY_INFO,
  FACILITY_KEYS,
  FACILITY_LABELS,
  FacilityKey,
  RECOVER_ENERGY_COST,
  RECOVER_MINERAL_COST,
  recoverPlan,
  requirementText,
} from './model';

const ICON_ORB = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4"/><circle cx="12" cy="12" r="2"/></svg>`;
const ICON_CLOSE = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>`;
const ICON_RECOVER = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v11M2.5 8h11"/></svg>`;
const ICON_CHEVRON = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 6.5l3 3 3-3"/></svg>`;

const ORB_STORAGE_KEY = 'xiling:console:orb:v1';

export interface ConsoleShell {
  readonly element: HTMLElement;
  mount(doc: Document): void;
  update(data: ConsoleData): void;
  open(): void;
  close(): void;
}

interface Point {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readOrbPosition(win: Window): Point | null {
  try {
    const raw = win.localStorage.getItem(ORB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Point;
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeOrbPosition(win: Window, point: Point) {
  try {
    win.localStorage.setItem(ORB_STORAGE_KEY, JSON.stringify(point));
  } catch {
    /* 存储不可用时忽略，仅影响位置记忆 */
  }
}

function stateClass(state: string) {
  if (state === '运行中') return 'is-run';
  if (state === '已恢复') return 'is-ready';
  if (state === '已损毁') return 'is-lost';
  return 'is-idle';
}

/** 创建一个带数值与进度条的资源单元。 */
function resourceCell(label: string, value: number, max: number, key: string): string {
  const ratio = max > 0 ? clamp(value / max, 0, 1) : 0;
  const empty = value <= 0 ? ' is-empty' : '';
  return `
    <div class="re0c-cell">
      <div class="re0c-cell-label"><span>${label}</span><span class="re0c-cell-value" data-role="value">${value}</span></div>
      <div class="re0c-meter${empty}" data-role="meter"><i style="width:${(ratio * 100).toFixed(1)}%"></i></div>
    </div>`;
}

export function createShell(): ConsoleShell {
  const root = document.createElement('div');
  root.className = 're0c-root';

  const orb = document.createElement('button');
  orb.type = 'button';
  orb.className = 're0c-orb';
  orb.title = '飞船主控台';
  orb.setAttribute('aria-label', '打开飞船主控台');
  orb.innerHTML = ICON_ORB;

  const overlay = document.createElement('div');
  overlay.className = 're0c-overlay';
  overlay.innerHTML = `
    <div class="re0c-frame" role="dialog" aria-modal="true" aria-label="飞船主控台">
      <header class="re0c-head">
        <span class="re0c-pulse" aria-hidden="true"></span>
        <span class="re0c-title">飞船主控台</span>
        <span class="re0c-sub" data-role="sub">争斗者级登陆艇</span>
        <span class="re0c-spacer"></span>
        <button type="button" class="re0c-close" data-role="close" aria-label="关闭">${ICON_CLOSE}</button>
      </header>
      <div class="re0c-body" data-role="body"></div>
    </div>`;

  root.appendChild(orb);
  root.appendChild(overlay);

  const body = overlay.querySelector('[data-role="body"]') as HTMLElement;
  const sub = overlay.querySelector('[data-role="sub"]') as HTMLElement;
  const closeButton = overlay.querySelector('[data-role="close"]') as HTMLButtonElement;

  let current: ConsoleData = EMPTY_DATA;
  let previous: ConsoleData | null = null;
  let hostDoc: Document | null = null;
  let hostWin: Window | null = null;
  const expanded = new Set<FacilityKey>();

  function setOpen(open: boolean) {
    overlay.classList.toggle('is-open', open);
    if (open) render();
  }

  /** 数值与上次不同时加一个短暂的闪动，让变化看得见。 */
  function flashClass(value: number, before: number | undefined) {
    if (before === undefined || before === value) return '';
    return value > before ? ' is-up' : ' is-down';
  }

  function render() {
    if (!current.ready) {
      body.innerHTML = `<div class="re0c-state">正在读取飞船数据……</div>`;
      return;
    }

    const before = previous;
    sub.textContent = `争斗者级登陆艇｜第三天区舰队`;

    const cells: Array<[string, number, number, number | undefined]> = [
      ['普通矿物', current.minerals.common, 100, before?.minerals.common],
      ['导能晶体', current.minerals.crystal, 50, before?.minerals.crystal],
      ['高密度矿石', current.minerals.dense, 25, before?.minerals.dense],
      ['普通能量', current.energy, 20, before?.energy],
      ['幽能', current.eidolon, 1, before?.eidolon],
    ];

    const resources = `
      <section class="re0c-section">
        <div class="re0c-section-head">资源库存</div>
        <div class="re0c-grid">
          ${cells
            .map(([label, value, max, prev]) => {
              const base = resourceCell(label, value, max, label);
              const flash = flashClass(value, prev);
              return flash ? base.replace('data-role="value"', `data-role="value" class="re0c-cell-value${flash}"`) : base;
            })
            .join('')}
        </div>
        <div class="re0c-note">点开任意设施可查看用途与恢复需求。单次恢复消耗 ${RECOVER_ENERGY_COST} 点普通能量；幽能无法由矿物转化取得。</div>
      </section>`;

    const facilityRows = FACILITY_KEYS.map(key => {
      const state = current.facilities[key];
      const plan = recoverPlan(current, key);
      const info = FACILITY_INFO[key];
      const isOpen = expanded.has(key);
      const cost = FACILITY_COST[key];
      const reqText = requirementText(key);
      const action = plan
        ? `<button type="button" class="re0c-action" data-role="recover" data-key="${key}">${ICON_RECOVER}<span>启动恢复</span></button>`
        : '';

      const detail = `
        <div class="re0c-detail" ${isOpen ? '' : 'hidden'}>
          <dl class="re0c-detail-kv">
            <dt>用途</dt><dd>${info.role}</dd>
            <dt>恢复效果</dt><dd>${info.effect}</dd>
            <dt>恢复需求</dt><dd>${reqText}</dd>
            ${
              plan
                ? `<dt>当前状态</dt><dd class="is-ready">资源已备齐，可以启动恢复。</dd>`
                : `<dt>当前状态</dt><dd>${info.blocked ? info.blocked : state === '运行中' || state === '已恢复' ? '已投入使用。' : cost === 'none' ? '本阶段不适用。' : '尚未满足恢复条件：需要 ' + reqText + '。'}</dd>`
            }
          </dl>
          <div class="re0c-detail-foot">${action}</div>
        </div>`;

      return `
        <div class="re0c-facility${isOpen ? ' is-open' : ''}${plan ? ' is-actionable' : ''}" data-role="facility" data-key="${key}">
          <div class="re0c-facility-row" data-role="toggle" data-key="${key}" tabindex="0" role="button" aria-expanded="${isOpen}">
            <span class="re0c-chevron" aria-hidden="true">${ICON_CHEVRON}</span>
            <span class="re0c-facility-name">${FACILITY_LABELS[key]}</span>
            <span class="re0c-tag ${stateClass(state)}">${state}</span>
          </div>
          ${detail}
        </div>`;
    }).join('');

    const facilities = `
      <section class="re0c-section">
        <div class="re0c-section-head">设施状态</div>
        <div class="re0c-facility-list">${facilityRows}</div>
      </section>`;

    const ship = `
      <section class="re0c-section">
        <div class="re0c-section-head">舰体概况</div>
        <dl class="re0c-kv">
          <dt>舰级</dt><dd>争斗者级登陆艇</dd>
          <dt>隶属</dt><dd>第三天区舰队（母舰下落不明）</dd>
          <dt>状态</dt><dd>坠毁于地表；一侧装甲破裂，相位护盾停止工作</dd>
          <dt>武装</dt><dd>装有武器系统，所需能量远超当前水平</dd>
          <dt>跃迁</dt><dd>需要幽能，当前无法取得</dd>
        </dl>
      </section>`;

    body.innerHTML = resources + facilities + ship;
    previous = current;

    body.querySelectorAll<HTMLElement>('[data-role="toggle"]').forEach(row => {
      const key = row.dataset.key as FacilityKey;
      const toggle = () => {
        if (expanded.has(key)) expanded.delete(key);
        else expanded.add(key);
        render();
      };
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
    });

    body.querySelectorAll<HTMLButtonElement>('[data-role="recover"]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const key = button.dataset.key as FacilityKey;
        const plan = recoverPlan(current, key);
        if (!plan) return;
        button.disabled = true;
        void requestRecover(plan.command).finally(() => {
          button.disabled = false;
        });
      });
    });
  }

  async function requestRecover(command: string) {
    try {
      await triggerSlash(`/input default="${command}" 发送这条指令即可开始恢复。`);
    } catch {
      if (hostWin && typeof (hostWin as unknown as { toastr?: { error?: (m: string) => void } }).toastr?.error === 'function') {
        (hostWin as unknown as { toastr: { error: (m: string) => void } }).toastr.error('无法打开恢复指令窗口');
      }
    }
  }

  function mount(doc: Document) {
    if (hostDoc === doc) return;
    hostDoc = doc;
    hostWin = doc.defaultView;
    if (!root.isConnected) doc.body.appendChild(root);
    else if (root.ownerDocument !== doc) doc.body.appendChild(root);

    const win = hostWin;
    if (!win) return;

    const size = 52;
    const saved = readOrbPosition(win);
    const bounds = () => ({
      maxX: Math.max(0, win.innerWidth - size - 8),
      maxY: Math.max(0, win.innerHeight - size - 8),
    });
    const margin = bounds();
    const position = saved
      ? { x: clamp(saved.x, 8, margin.maxX), y: clamp(saved.y, 8, margin.maxY) }
      : { x: margin.maxX - 12, y: margin.maxY - 12 };

    function place(point: Point) {
      orb.style.left = `${point.x}px`;
      orb.style.top = `${point.y}px`;
    }
    place(position);

    let dragging = false;
    let moved = false;
    let origin: Point = { x: 0, y: 0 };
    let start: Point = { x: 0, y: 0 };

    orb.addEventListener('pointerdown', event => {
      dragging = true;
      moved = false;
      start = { x: event.clientX, y: event.clientY };
      origin = { x: parseFloat(orb.style.left) || 0, y: parseFloat(orb.style.top) || 0 };
      orb.classList.add('is-dragging');
      orb.setPointerCapture(event.pointerId);
    });

    orb.addEventListener('pointermove', event => {
      if (!dragging) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
      moved = true;
      const limit = bounds();
      const next = { x: clamp(origin.x + dx, 8, limit.maxX), y: clamp(origin.y + dy, 8, limit.maxY) };
      place(next);
    });

    orb.addEventListener('pointerup', event => {
      if (!dragging) return;
      dragging = false;
      orb.classList.remove('is-dragging');
      if (moved) {
        writeOrbPosition(win, { x: parseFloat(orb.style.left) || 0, y: parseFloat(orb.style.top) || 0 });
      } else {
        setOpen(!overlay.classList.contains('is-open'));
      }
      if (orb.hasPointerCapture(event.pointerId)) orb.releasePointerCapture(event.pointerId);
    });

    orb.addEventListener('pointercancel', () => {
      dragging = false;
      orb.classList.remove('is-dragging');
    });

    win.addEventListener('resize', () => {
      const limit = bounds();
      place({
        x: clamp(parseFloat(orb.style.left) || 0, 8, limit.maxX),
        y: clamp(parseFloat(orb.style.top) || 0, 8, limit.maxY),
      });
    });

    closeButton.addEventListener('click', () => setOpen(false));

    overlay.addEventListener('click', event => {
      if (event.target === overlay) setOpen(false);
    });

    doc.addEventListener('keydown', event => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  return {
    element: root,
    mount,
    update(data: ConsoleData) {
      current = data;
      if (overlay.classList.contains('is-open')) render();
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
  };
}
