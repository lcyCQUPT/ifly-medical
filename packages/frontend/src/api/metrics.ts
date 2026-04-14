import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  HealthMetric,
  HealthMetricTypeValue,
  MetricCreateInput,
  PaginatedMetrics,
} from '@ifly-medical/shared';
import { metricCreateSchema } from '@ifly-medical/shared';
import http from './http';

export type MetricInput = MetricCreateInput;

async function fetchMetrics(
  page: number,
  limit: number,
  type?: HealthMetricTypeValue
): Promise<PaginatedMetrics> {
  const params = type ? { page, limit, type } : { page, limit };
  const res = await http.get<PaginatedMetrics>('/api/metrics', { params });
  return res.data;
}

async function fetchMetricTrend(type: HealthMetricTypeValue): Promise<HealthMetric[]> {
  const res = await http.get<HealthMetric[]>(`/api/metrics/trend/${type}`);
  return res.data;
}

export function useMetrics(page: number, limit: number, type?: HealthMetricTypeValue) {
  return useQuery({
    queryKey: ['metrics', page, limit, type],
    queryFn: () => fetchMetrics(page, limit, type),
    staleTime: 60 * 1000,
  });
}

export function useMetricTrend(type: HealthMetricTypeValue | '') {
  return useQuery({
    queryKey: ['metrics', 'trend', type],
    queryFn: () => {
      if (!type) {
        return Promise.resolve([]);
      }
      return fetchMetricTrend(type);
    },
    staleTime: 60 * 1000,
    enabled: !!type,
  });
}

export function useCreateMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MetricInput) =>
      http.post<HealthMetric>('/api/metrics', metricCreateSchema.parse(data)).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}

export function useDeleteMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      http.delete<{ success: boolean }>(`/api/metrics/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}
