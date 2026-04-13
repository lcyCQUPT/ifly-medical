import { useState } from 'react';
import { Table, Button, Drawer, Descriptions, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Visit } from '@ifly-medical/shared';
import { useVisits, useDeleteVisit } from '../api/visits';
import { VisitForm } from '../components/VisitForm';

type DrawerMode = 'detail' | 'create' | 'edit' | null;

export function VisitsPage() {
  const [page, setPage] = useState(1);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const { data, isLoading } = useVisits(page);
  const deleteVisit = useDeleteVisit();

  const columns = [
    {
      title: '就诊日期',
      dataIndex: 'visitDate',
      key: 'visitDate',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '医院',
      dataIndex: 'hospital',
      key: 'hospital',
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department',
      render: (v?: string) => v ?? '—',
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      render: (v?: string) => v ?? '—',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Visit) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedVisit(record);
            setDrawerMode('detail');
          }}
        >
          查看
        </Button>
      ),
    },
  ];

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedVisit(null);
  }

  const drawerTitle =
    drawerMode === 'create' ? '新建就诊记录' :
    drawerMode === 'edit' ? '编辑就诊记录' :
    '就诊详情';

  return (
    <div style={{ maxWidth: 900, margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>就诊记录</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerMode('create')}>
          新建就诊记录
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data}
        columns={columns}
        pagination={{
          current: page,
          pageSize: 10,
          total: data?.total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
      />

      <Drawer
        title={drawerTitle}
        open={drawerMode !== null}
        onClose={closeDrawer}
        width={520}
        destroyOnClose
      >
        {drawerMode === 'detail' && selectedVisit && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="就诊日期">
                {dayjs(selectedVisit.visitDate).format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item label="医院">{selectedVisit.hospital}</Descriptions.Item>
              <Descriptions.Item label="科室">{selectedVisit.department ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="主诉">{selectedVisit.chiefComplaint ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="诊断">{selectedVisit.diagnosis ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="医嘱/建议">{selectedVisit.doctorAdvice ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="备注">{selectedVisit.notes ?? '—'}</Descriptions.Item>
            </Descriptions>
            <Typography.Text
              type="secondary"
              style={{ display: 'block', marginTop: 12, textAlign: 'right' }}
            >
              创建时间：{dayjs(selectedVisit.createdAt).format('YYYY-MM-DD HH:mm')}
            </Typography.Text>
            <Space style={{ marginTop: 24 }}>
              <Button type="primary" onClick={() => setDrawerMode('edit')}>编辑</Button>
              <Popconfirm
                title="确定删除该就诊记录？"
                onConfirm={() => deleteVisit.mutate(selectedVisit.id, { onSuccess: closeDrawer })}
                okText="删除"
                cancelText="取消"
              >
                <Button danger loading={deleteVisit.isPending}>删除</Button>
              </Popconfirm>
            </Space>
          </>
        )}

        {(drawerMode === 'create' || drawerMode === 'edit') && (
          <VisitForm
            visit={drawerMode === 'edit' ? (selectedVisit ?? undefined) : undefined}
            onSuccess={closeDrawer}
            onCancel={closeDrawer}
          />
        )}
      </Drawer>
    </div>
  );
}
