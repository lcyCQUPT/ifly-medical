import { useEffect, useRef, useState } from 'react';
import { Alert, Card, Space, Spin, Switch, Typography } from 'antd';
import type { AISettings, AISettingsUpdateInput, Profile } from '@ifly-medical/shared';
import { useAISettings, useUpdateAISettings } from '../api/ai-settings';
import { useProfile } from '../api/profile';
import { getErrorMessage } from '../utils/error';
import { notifyError } from '../utils/message';

const FIELD_CONFIGS: Array<{
  key: keyof Omit<AISettings, 'id' | 'updatedAt'>;
  label: string;
  hint?: string;
  profileKey: keyof Profile;
}> = [
  { key: 'includeName', label: '姓名', hint: '默认关闭，开启后 AI 将知道您的姓名', profileKey: 'name' },
  { key: 'includeGender', label: '性别', profileKey: 'gender' },
  { key: 'includeAge', label: '年龄', profileKey: 'birthDate' },
  { key: 'includeBloodType', label: '血型', profileKey: 'bloodType' },
  { key: 'includeHeight', label: '身高', profileKey: 'height' },
  { key: 'includeWeight', label: '体重', profileKey: 'weight' },
  { key: 'includeAllergies', label: '过敏史', profileKey: 'allergies' },
  { key: 'includeChronic', label: '慢性病史', profileKey: 'chronicDiseases' },
];

function hasProfileValue(profile: Profile | null | undefined, key: keyof Profile) {
  if (!profile) {
    return false;
  }
  const value = profile[key];
  if (value == null) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return true;
}

export function AISettingsPage() {
  const { data: profile } = useProfile();
  const { data: settings, isLoading, isError } = useAISettings();
  const updateSettings = useUpdateAISettings();
  const [formState, setFormState] = useState<AISettings | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (settings) {
      setFormState(settings);
    }
  }, [settings]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function scheduleSave(nextState: AISettings, changedKey: keyof AISettingsUpdateInput) {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      const value = nextState[changedKey];
      updateSettings.mutate(
        { [changedKey]: value } as AISettingsUpdateInput,
        {
          onError: (error) => {
            notifyError(getErrorMessage(error, '保存 AI 设置失败'));
            setFormState(settings ?? null);
          },
        }
      );
    }, 300);
  }

  function handleToggle(key: keyof AISettingsUpdateInput, checked: boolean) {
    setFormState((prev) => {
      if (!prev) {
        return prev;
      }
      const nextState = { ...prev, [key]: checked };
      scheduleSave(nextState, key);
      return nextState;
    });
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!formState) {
    return (
      <div style={{ maxWidth: 760, margin: '40px auto' }}>
        <Alert
          type="error"
          showIcon
          message="加载失败"
          description="AI 设置加载失败，请刷新页面重试"
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '40px auto' }}>
      {isError && (
        <Alert
          type="error"
          showIcon
          message="加载失败"
          description="AI 设置加载失败，请刷新页面重试"
          style={{ marginBottom: 16 }}
        />
      )}
      <Card title="AI 设置">
        <Typography.Paragraph type="secondary">
          选择您希望 AI 了解的个人信息，以便获得更个性化的健康建议
        </Typography.Paragraph>

        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          {FIELD_CONFIGS.map((field) => {
            const checked = formState[field.key];
            const showMissingHint = checked && !hasProfileValue(profile, field.profileKey);

            return (
              <div
                key={field.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div style={{ flex: 1 }}>
                  <Typography.Text strong>{field.label}</Typography.Text>
                  {field.hint ? (
                    <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                      {field.hint}
                    </Typography.Paragraph>
                  ) : null}
                  {showMissingHint ? (
                    <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                      档案中暂无此信息
                    </Typography.Text>
                  ) : null}
                </div>
                <Switch
                  checked={checked}
                  loading={updateSettings.isPending}
                  onChange={(nextChecked) => handleToggle(field.key, nextChecked)}
                />
              </div>
            );
          })}
        </Space>

        <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 20 }}>
          AI 仅在对话时使用您允许的信息，不会存储或分享
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
