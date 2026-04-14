import { useEffect } from 'react';
import { Form, Input, DatePicker, Switch, Button, Space, Select, InputNumber, Row, Col } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { Medication } from '@ifly-medical/shared';
import {
  MEDICATION_DOSAGE_UNITS,
  MEDICATION_FREQUENCY_PERIODS,
  MEDICATION_FREQUENCY_TIMES,
} from '@ifly-medical/shared';
import { useCreateMedication, useUpdateMedication, type MedicationInput } from '../api/medications';
import { useVisits } from '../api/visits';
import { getErrorMessage } from '../utils/error';
import { notifyError } from '../utils/message';

interface FormValues {
  name: string;
  dosageValue?: number;
  dosageUnit?: string;
  frequencyPeriod?: string;
  frequencyTimes?: string;
  startDate?: Dayjs;
  endDate?: Dayjs;
  isActive: boolean;
  visitId?: number;
  notes?: string;
}

function parseDosage(dosage?: string): { value?: number; unit?: string } {
  if (!dosage) return {};
  const match = dosage.match(/^([\d.]+)(.+)$/);
  if (match) {
    return { value: parseFloat(match[1]), unit: match[2] };
  }
  return { unit: dosage };
}

function parseFrequency(frequency?: string): { period?: string; times?: string } {
  if (!frequency) return {};
  const period = MEDICATION_FREQUENCY_PERIODS.find((p) => frequency.startsWith(p.value))?.value;
  const times = MEDICATION_FREQUENCY_TIMES.find((t) => frequency.endsWith(t.value))?.value;
  return { period, times };
}

interface Props {
  medication?: Medication;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MedicationForm({ medication, onSuccess, onCancel }: Props) {
  const [form] = Form.useForm<FormValues>();
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();
  const { data: visitsData } = useVisits(1, 200);

  const isEdit = !!medication;
  const isPending = createMedication.isPending || updateMedication.isPending;

  useEffect(() => {
    if (medication) {
      const { value: dosageValue, unit: dosageUnit } = parseDosage(medication.dosage);
      const { period: frequencyPeriod, times: frequencyTimes } = parseFrequency(medication.frequency);
      form.setFieldsValue({
        name: medication.name,
        dosageValue,
        dosageUnit,
        frequencyPeriod,
        frequencyTimes,
        startDate: medication.startDate ? dayjs(medication.startDate) : undefined,
        endDate: medication.endDate ? dayjs(medication.endDate) : undefined,
        isActive: medication.isActive,
        visitId: medication.visitId,
        notes: medication.notes,
      });
    }
  }, [medication, form]);

  function handleFinish(values: FormValues) {
    const dosage = values.dosageValue != null && values.dosageUnit
      ? `${values.dosageValue}${values.dosageUnit}`
      : null;

    const frequency = values.frequencyPeriod && values.frequencyTimes
      ? `${values.frequencyPeriod}${values.frequencyTimes}`
      : null;

    const data: MedicationInput = {
      name: values.name,
      dosage,
      frequency,
      startDate: values.startDate?.toISOString() ?? null,
      endDate: values.endDate?.toISOString() ?? null,
      isActive: values.isActive,
      visitId: values.visitId ?? null,
      notes: values.notes ?? null,
    };

    if (isEdit && medication) {
      updateMedication.mutate(
        { id: medication.id, data },
        {
          onSuccess,
          onError: (error) => notifyError(getErrorMessage(error, '更新用药记录失败')),
        }
      );
    } else {
      createMedication.mutate(data, {
        onSuccess,
        onError: (error) => notifyError(getErrorMessage(error, '新建用药记录失败')),
      });
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ isActive: true }}
    >
      <Form.Item
        name="name"
        label="药品名称"
        rules={[{ required: true, message: '请输入药品名称' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="剂量">
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item name="dosageValue" noStyle>
              <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="数值" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dosageUnit" noStyle>
              <Select placeholder="单位" allowClear>
                {MEDICATION_DOSAGE_UNITS.map((u) => (
                  <Select.Option key={u.value} value={u.value}>{u.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label="服用频率">
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item name="frequencyPeriod" noStyle>
              <Select placeholder="时间" allowClear>
                {MEDICATION_FREQUENCY_PERIODS.map((p) => (
                  <Select.Option key={p.value} value={p.value}>{p.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="frequencyTimes" noStyle>
              <Select placeholder="次数" allowClear>
                {MEDICATION_FREQUENCY_TIMES.map((t) => (
                  <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item name="startDate" label="开始日期">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="endDate" label="结束日期">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="isActive" label="是否在用" valuePropName="checked">
        <Switch checkedChildren="是" unCheckedChildren="否" />
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
          <Button type="primary" htmlType="submit" loading={isPending}>
            {isEdit ? '保存' : '创建'}
          </Button>
          <Button onClick={onCancel} disabled={isPending}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
