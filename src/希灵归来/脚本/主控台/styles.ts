export const CONSOLE_STYLE = `
.re0c-root, .re0c-root *, .re0c-root *::before, .re0c-root *::after {
  box-sizing: border-box;
}

.re0c-root {
  --c-void: #060b12;
  --c-panel: #0b1420;
  --c-panel-2: #101c2b;
  --c-edge: #1e3a52;
  --c-text: #cfe0ef;
  --c-dim: #6f8699;
  --c-signal: #4fc3e8;
  --c-warn: #d8a13c;
  --c-ok: #56b48a;
  --c-bad: #c0563f;
  --font-console: 'Consolas', 'Courier New', 'Microsoft YaHei', monospace;
  font-family: var(--font-console);
  color: var(--c-text);
  line-height: 1.45;
  font-size: 13px;
}

.re0c-orb {
  position: fixed;
  z-index: 2147483000;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border: 1px solid var(--c-edge);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #14304a 0%, #0a1523 70%, #060b12 100%);
  color: var(--c-signal);
  cursor: grab;
  user-select: none;
  touch-action: none;
  box-shadow: 0 0 0 1px rgba(79, 195, 232, 0.18), 0 6px 20px rgba(0, 0, 0, 0.55);
  transition: box-shadow 0.2s ease, transform 0.12s ease;
}

.re0c-orb:hover {
  box-shadow: 0 0 0 1px rgba(79, 195, 232, 0.45), 0 0 18px rgba(79, 195, 232, 0.25), 0 6px 22px rgba(0, 0, 0, 0.6);
}

.re0c-orb.is-dragging {
  cursor: grabbing;
  transform: scale(1.06);
}

.re0c-orb svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: square;
}

.re0c-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147482999;
  display: none;
  background: rgba(3, 7, 12, 0.88);
  backdrop-filter: blur(2px);
}

.re0c-overlay.is-open {
  display: block;
}

.re0c-frame {
  position: absolute;
  inset: 3vh 3vw;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--c-edge);
  background: var(--c-void);
  background-image:
    linear-gradient(rgba(79, 195, 232, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 195, 232, 0.055) 1px, transparent 1px);
  background-size: 22px 22px, 22px 22px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.7), inset 0 0 60px rgba(9, 24, 40, 0.9);
  overflow: hidden;
}

.re0c-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--c-edge);
  background: linear-gradient(180deg, rgba(16, 28, 43, 0.95), rgba(11, 20, 32, 0.95));
}

.re0c-title {
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--c-signal);
}

.re0c-sub {
  font-size: 11.5px;
  color: var(--c-dim);
  letter-spacing: 1px;
}

.re0c-spacer {
  flex: 1;
}

.re0c-close {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1px solid var(--c-edge);
  background: transparent;
  color: var(--c-dim);
  cursor: pointer;
}

.re0c-close:hover {
  color: var(--c-signal);
  border-color: var(--c-signal);
}

.re0c-close svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}

.re0c-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.re0c-body::-webkit-scrollbar {
  width: 8px;
}

.re0c-body::-webkit-scrollbar-thumb {
  background: var(--c-edge);
}

.re0c-body::-webkit-scrollbar-track {
  background: transparent;
}

.re0c-section {
  border: 1px solid var(--c-edge);
  background: rgba(11, 20, 32, 0.72);
}

.re0c-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-bottom: 1px solid var(--c-edge);
  background: rgba(16, 28, 43, 0.85);
  font-size: 12px;
  letter-spacing: 1.5px;
  color: var(--c-signal);
}

.re0c-section-head::before {
  content: '';
  width: 4px;
  height: 12px;
  background: var(--c-signal);
}

.re0c-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
}

.re0c-cell {
  padding: 8px 10px;
  border-right: 1px solid rgba(30, 58, 82, 0.6);
  border-bottom: 1px solid rgba(30, 58, 82, 0.6);
}

.re0c-cell-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  font-size: 11.5px;
  color: var(--c-dim);
  margin-bottom: 5px;
}

.re0c-cell-value {
  color: var(--c-text);
  font-size: 13px;
}

.re0c-meter {
  position: relative;
  height: 5px;
  background: #0a121c;
  border: 1px solid rgba(30, 58, 82, 0.8);
  overflow: hidden;
}

.re0c-meter i {
  position: absolute;
  inset: 0 auto 0 0;
  display: block;
  background: var(--c-signal);
}

.re0c-meter.is-empty i {
  background: var(--c-bad);
}

.re0c-facility-list {
  display: block;
}

.re0c-facility {
  border-bottom: 1px solid rgba(30, 58, 82, 0.55);
}

.re0c-facility:last-child {
  border-bottom: none;
}

.re0c-facility-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.re0c-facility-row:hover {
  background: rgba(79, 195, 232, 0.07);
  box-shadow: inset 2px 0 0 var(--c-signal);
}

.re0c-facility-row:focus-visible {
  outline: 1px solid var(--c-signal);
  outline-offset: -1px;
  background: rgba(79, 195, 232, 0.07);
}

.re0c-facility.is-open > .re0c-facility-row {
  background: rgba(79, 195, 232, 0.1);
  box-shadow: inset 2px 0 0 var(--c-signal);
}

.re0c-chevron {
  flex: none;
  width: 12px;
  height: 12px;
  color: var(--c-dim);
  transition: transform 0.18s ease, color 0.18s ease;
}

.re0c-chevron svg {
  width: 12px;
  height: 12px;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: square;
}

.re0c-facility.is-open .re0c-chevron {
  transform: rotate(180deg);
  color: var(--c-signal);
}

.re0c-facility.is-actionable .re0c-facility-name {
  color: var(--c-warn);
}

.re0c-facility-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.re0c-detail {
  padding: 2px 12px 12px 32px;
  animation: re0c-slide 0.18s ease;
}

.re0c-detail[hidden] {
  display: none;
}

.re0c-detail-kv {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 0;
  margin: 0;
  border-top: 1px dashed rgba(30, 58, 82, 0.7);
}

.re0c-detail-kv dt,
.re0c-detail-kv dd {
  margin: 0;
  padding: 6px 0;
  font-size: 11.5px;
  border-bottom: 1px solid rgba(30, 58, 82, 0.35);
}

.re0c-detail-kv dt {
  color: var(--c-dim);
}

.re0c-detail-kv dd {
  color: var(--c-text);
}

.re0c-detail-foot {
  display: flex;
  justify-content: flex-end;
  padding-top: 9px;
}

.re0c-detail-foot:empty {
  display: none;
}

.re0c-pulse {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: var(--c-signal);
  animation: re0c-pulse 2.4s ease-in-out infinite;
}

@keyframes re0c-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(79, 195, 232, 0.5); }
  50% { opacity: 0.45; box-shadow: 0 0 0 5px rgba(79, 195, 232, 0); }
}

@keyframes re0c-slide {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.re0c-cell-value.is-up {
  animation: re0c-up 1.1s ease;
}

.re0c-cell-value.is-down {
  animation: re0c-down 1.1s ease;
}

@keyframes re0c-up {
  0% { color: var(--c-ok); transform: translateY(-3px); }
  100% { color: var(--c-text); transform: translateY(0); }
}

@keyframes re0c-down {
  0% { color: var(--c-bad); transform: translateY(3px); }
  100% { color: var(--c-text); transform: translateY(0); }
}

.re0c-tag {
  flex: none;
  font-size: 11px;
  padding: 1px 7px;
  border: 1px solid currentColor;
  letter-spacing: 0.5px;
}

.is-run { color: var(--c-ok); }
.is-ready { color: var(--c-warn); }
.is-idle { color: var(--c-dim); }
.is-lost { color: var(--c-bad); }

.re0c-action {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border: 1px solid var(--c-warn);
  background: transparent;
  color: var(--c-warn);
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
}

.re0c-action:hover:not(:disabled) {
  background: var(--c-warn);
  color: var(--c-void);
}

.re0c-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.re0c-action svg {
  width: 11px;
  height: 11px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}

.re0c-kv {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 0;
}

.re0c-kv dt,
.re0c-kv dd {
  margin: 0;
  padding: 7px 10px;
  border-bottom: 1px solid rgba(30, 58, 82, 0.55);
}

.re0c-kv dt {
  color: var(--c-dim);
  font-size: 11.5px;
  border-right: 1px solid rgba(30, 58, 82, 0.55);
}

.re0c-note {
  padding: 8px 10px;
  color: var(--c-dim);
  font-size: 11.5px;
}

.re0c-state {
  padding: 24px 14px;
  text-align: center;
  color: var(--c-dim);
  letter-spacing: 1px;
}

@media (max-width: 640px) {
  .re0c-frame {
    inset: 0;
  }

  .re0c-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .re0c-kv {
    grid-template-columns: 84px 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .re0c-root * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;
