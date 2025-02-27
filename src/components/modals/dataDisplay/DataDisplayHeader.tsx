import React from 'react';
import { Space, Typography, Tag, Button, Flex, Popconfirm } from 'antd';
import { SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import { DataSource } from '@/utils/dataSource/type';

interface DataDisplayHeaderProps {
  dataName: string;
  dataType: DataSource['type'] | 'transformed';
  rowCount: number;
  onOpenSettings: () => void;
  onRemoveFetchedData: () => void
}

const { Title } = Typography;

export const DataDisplayHeader: React.FC<DataDisplayHeaderProps> = ({
  dataName,
  dataType,
  rowCount,
  onOpenSettings,
  onRemoveFetchedData
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'database':
        return 'blue';
      case 'csv':
        return 'green';
      case 'transformed':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <Space>
        <Title level={4} style={{ margin: 0 }}>{dataName}</Title>
        <Tag color={getTypeColor(dataType)}>{dataType}</Tag>
      </Space>
      <Flex>
        <Popconfirm
          title="Remove Data"
          description="Are you sure you want to remove this data?"
          onConfirm={onRemoveFetchedData}
          okText="Yes"
          cancelText="No"
        >
          <Button
            icon={<DeleteOutlined />}
            type='text'
            danger
          >
          </Button>
        </Popconfirm>
        
       
          <Button
            icon={<SettingOutlined />}
            type='text'
            onClick={onOpenSettings}
          >
          </Button>
        
      </Flex>
    </Space>
  );
};