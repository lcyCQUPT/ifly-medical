import { Form, Input, Select, DatePicker, InputNumber, Button, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { Profile } from '@ifly-medical/shared';
import { useUpsertProfile, type ProfileInput } from '../api/profile';

interface FormValues {
  name: string;
  gender?: string;
  birthDate?: Dayjs;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  chronicDiseases?: string;
}

interface Props {
  profile?: Profile;
  onSuccess: () => void;
  onCancel?: () => void;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function ProfileForm({ profile, onSuccess, onCancel }: Props) {
  const [form] = Form.useForm<FormValues>();
  const { mutate, isPending } = useUpsertProfile();

  const initialValues: FormValues = profile
    ? {
        name: profile.name,
        gender: profile.gender ?? undefined,
        birthDate: profile.birthDate ? dayjs(profile.birthDate) : undefined,
        bloodType: profile.bloodType ?? undefined,
        height: profile.height ?? undefined,
        weight: profile.weight ?? undefined,
        allergies: profile.allergies ?? undefined,
        chronicDiseases: profile.chronicDiseases ?? undefined,
      }
    : {};

  function handleFinish(values: FormValues) {
    const data: ProfileInput = {
      name: values.name,
      gender: values.gender ?? null,
      birthDate: values.birthDate ? values.birthDate.toISOString() : null,
      bloodType: values.bloodType ?? null,
      height: values.height ?? null,
      weight: values.weight ?? null,
      allergies: values.allergies ?? null,
      chronicDiseases: values.chronicDiseases ?? null,
    };
    mutate(data, { onSuccess });
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
      style={{ maxWidth: 480 }}
    >
      <Form.Item
        name="name"
        label="姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>

      <Form.Item name="gender" label="性别">
        <Select allowClear placeholder="请选择">
          <Select.Option value="男">男</Select.Option>
          <Select.Option value="女">女</Select.Option>
          <Select.Option value="其他">其他</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="birthDate" label="出生日期">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="bloodType" label="血型">
        <Select allowClear placeholder="请选择">
          {BLOOD_TYPES.map(t => (
            <Select.Option key={t} value={t}>{t}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="height" label="身高（cm）">
        <InputNumber min={0} max={300} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="weight" label="体重（kg）">
        <InputNumber min={0} max={500} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="allergies" label="过敏史">
        <Input.TextArea rows={2} placeholder="多项请用逗号分隔" />
      </Form.Item>

      <Form.Item name="chronicDiseases" label="慢性病史">
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isPending}>
            保存
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={isPending}>
              取消
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
}
