import { lazy, Suspense, type ReactElement } from 'react';
import { Layout, Menu, Button, Spin, Typography } from 'antd';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  FileTextOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { AuthPage } from './pages/AuthPage';
import { ChatWidget } from './components/ChatWidget';
import { useAuth } from './contexts/useAuth';

const { Sider, Content } = Layout;
const VisitsPage = lazy(() =>
  import('./pages/VisitsPage').then((module) => ({ default: module.VisitsPage }))
);
const MedicationsPage = lazy(() =>
  import('./pages/MedicationsPage').then((module) => ({ default: module.MedicationsPage }))
);
const MetricsPage = lazy(() =>
  import('./pages/MetricsPage').then((module) => ({ default: module.MetricsPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);

type PageKey = 'profile' | 'visits' | 'medications' | 'metrics';

const menuItems: Array<{ key: PageKey; label: string; icon: ReactElement }> = [
  { key: 'profile', label: '个人档案', icon: <UserOutlined /> },
  { key: 'visits', label: '就诊记录', icon: <FileTextOutlined /> },
  { key: 'medications', label: '用药记录', icon: <MedicineBoxOutlined /> },
  { key: 'metrics', label: '健康指标', icon: <HeartOutlined /> },
];

function getSelectedMenuKey(pathname: string): PageKey {
  if (pathname.startsWith('/visits')) return 'visits';
  if (pathname.startsWith('/medications')) return 'medications';
  if (pathname.startsWith('/metrics')) return 'metrics';
  return 'profile';
}

function PrivateRoute({ element }: { element: ReactElement }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return element;
}

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = getSelectedMenuKey(location.pathname);

  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={220} theme='light' style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: '20px 16px 12px' }}>
            <Typography.Text type='secondary'>当前账号</Typography.Text>
            <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
              {user?.username}
            </Typography.Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={(e) => navigate(`/${e.key as PageKey}`)}
            items={menuItems}
            style={{ borderInlineEnd: 'none' }}
          />
          <div style={{ padding: 16, marginTop: 'auto' }}>
            <Button icon={<LogoutOutlined />} block onClick={logout}>
              退出登录
            </Button>
          </div>
        </Sider>
        <Content style={{ background: '#f5f5f5' }}>
          <Suspense
            fallback={
              <div
                style={{
                  minHeight: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Spin size="large" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to="/profile" replace />} />
              <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
              <Route path="/visits" element={<PrivateRoute element={<VisitsPage />} />} />
              <Route path="/medications" element={<PrivateRoute element={<MedicationsPage />} />} />
              <Route path="/metrics" element={<PrivateRoute element={<MetricsPage />} />} />
              <Route path="*" element={<Navigate to='/profile' replace />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
      {user ? <ChatWidget /> : null}
    </>
  );
}

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/profile" replace /> : <AuthPage />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}
