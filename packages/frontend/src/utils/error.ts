import { isAxiosError } from 'axios';
import { ZodError } from 'zod';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (isAxiosError<{ error?: string }>(error)) {
    if (!error.response) {
      return '网络连接失败，请检查网络';
    }

    const serverMessage = error.response.data?.error;
    if (serverMessage) {
      return serverMessage;
    }

    const status = error.response.status;
    if (status === 400) return '请求参数有误';
    if (status === 401) return '登录已过期，请重新登录';
    if (status === 403) return '无权限执行此操作';
    if (status === 404) return '数据不存在';
    if (status === 503) return '服务暂时不可用';
    if (status >= 500) return '服务器错误，请稍后重试';
  }

  return fallback;
}
