import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import type { HealthMetric, HealthMetricTypeValue } from '@ifly-medical/shared';
import { HealthMetricLabels } from '@ifly-medical/shared';

interface Props {
  data: HealthMetric[];
  type: string;
  loading?: boolean;
}

export function MetricTrendChart({ data, type, loading }: Props) {
  if (loading) {
    return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map((m) => ({
    date: dayjs(m.recordedAt).format('MM-DD'),
    value: m.value,
    fullDate: dayjs(m.recordedAt).format('YYYY-MM-DD HH:mm'),
  }));

  const label = HealthMetricLabels[type as HealthMetricTypeValue] || type;

  return (
    <div style={{ marginTop: 24 }}>
      <h4 style={{ marginBottom: 12 }}>{label}趋势</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" fontSize={12} />
          <YAxis fontSize={12} domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value) => [value ?? '', label]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as { fullDate?: string } | undefined;
              return item?.fullDate || '';
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1890ff"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
