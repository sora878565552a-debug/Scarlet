/* eslint-disable */
// @ts-nocheck
// z 与 _ 由 dump_schema.ts 注入为全局变量，用于在本地生成 schema.json。
// 运行期由角色脚本通过 registerMvuSchema 注册同一份 Schema。
export const Schema = z.object({
  普通矿物: z.coerce.number(),
  导能晶体: z.coerce.number(),
  高密度矿石: z.coerce.number(),
  普通能量: z.coerce.number(),
  幽能: z.coerce.number(),
  设施状态: z.object({
    舰桥: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    转化装置: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    休眠舱: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    矿机机库: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    工兵库: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    武器系统: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    居住舱段: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    医疗舱: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    传感器阵列: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    引擎维修舱: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    货舱: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    自检自修: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
    跃迁核心: z.enum(['运行中', '未恢复', '已恢复', '已损毁']),
  }),
});
export type Schema = z.output<typeof Schema>;
