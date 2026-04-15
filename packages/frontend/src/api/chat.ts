import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatMessageCreateSchema, type ChatMessage, type ChatSession } from '@ifly-medical/shared';
import http from './http';
import { getErrorMessage } from '../utils/error';
import { notifyError } from '../utils/message';

export type { ChatMessage, ChatSession };

export function useSessions() {
  return useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: () => http.get<ChatSession[]>('/api/chat/history').then((r) => r.data),
  });
}

export function useSessionMessages(sessionId?: string) {
  return useQuery<ChatMessage[]>({
    queryKey: ['chat-messages', sessionId],
    queryFn: () =>
      http.get<ChatMessage[]>(`/api/chat/history/${sessionId}`).then((r) => r.data),
    enabled: !!sessionId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { sessionId: string; content: string }) =>
      http
        .post<{ reply: string; sessionId: string }>('/api/chat', chatMessageCreateSchema.parse(data))
        .then((r) => r.data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
    onError: (error) => {
      notifyError(getErrorMessage(error, '消息发送失败，请稍后重试'));
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      http.delete(`/api/chat/history/${sessionId}`).then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}
