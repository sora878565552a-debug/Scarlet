<template>
  <div class="terminal">
    <section class="resources" aria-label="飞船资源">
      <div v-for="item in resource_items" :key="item.key" class="resource">
        <span class="resource-label">{{ item.label }}</span>
        <span class="resource-value">{{ store.data[item.key] }}</span>
      </div>
    </section>

    <section class="facilities" aria-label="飞船设施">
      <div v-for="facility in facility_items" :key="facility.key" class="facility">
        <span class="facility-name">{{ facility.label }}</span>
        <span class="facility-state" :class="stateClass(store.data.设施状态[facility.key])">
          {{ store.data.设施状态[facility.key] }}
        </span>
        <button
          v-if="canRecover(facility.key)"
          class="recover"
          type="button"
          :disabled="pending"
          @click="requestRecover(facility)"
        >
          <svg class="recover-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 2.5v11M2.5 8h11" />
          </svg>
          <span>启动恢复</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDataStore } from './store';

type FacilityCategory = '采集与转化' | '生命维持' | '结构与外勤' | '不可用';

const store = useDataStore();
const pending = ref(false);

const resource_items = [
  { key: '普通矿物', label: '普通矿物' },
  { key: '导能晶体', label: '导能晶体' },
  { key: '高密度矿石', label: '高密度矿石' },
  { key: '普通能量', label: '普通能量' },
  { key: '幽能', label: '幽能' },
] as const;

const facility_items: { key: keyof typeof store.data.设施状态; label: string; category: FacilityCategory }[] = [
  { key: '舰桥', label: '舰桥控制台', category: '不可用' },
  { key: '转化装置', label: '矿物转化装置', category: '不可用' },
  { key: '休眠舱', label: '休眠舱', category: '不可用' },
  { key: '矿机机库', label: '矿机机库', category: '不可用' },
  { key: '工兵库', label: '工兵库', category: '结构与外勤' },
  { key: '武器系统', label: '武器系统', category: '不可用' },
  { key: '居住舱段', label: '居住舱段', category: '生命维持' },
  { key: '医疗舱', label: '医疗舱', category: '生命维持' },
  { key: '传感器阵列', label: '传感器阵列', category: '结构与外勤' },
  { key: '引擎维修舱', label: '引擎维修舱', category: '结构与外勤' },
  { key: '货舱', label: '货舱', category: '采集与转化' },
  { key: '自检自修', label: '自检与自修', category: '结构与外勤' },
  { key: '跃迁核心', label: '跃迁核心', category: '不可用' },
];

function stateClass(state: string) {
  if (state === '运行中') return 'is-active';
  if (state === '已恢复') return 'is-recovered';
  if (state === '已损毁') return 'is-lost';
  return 'is-idle';
}

function canRecover(key: keyof typeof store.data.设施状态) {
  const facility = facility_items.find(item => item.key === key);
  if (!facility || store.data.设施状态[key] !== '未恢复') return false;
  if (store.data.普通能量 < 5) return false;

  if (facility.category === '采集与转化') return store.data.普通矿物 >= 20;
  if (facility.category === '生命维持') return store.data.导能晶体 >= 10;
  if (facility.category === '结构与外勤') {
    if (key === '工兵库' && store.data.设施状态.自检自修 !== '已恢复') return false;
    return store.data.高密度矿石 >= 5;
  }
  return false;
}

async function requestRecover(facility: { label: string }) {
  if (pending.value) return;
  pending.value = true;
  try {
    const command = `启动恢复：${facility.label}`;
    await triggerSlash(`/input default="${command}" 确认恢复 ${facility.label}。发送这条指令即可开始。`);
  } catch {
    toastr.error('无法打开恢复指令窗口');
  } finally {
    pending.value = false;
  }
}
</script>

<style lang="scss" scoped>
.terminal {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  border: 1px solid var(--c-ink);
  background: var(--c-panel);
  font-family: var(--font-console);
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--c-ink);
}

.resources {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-bottom: 1px solid var(--c-ink);
}

.resource {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 7px 8px;
  min-width: 0;
  border-right: 1px solid var(--c-steel);
}

.resource:last-child {
  border-right: none;
}

.resource-label {
  font-size: 11px;
  color: var(--c-slate);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-value {
  font-size: 15px;
  font-weight: bold;
  color: var(--c-signal);
}

.facilities {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.facility {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  min-width: 0;
  border-bottom: 1px solid var(--c-steel);
  border-right: 1px solid var(--c-steel);
}

.facility:nth-child(2n) {
  border-right: none;
}

.facility-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.facility-state {
  flex: none;
  font-size: 11.5px;
  padding: 1px 6px;
  border: 1px solid currentColor;
}

.is-active {
  color: var(--c-signal);
}

.is-recovered {
  color: var(--c-ink);
}

.is-idle {
  color: var(--c-slate);
}

.is-lost {
  color: var(--c-warn);
}

.recover {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1px solid var(--c-signal);
  background: transparent;
  color: var(--c-signal);
  font-family: inherit;
  font-size: 11.5px;
  cursor: pointer;
}

.recover:active:not(:disabled) {
  background: var(--c-signal);
  color: var(--c-panel);
}

.recover:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recover:focus-visible {
  outline: 2px solid var(--c-signal);
  outline-offset: 2px;
}

.recover-icon {
  width: 11px;
  height: 11px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: square;
}

@media (max-width: 560px) {
  .resources {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .resource {
    border-bottom: 1px solid var(--c-steel);
  }

  .facilities {
    grid-template-columns: minmax(0, 1fr);
  }

  .facility {
    border-right: none;
  }
}
</style>
