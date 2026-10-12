/** 主控台读取的变量结构：与角色卡根目录 schema.ts 保持一致。 */

export type FacilityState = '运行中' | '未恢复' | '已恢复' | '已损毁';

export const FACILITY_KEYS = [
  '舰桥',
  '转化装置',
  '休眠舱',
  '矿机机库',
  '工兵库',
  '武器系统',
  '居住舱段',
  '医疗舱',
  '传感器阵列',
  '引擎维修舱',
  '货舱',
  '自检自修',
  '跃迁核心',
] as const;

export type FacilityKey = (typeof FACILITY_KEYS)[number];

export const FACILITY_LABELS: Record<FacilityKey, string> = {
  舰桥: '舰桥控制台',
  转化装置: '矿物转化装置',
  休眠舱: '休眠舱',
  矿机机库: '矿机机库',
  工兵库: '工兵库',
  武器系统: '武器系统',
  居住舱段: '居住舱段',
  医疗舱: '医疗舱',
  传感器阵列: '传感器阵列',
  引擎维修舱: '引擎与结构维修舱',
  货舱: '货舱',
  自检自修: '自检与自修',
  跃迁核心: '跃迁核心',
};

/** 恢复一项设施所需的矿物类别。武器系统与跃迁核心在本阶段不可恢复。 */
export type FacilityCost = '普通矿物' | '导能晶体' | '高密度矿石' | 'none';

export const FACILITY_COST: Record<FacilityKey, FacilityCost> = {
  舰桥: 'none',
  转化装置: 'none',
  休眠舱: 'none',
  矿机机库: 'none',
  工兵库: '高密度矿石',
  武器系统: 'none',
  居住舱段: '导能晶体',
  医疗舱: '导能晶体',
  传感器阵列: '高密度矿石',
  引擎维修舱: '高密度矿石',
  货舱: '普通矿物',
  自检自修: '高密度矿石',
  跃迁核心: 'none',
};

export interface ConsoleData {
  minerals: {
    common: number;
    crystal: number;
    dense: number;
  };
  energy: number;
  eidolon: number;
  facilities: Record<FacilityKey, FacilityState>;
  ready: boolean;
}

export const EMPTY_DATA: ConsoleData = {
  minerals: { common: 0, crystal: 0, dense: 0 },
  energy: 0,
  eidolon: 0,
  facilities: {
    舰桥: '未恢复',
    转化装置: '未恢复',
    休眠舱: '未恢复',
    矿机机库: '未恢复',
    工兵库: '未恢复',
    武器系统: '未恢复',
    居住舱段: '未恢复',
    医疗舱: '未恢复',
    传感器阵列: '未恢复',
    引擎维修舱: '未恢复',
    货舱: '未恢复',
    自检自修: '未恢复',
    跃迁核心: '未恢复',
  },
  ready: false,
};

/** 单次恢复的固定能量消耗。 */
export const RECOVER_ENERGY_COST = 5;

/** 各类矿物恢复一项设施所需的准备量。 */
export const RECOVER_MINERAL_COST: Record<Exclude<FacilityCost, 'none'>, number> = {
  普通矿物: 20,
  导能晶体: 10,
  高密度矿石: 5,
};

export function numberAt(source: unknown, fallback = 0): number {
  const value = Number(source);
  return Number.isFinite(value) ? value : fallback;
}

export function stateAt(source: unknown): FacilityState {
  return source === '运行中' || source === '已恢复' || source === '已损毁' ? source : '未恢复';
}

/** 从 Mvu 的 stat_data 归一化为界面所需的形状，容忍字段缺失。 */
export function normalize(statData: unknown): ConsoleData {
  const root = (statData && typeof statData === 'object' ? statData : {}) as Record<string, unknown>;
  const facilitiesRaw = (root.设施状态 && typeof root.设施状态 === 'object' ? root.设施状态 : {}) as Record<
    string,
    unknown
  >;

  const facilities = {} as Record<FacilityKey, FacilityState>;
  FACILITY_KEYS.forEach(key => {
    facilities[key] = stateAt(facilitiesRaw[key]);
  });

  return {
    minerals: {
      common: numberAt(root.普通矿物),
      crystal: numberAt(root.导能晶体),
      dense: numberAt(root.高密度矿石),
    },
    energy: numberAt(root.普通能量),
    eidolon: numberAt(root.幽能),
    facilities,
    ready: true,
  };
}

export interface RecoverPlan {
  key: FacilityKey;
  label: string;
  command: string;
}

/**
 * 判断某项设施此刻能否恢复：
 * 未恢复 + 能量足够 + 对应矿物到位；工兵库额外要求自检与自修已完成。
 */
export function recoverPlan(data: ConsoleData, key: FacilityKey): RecoverPlan | null {
  if (data.facilities[key] !== '未恢复') return null;
  if (data.energy < RECOVER_ENERGY_COST) return null;

  const cost = FACILITY_COST[key];
  if (cost === 'none') return null;

  if (cost === '普通矿物' && data.minerals.common < RECOVER_MINERAL_COST.普通矿物) return null;
  if (cost === '导能晶体' && data.minerals.crystal < RECOVER_MINERAL_COST.导能晶体) return null;
  if (cost === '高密度矿石') {
    if (key === '工兵库' && data.facilities.自检自修 !== '已恢复') return null;
    if (data.minerals.dense < RECOVER_MINERAL_COST.高密度矿石) return null;
  }

  return { key, label: FACILITY_LABELS[key], command: `启动恢复：${FACILITY_LABELS[key]}` };
}
