import { useState } from 'react';
import { Card, Button, Descriptions, Spin, Empty, Typography, Alert } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProfile } from '../api/profile';
import { ProfileForm } from '../components/ProfileForm';

const { Text } = Typography;

export function ProfilePage() {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const { data: profile, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile && mode !== 'edit') {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto' }}>
        {isError && (
          <Alert
            type="error"
            showIcon
            message="加载失败"
            description="档案加载失败，请刷新页面重试"
            style={{ marginBottom: 16 }}
          />
        )}
        <Card style={{ textAlign: 'center' }}>
          <Empty
            image={<UserOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            imageStyle={{ height: 80 }}
            description="尚未创建个人档案"
          />
          <Button
            type="primary"
            size="large"
            onClick={() => setMode('edit')}
            style={{ marginTop: 16 }}
          >
            立即创建档案
          </Button>
        </Card>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div style={{ maxWidth: 560, margin: '40px auto' }}>
        {isError && (
          <Alert
            type="error"
            showIcon
            message="加载失败"
            description="档案加载失败，请刷新页面重试"
            style={{ marginBottom: 16 }}
          />
        )}
        <Card title={profile ? '编辑个人档案' : '创建个人档案'}>
          <ProfileForm
            profile={profile ?? undefined}
            onSuccess={() => setMode('view')}
            onCancel={profile ? () => setMode('view') : undefined}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      {isError && (
        <Alert
          type="error"
          showIcon
          message="加载失败"
          description="档案加载失败，请刷新页面重试"
          style={{ marginBottom: 16 }}
        />
      )}
      <Card
        title="个人健康档案"
        extra={
          <Button icon={<EditOutlined />} onClick={() => setMode('edit')}>
            编辑
          </Button>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="姓名">{profile!.name}</Descriptions.Item>
          <Descriptions.Item label="性别">{profile!.gender ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="出生日期">
            {profile!.birthDate ? dayjs(profile!.birthDate).format('YYYY-MM-DD') : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="血型">{profile!.bloodType ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="身高">
            {profile!.height != null ? `${profile!.height} cm` : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="体重">
            {profile!.weight != null ? `${profile!.weight} kg` : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="过敏史" span={2}>
            {profile!.allergies ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="慢性病史" span={2}>
            {profile!.chronicDiseases ?? '—'}
          </Descriptions.Item>
        </Descriptions>
        <Text type="secondary" style={{ display: 'block', marginTop: 16, textAlign: 'right' }}>
          最后更新：{dayjs(profile!.updatedAt).format('YYYY-MM-DD HH:mm')}
        </Text>
      </Card>
    </div>
  );
}
