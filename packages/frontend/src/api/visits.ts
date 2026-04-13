import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Visit } from '@ifly-medical/shared';

export interface VisitInput {
  visitDate: string;
  hospital: string;
  department?: string | null;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
  doctorAdvice?: string | null;
  notes?: string | null;
}

interface VisitsResponse {
  data: Visit[];
  total: number;
}

async function fetchVisits(page: number, limit: number): Promise<VisitsResponse> {
  const res = await axios.get<VisitsResponse>('/api/visits', { params: { page, limit } });
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
      axios.post<Visit>('/api/visits', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VisitInput> }) =>
      axios.put<Visit>(`/api/visits/${id}`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      axios.delete<{ success: boolean }>(`/api/visits/${id}`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}
