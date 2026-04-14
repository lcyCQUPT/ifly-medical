import { useState, useMemo } from 'react';
import { Table, Button, Drawer, Descriptions, Popconfirm, Space, Typography, Tag, Segmented, Pagination, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Medication } from '@ifly-medical/shared';
import { useMedications, useDeleteMedication } from '../api/medications';
import { MedicationForm } from '../components/MedicationForm';
import { getErrorMessage } from '../utils/error';
import { notifyError } from '../utils/message';

type DrawerMode = 'detail' | 'create' | 'edit' | null;

export function MedicationsPage() {
  const PAGE_SIZE = 20;
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  const isActive = filter === 'active' ? true : filter === 'inactive' ? false : undefined;
  const { data, isLoading, isError } = useMedications(page, PAGE_SIZE, isActive);
  const deleteMedication = useDeleteMedication();

  const columns = useMemo(() => [
    {
      title: '药品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '剂量',
      dataIndex: 'dosage',
      key: 'dosage',
      render: (v?: string) => v ?? '—',
    },
    {
      title: '频率',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (v?: string) => v ?? '—',
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (v?: string) => v ? dayjs(v).format('YYYY-MM-DD') : '—',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>{v ? '在用' : '已停用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Medication) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedMedication(record);
            setDrawerMode('detail');
          }}
        >
          查看
        </Button>
      ),
    },
  ], []);

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedMedication(null);
  }

  function handleFilterChange(value: 'all' | 'active' | 'inactive') {
    setFilter(value);
    setPage(1);
  }

  const drawerTitle =
    drawerMode === 'create' ? '新建用药记录' :
    drawerMode === 'edit' ? '编辑用药记录' :
    drawerMode === 'detail' ? '用药详情' : '';

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>用药记录</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerMode('create')}>
          新建用药记录
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          showIcon
          message="加载失败"
          description="数据加载失败，请刷新页面重试"
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ marginBottom: 16 }}>
        <Segmented
          value={filter}
          onChange={(v) => handleFilterChange(v as 'all' | 'active' | 'inactive')}
          options={[
            { label: '全部', value: 'all' },
            { label: '在用', value: 'active' },
            { label: '已停用', value: 'inactive' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data}
        columns={columns}
        pagination={false}
      />
      <Pagination
        current={page}
        total={data?.total ?? 0}
        pageSize={PAGE_SIZE}
        onChange={setPage}
        showSizeChanger={false}
        showTotal={(total) => `共 ${total} 条`}
        style={{ marginTop: 16, textAlign: 'right' }}
      />

      <Drawer
        title={drawerTitle}
        open={drawerMode !== null}
        onClose={closeDrawer}
        width={520}
        destroyOnClose
      >
        {drawerMode === 'detail' && selectedMedication && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="药品名称">{selectedMedication.name}</Descriptions.Item>
              <Descriptions.Item label="剂量">{selectedMedication.dosage ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="服用频率">{selectedMedication.frequency ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="开始日期">
                {selectedMedication.startDate ? dayjs(selectedMedication.startDate).format('YYYY-MM-DD') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="结束日期">
                {selectedMedication.endDate ? dayjs(selectedMedication.endDate).format('YYYY-MM-DD') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedMedication.isActive ? 'green' : 'default'}>
                  {selectedMedication.isActive ? '在用' : '已停用'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="备注">{selectedMedication.notes ?? '—'}</Descriptions.Item>
            </Descriptions>

            <Space style={{ marginTop: 24 }}>
              <Button type="primary" onClick={() => setDrawerMode('edit')}>编辑</Button>
              <Popconfirm
                title="确定删除该用药记录？"
                onConfirm={() =>
                  deleteMedication.mutate(selectedMedication.id, {
                    onSuccess: closeDrawer,
                    onError: (error) => notifyError(getErrorMessage(error, '删除用药记录失败')),
                  })
                }
                okText="删除"
                cancelText="取消"
              >
                <Button danger loading={deleteMedication.isPending}>删除</Button>
              </Popconfirm>
            </Space>
          </>
        )}

        {(drawerMode === 'create' || drawerMode === 'edit') && (
          <MedicationForm
            medication={drawerMode === 'edit' ? (selectedMedication ?? undefined) : undefined}
            onSuccess={closeDrawer}
            onCancel={closeDrawer}
          />
        )}
      </Drawer>
    </div>
  );
}
