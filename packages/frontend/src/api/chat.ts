import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChatMessage, ChatSession } from '@ifly-medical/shared';

export type { ChatMessage, ChatSession };

export function useSessions() {
  return useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: () => axios.get<ChatSession[]>('/api/chat/history').then((r) => r.data),
  });
}

export function useSessionMessages(sessionId?: string) {
  return useQuery<ChatMessage[]>({
    queryKey: ['chat-messages', sessionId],
    queryFn: () =>
      axios.get<ChatMessage[]>(`/api/chat/history/${sessionId}`).then((r) => r.data),
    enabled: !!sessionId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { sessionId: string; content: string }) =>
      axios
        .post<{ reply: string; sessionId: string }>('/api/chat', data)
        .then((r) => r.data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      axios.delete(`/api/chat/history/${sessionId}`).then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}
