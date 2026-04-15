import { useMemo } from 'react';
import { Alert, Button, Card, Col, List, Row, Space, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { HealthMetricLabels, type HealthMetric, type HealthMetricTypeValue } from '@ifly-medical/shared';
import { useMedications } from '../api/medications';
import { useVisits } from '../api/visits';
import { useMetrics } from '../api/metrics';
import { QUICK_PROMPTS } from '../constants/chat';

const { Paragraph, Text, Title } = Typography;

function renderLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
      <Spin />
    </div>
  );
}

function renderError() {
  return (
    <Alert
      type="error"
      showIcon
      message="加载失败"
      description="数据加载失败，请刷新页面重试"
    />
  );
}

function getLatestMetrics(metrics: HealthMetric[]) {
  const latestMetricsMap = new Map<HealthMetricTypeValue, HealthMetric>();
  for (const metric of metrics) {
    if (!latestMetricsMap.has(metric.type)) {
      latestMetricsMap.set(metric.type, metric);
    }
  }
  return Array.from(latestMetricsMap.values());
}

function truncateDiagnosis(text?: string) {
  if (!text) return '—';
  return text.length > 30 ? `${text.slice(0, 30)}...` : text;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const medicationsQuery = useMedications(1, 5, true);
  const visitsQuery = useVisits(1, 3);
  const metricsQuery = useMetrics(1, 50);

  const latestMetrics = useMemo(
    () => getLatestMetrics(metricsQuery.data?.data ?? []),
    [metricsQuery.data?.data]
  );

  function openChat(prompt: string) {
    window.dispatchEvent(new CustomEvent('open-chat', { detail: prompt }));
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          健康概览
        </Title>
        <Text type="secondary">聚合查看当前用药、最近就诊、健康指标和 AI 问答入口。</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="当前用药"
            extra={<Button type="link" onClick={() => navigate('/medications')}>查看全部</Button>}
          >
            {medicationsQuery.isLoading ? (
              renderLoading()
            ) : medicationsQuery.isError ? (
              renderError()
            ) : (medicationsQuery.data?.data.length ?? 0) === 0 ? (
              <Text type="secondary">暂无正在服用的药物</Text>
            ) : (
              <List
                dataSource={medicationsQuery.data?.data}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{item.name}</Text>}
                      description={`${item.dosage ?? '剂量未填写'} · ${item.frequency ?? '频率未填写'}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="最近就诊"
            extra={<Button type="link" onClick={() => navigate('/visits')}>查看全部</Button>}
          >
            {visitsQuery.isLoading ? (
              renderLoading()
            ) : visitsQuery.isError ? (
              renderError()
            ) : (visitsQuery.data?.data.length ?? 0) === 0 ? (
              <Text type="secondary">暂无就诊记录</Text>
            ) : (
              <List
                dataSource={visitsQuery.data?.data}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={dayjs(item.visitDate).format('YYYY-MM-DD')}
                      description={
                        <Space direction="vertical" size={2}>
                          <Text>{[item.hospital, item.department].filter(Boolean).join(' · ')}</Text>
                          <Text type="secondary">{truncateDiagnosis(item.diagnosis)}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="健康指标快照"
            extra={<Button type="link" onClick={() => navigate('/metrics')}>查看全部</Button>}
          >
            {metricsQuery.isLoading ? (
              renderLoading()
            ) : metricsQuery.isError ? (
              renderError()
            ) : latestMetrics.length === 0 ? (
              <Text type="secondary">暂无健康指标记录</Text>
            ) : (
              <List
                dataSource={latestMetrics}
                renderItem={(item) => {
                  const isAbnormal = item.status === 'abnormal';
                  return (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <Text strong>{HealthMetricLabels[item.type] || item.type}</Text>
                          <Tag color={isAbnormal ? 'error' : 'success'}>
                            {isAbnormal ? '异常' : '正常'}
                          </Tag>
                        </div>
                        <Paragraph
                          style={{
                            margin: '8px 0 0',
                            color: isAbnormal ? '#cf1322' : undefined,
                          }}
                        >
                          {item.value} {item.unit ?? ''}
                        </Paragraph>
                      </div>
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="AI 健康问答">
            <Text type="secondary">点击问题，AI 健康助手为您解答</Text>
            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
              {QUICK_PROMPTS.map((prompt) => (
                <Button key={prompt} type="default" block onClick={() => openChat(prompt)}>
                  {prompt}
                </Button>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
