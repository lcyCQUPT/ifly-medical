import { useEffect } from 'react';
import { Form, Select, InputNumber, Input, DatePicker, Button, Space } from 'antd';
import dayjs from 'dayjs';
import {
  HealthMetricType,
  HealthMetricLabels,
  HEALTH_METRIC_DEFAULT_UNITS,
  HEALTH_METRIC_UNIT_OPTIONS,
  type HealthMetricTypeValue,
} from '@ifly-medical/shared';
import { useCreateMetric, type MetricInput } from '../api/metrics';
import { useVisits } from '../api/visits';
import { getErrorMessage } from '../utils/error';
import { notifyError } from '../utils/message';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MetricForm({ onSuccess, onCancel }: Props) {
  const [form] = Form.useForm();
  const createMetric = useCreateMetric();
  const { data: visitsData } = useVisits(1, 200);

  const selectedType = Form.useWatch('type', form) as HealthMetricTypeValue | undefined;

  useEffect(() => {
    if (selectedType && HEALTH_METRIC_DEFAULT_UNITS[selectedType]) {
      form.setFieldsValue({ unit: HEALTH_METRIC_DEFAULT_UNITS[selectedType] });
    }
  }, [selectedType, form]);

  function handleFinish(values: {
    type: HealthMetricTypeValue;
    value: number;
    unit?: string;
    recordedAt: dayjs.Dayjs;
    visitId?: number;
    notes?: string;
  }) {
    const data: MetricInput = {
      type: values.type,
      value: values.value,
      unit: values.unit ?? null,
      recordedAt: values.recordedAt.toISOString(),
      visitId: values.visitId ?? null,
      notes: values.notes ?? null,
    };

    createMetric.mutate(data, {
      onSuccess,
      onError: (error) => notifyError(getErrorMessage(error, '新建健康指标失败')),
    });
  }

  const typeOptions = Object.values(HealthMetricType).map((t) => ({
    value: t,
    label: HealthMetricLabels[t] || t,
  }));

  const unitOptions = selectedType ? HEALTH_METRIC_UNIT_OPTIONS[selectedType] || [] : [];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ recordedAt: dayjs() }}
    >
      <Form.Item
        name="type"
        label="指标类型"
        rules={[{ required: true, message: '请选择指标类型' }]}
      >
        <Select placeholder="请选择" options={typeOptions} />
      </Form.Item>
      <Form.Item
        name="value"
        label="数值"
        rules={[{ required: true, message: '请输入数值' }]}
      >
        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="请输入数值" />
      </Form.Item>
      <Form.Item name="unit" label="单位">
        <Select
          placeholder="请选择单位"
          options={unitOptions}
          disabled={!selectedType}
        />
      </Form.Item>
      <Form.Item
        name="recordedAt"
        label="记录时间"
        rules={[{ required: true, message: '请选择记录时间' }]}
      >
        <DatePicker showTime style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="visitId"
        label="关联就诊记录"
        extra="可选。支持搜索；如找不到对应记录，可先在就诊记录页面新增。"
      >
        <Select
          allowClear
          showSearch
          optionFilterProp="children"
          placeholder="可选"
          loading={!visitsData}
          filterOption={(input, option) =>
            String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {visitsData?.data.map((v) => (
            <Select.Option key={v.id} value={v.id}>
              {dayjs(v.visitDate).format('YYYY-MM-DD')} - {v.hospital}{v.department ? ` (${v.department})` : ''}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="notes" label="备注">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={createMetric.isPending}>
            创建
          </Button>
          <Button onClick={onCancel} disabled={createMetric.isPending}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
