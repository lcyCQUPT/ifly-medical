import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Visit, Attachment, VisitCreateInput, VisitUpdateInput } from '@ifly-medical/shared';
import { visitCreateSchema, visitUpdateSchema } from '@ifly-medical/shared';
import http from './http';

export type VisitInput = VisitCreateInput;

interface VisitsResponse {
  data: Visit[];
  total: number;
}

async function fetchVisits(page: number, limit: number): Promise<VisitsResponse> {
  const res = await http.get<VisitsResponse>('/api/visits', { params: { page, limit } });
  return res.data;
}

export function useVisits(page: number, limit = 10) {
  return useQuery({
    queryKey: ['visits', page, limit],
    queryFn: () => fetchVisits(page, limit),
    staleTime: 60 * 1000,
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VisitInput) =>
      http.post<Visit>('/api/visits', visitCreateSchema.parse(data)).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VisitUpdateInput> }) =>
      http.put<Visit>(`/api/visits/${id}`, visitUpdateSchema.parse(data)).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      http.delete<{ success: boolean }>(`/api/visits/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, filename }: { id: number; filename: string }) =>
      http
        .delete<{ success: boolean }>(`/api/visits/${id}/attachments/${encodeURIComponent(filename)}`)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const form = new FormData();
      form.append('file', file);
      return http
        .post<{ data: Attachment }>(`/api/visits/${id}/attachments`, form)
        .then((r) => r.data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}
