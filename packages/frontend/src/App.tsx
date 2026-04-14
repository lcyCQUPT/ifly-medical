import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout, Menu } from 'antd';
import { FileTextOutlined, MedicineBoxOutlined, HeartOutlined } from '@ant-design/icons';
import { VisitsPage } from './pages/VisitsPage';
import { MedicationsPage } from './pages/MedicationsPage';
import { MetricsPage } from './pages/MetricsPage';
import { ChatWidget } from './components/ChatWidget';

const queryClient = new QueryClient();

const { Sider, Content } = Layout;

type PageKey = 'visits' | 'medications' | 'metrics';

export default function App() {
  const [page, setPage] = useState<PageKey>('visits');

  return (
    <QueryClientProvider client={queryClient}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={200} theme="light">
          <Menu
            mode="vertical"
            selectedKeys={[page]}
            onClick={(e) => setPage(e.key as PageKey)}
            items={[
              { key: 'visits', label: '就诊记录', icon: <FileTextOutlined /> },
              { key: 'medications', label: '用药记录', icon: <MedicineBoxOutlined /> },
              { key: 'metrics', label: '健康指标', icon: <HeartOutlined /> },
            ]}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content style={{ background: '#f5f5f5' }}>
          {page === 'visits' && <VisitsPage />}
          {page === 'medications' && <MedicationsPage />}
          {page === 'metrics' && <MetricsPage />}
        </Content>
      </Layout>
      <ChatWidget />
    </QueryClientProvider>
  );
}
