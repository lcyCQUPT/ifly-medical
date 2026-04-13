import { Form, Input, DatePicker, Button, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { Visit } from '@ifly-medical/shared';
import { useCreateVisit, useUpdateVisit, type VisitInput } from '../api/visits';

interface FormValues {
  visitDate: Dayjs;
  hospital: string;
  department?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  doctorAdvice?: string;
  notes?: string;
}

interface Props {
  visit?: Visit;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VisitForm({ visit, onSuccess, onCancel }: Props) {
  const [form] = Form.useForm<FormValues>();
  const createVisit = useCreateVisit();
  const updateVisit = useUpdateVisit();
  const isPending = createVisit.isPending || updateVisit.isPending;

  const initialValues: Partial<FormValues> = visit
    ? {
        visitDate: dayjs(visit.visitDate),
        hospital: visit.hospital,
        department: visit.department,
        chiefComplaint: visit.chiefComplaint,
        diagnosis: visit.diagnosis,
        doctorAdvice: visit.doctorAdvice,
        notes: visit.notes,
      }
    : {};

  function handleFinish(values: FormValues) {
    const data: VisitInput = {
      visitDate: values.visitDate.toISOString(),
      hospital: values.hospital,
      department: values.department ?? null,
      chiefComplaint: values.chiefComplaint ?? null,
      diagnosis: values.diagnosis ?? null,
      doctorAdvice: values.doctorAdvice ?? null,
      notes: values.notes ?? null,
    };
    if (visit) {
      updateVisit.mutate({ id: visit.id, data }, { onSuccess });
    } else {
      createVisit.mutate(data, { onSuccess });
    }
  }

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleFinish}>
      <Form.Item
        name="visitDate"
        label="就诊日期"
        rules={[{ required: true, message: '请选择就诊日期' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="hospital"
        label="医院"
        rules={[{ required: true, message: '请输入医院名称' }]}
      >
        <Input placeholder="请输入医院名称" />
      </Form.Item>
      <Form.Item name="department" label="科室">
        <Input placeholder="请输入科室" />
      </Form.Item>
      <Form.Item name="chiefComplaint" label="主诉">
        <Input.TextArea rows={2} placeholder="请描述主要症状" />
      </Form.Item>
      <Form.Item name="diagnosis" label="诊断">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="doctorAdvice" label="医嘱/建议">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="notes" label="备注">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isPending}>
            保存
          </Button>
          <Button onClick={onCancel} disabled={isPending}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
