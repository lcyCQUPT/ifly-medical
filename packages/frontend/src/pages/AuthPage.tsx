import { Card, Form, Input, Button, Tabs, Typography, message } from 'antd';
import { useLogin, useRegister } from '../api/auth';
import { useAuth } from '../contexts/useAuth';
import { getErrorMessage } from '../utils/error';

interface AuthFormValues {
  username: string;
  password: string;
  confirmPassword?: string;
}

export function AuthPage() {
  const { login } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [messageApi, contextHolder] = message.useMessage();

  async function handleLogin(values: AuthFormValues) {
    try {
      const result = await loginMutation.mutateAsync({
        username: values.username,
        password: values.password,
      });
      login(result.token, result.user);
    } catch (error) {
      messageApi.error(getErrorMessage(error, '登录失败'));
    }
  }

  async function handleRegister(values: AuthFormValues) {
    try {
      const result = await registerMutation.mutateAsync({
        username: values.username,
        password: values.password,
      });
      login(result.token, result.user);
    } catch (error) {
      messageApi.error(getErrorMessage(error, '注册失败'));
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(135deg, #f6f1e8 0%, #dcecf2 100%)',
      }}
    >
      {contextHolder}
      <Card style={{ width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)' }}>
        <Typography.Title level={2} style={{ marginBottom: 8 }}>
          医疗健康信息管理
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          使用用户名和密码登录，数据将按账号隔离。
        </Typography.Paragraph>

        <Tabs
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form<AuthFormValues> layout="vertical" onFinish={handleLogin} autoComplete="off">
                  <Form.Item
                    name="username"
                    label="用户名"
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 3, message: '用户名至少 3 个字符' },
                    ]}
                  >
                    <Input placeholder="请输入用户名" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label="密码"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少 6 个字符' },
                    ]}
                  >
                    <Input.Password placeholder="请输入密码" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loginMutation.isPending}>
                    登录
                  </Button>
                </Form>
              ),
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form<AuthFormValues> layout="vertical" onFinish={handleRegister} autoComplete="off">
                  <Form.Item
                    name="username"
                    label="用户名"
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 3, message: '用户名至少 3 个字符' },
                    ]}
                  >
                    <Input placeholder="请输入用户名" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label="密码"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少 6 个字符' },
                    ]}
                  >
                    <Input.Password placeholder="请输入密码" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="确认密码"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '请再次输入密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="请再次输入密码" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={registerMutation.isPending}>
                    注册并登录
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
