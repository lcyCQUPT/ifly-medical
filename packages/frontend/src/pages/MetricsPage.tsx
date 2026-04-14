import { useState, useMemo } from 'react';
import { Table, Button, Drawer, Descriptions, Popconfirm, Space, Typography, Tag, Segmented, Pagination, Alert } from 'antd';
import { PlusOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { HealthMetric, HealthMetricTypeValue } from '@ifly-medical/shared';
import { HealthMetricType, HealthMetricLabels, getMetricRangeDescription } from '@ifly-medical/shared';
import { useMetrics, useMetricTrend, useDeleteMetric } from '../api/metrics';
import { MetricForm } from '../components/MetricForm';
import { MetricTrendChart } from '../components/MetricTrendChart';
import { getErrorMessage } from '../utils/error';
import { notifyError } from '../utils/message';

type FilterType = 'all' | typeof HealthMetricType[keyof typeof HealthMetricType];

export function MetricsPage() {
  const PAGE_SIZE = 20;
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);

  const type = filter === 'all' ? undefined : filter;
  const { data, isLoading, isError } = useMetrics(page, PAGE_SIZE, type);
  const { data: trendData, isLoading: trendLoading } = useMetricTrend(selectedMetric?.type || '');
  const deleteMetric = useDeleteMetric();

  const columns = useMemo(() => [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v: HealthMetricTypeValue) => <Tag color="blue">{HealthMetricLabels[v] || v}</Tag>,
    },
    {
      title: '数值',
      dataIndex: 'value',
      key: 'value',
      render: (v: number, record: HealthMetric) => {
        const isAbnormal = record.status === 'abnormal';
        return (
          <span style={{ color: isAbnormal ? '#cf1322' : undefined }}>
            {v} {record.unit || ''}
            {isAbnormal && <WarningOutlined style={{ marginLeft: 4 }} />}
          </span>
        );
      },
    },
    {
      title: '记录时间',
      dataIndex: 'recordedAt',
      key: 'recordedAt',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: HealthMetric) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedMetric(record);
            setDrawerOpen(true);
          }}
        >
          查看
        </Button>
      ),
    },
  ], []);

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedMetric(null);
  }

  function handleFilterChange(nextFilter: FilterType) {
    setFilter(nextFilter);
    setPage(1);
  }

  const filterOptions = [
    { label: '全部', value: 'all' },
    ...Object.values(HealthMetricType).map(t => ({
      label: HealthMetricLabels[t] || t,
      value: t,
    })),
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>健康指标</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
          新增记录
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          showIcon
          message="加载失败"
          description="数据加载失败，请刷新页面重试"
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ marginBottom: 16 }}>
        <Segmented
          value={filter}
          onChange={(v) => handleFilterChange(v as FilterType)}
          options={filterOptions}
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data}
        columns={columns}
        pagination={false}
      />
      <Pagination
        current={page}
        total={data?.total ?? 0}
        pageSize={PAGE_SIZE}
        onChange={setPage}
        showSizeChanger={false}
        showTotal={(total) => `共 ${total} 条`}
        style={{ marginTop: 16, textAlign: 'right' }}
      />

      <Drawer
        title={selectedMetric ? '指标详情' : '新增记录'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={520}
        destroyOnClose
      >
        {selectedMetric ? (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="类型">
                <Tag color="blue">{HealthMetricLabels[selectedMetric.type] || selectedMetric.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="数值">
                <span style={{ color: selectedMetric.status === 'abnormal' ? '#cf1322' : undefined }}>
                  {selectedMetric.value} {selectedMetric.unit || ''}
                  {selectedMetric.status === 'abnormal' && (
                    <Tag color="error" style={{ marginLeft: 8 }}>异常</Tag>
                  )}
                </span>
              </Descriptions.Item>
              {selectedMetric.status === 'abnormal' && getMetricRangeDescription(selectedMetric.type) && (
                <Descriptions.Item label="参考范围">
                  <Typography.Text type="secondary">
                    正常范围：{getMetricRangeDescription(selectedMetric.type)}
                  </Typography.Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="记录时间">
                {dayjs(selectedMetric.recordedAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="备注">{selectedMetric.notes ?? '—'}</Descriptions.Item>
            </Descriptions>

            <MetricTrendChart
              data={trendData || []}
              type={selectedMetric.type}
              loading={trendLoading}
            />

            <Space style={{ marginTop: 24 }}>
              <Popconfirm
                title="确定删除该记录？"
                onConfirm={() =>
                  deleteMetric.mutate(selectedMetric.id, {
                    onSuccess: closeDrawer,
                    onError: (error) => notifyError(getErrorMessage(error, '删除记录失败')),
                  })
                }
                okText="删除"
                cancelText="取消"
              >
                <Button danger loading={deleteMetric.isPending}>删除</Button>
              </Popconfirm>
            </Space>
          </>
        ) : (
          <MetricForm onSuccess={closeDrawer} onCancel={closeDrawer} />
        )}
      </Drawer>
    </div>
  );
}
