export const QUICK_PROMPTS = [
  '血压偏高，日常饮食有哪些注意事项？',
  '最近睡眠质量差，有什么改善建议？',
  '我的慢性病用药需要注意什么？',
] as const;

export const pendingPromptStore: { value: string | null } = { value: null };
