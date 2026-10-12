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

/** 面板块详情：用途、恢复后的效果、以及不可恢复时的原因。 */
export interface FacilityInfo {
  /** 这一项是做什么的 */
  role: string;
  /** 恢复之后能得到什么 */
  effect: string;
  /** 当前不可恢复、或不在本阶段可恢复范围时的说明 */
  blocked?: string;
}

export const FACILITY_INFO: Record<FacilityKey, FacilityInfo> = {
  舰桥: {
    role: '飞船的控制与情报中枢，也是渡鸦接入系统、接收指令的地方。',
    effect: '已投入运行，无需恢复。',
  },
  转化装置: {
    role: '把矿机采到的矿物转成普通能量，是整条产业线的入口。',
    effect: '已投入运行，无需恢复。',
  },
  休眠舱: {
    role: '渡鸦的本体封存于此，她只把投影留在外面。',
    effect: '已投入运行，无需恢复。',
  },
  矿机机库: {
    role: '矿机停放、充能与检修的地方。',
    effect: '已投入运行，无需恢复。',
  },
  工兵库: {
    role: '预制兵员的装配与出库设施，可以产出希灵工兵。',
    effect: '恢复后即可启动流水线，产出通用的希灵工兵。',
    blocked: '需要「自检与自修」先恢复，且所需能量明显高于前面各项。',
  },
  武器系统: {
    role: '这艘登陆艇本身装有武器系统。',
    effect: '本阶段无法恢复。',
    blocked: '所需能量远超当前水平，现在既点不亮，也打不出任何东西。',
  },
  居住舱段: {
    role: '长期驻留所需的居住与生活区域。',
    effect: '恢复后可以在船内长期停留，不必再靠随身物资撑。',
  },
  医疗舱: {
    role: '伤势处理与基础治疗。',
    effect: '恢复后可以处理伤口与伤病。',
  },
  传感器阵列: {
    role: '对外的探测与感知系统。',
    effect: '恢复后可以感知飞船周边的动静，提前发现接近的人或物。',
  },
  引擎维修舱: {
    role: '引擎相关部件与舰体结构的维修设施。',
    effect: '恢复后是短距航行的前置条件。',
  },
  货舱: {
    role: '物资与矿物的存放空间。',
    effect: '恢复后可以储存更多采出的矿物。',
  },
  自检自修: {
    role: '让飞船自行检测损伤并执行修补的模式。',
    effect: '恢复后飞船可自行执行检修，是整条产业线的枢纽，也是工兵库的前置条件。',
    blocked: '需要大量能量与多项前置设施，是产业线上最重的一步。',
  },
  跃迁核心: {
    role: '跨星系航行所必需的核心。',
    effect: '本阶段无法恢复。',
    blocked: '需要幽能。幽能无法由矿物转化取得，只要还在地球上，这一步就无法推进。',
  },
};

/** 返回该项恢复所需的能量与矿物文案，供详情面板显示。 */
export function requirementText(key: FacilityKey): string {
  const state = FACILITY_COST[key];
  if (state === 'none') return '本阶段不适用';
  return `${RECOVER_ENERGY_COST} 点普通能量 ＋ ${RECOVER_MINERAL_COST[state]} 点${state}`;
}

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
