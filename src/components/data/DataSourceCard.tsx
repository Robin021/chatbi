import React from 'react';
import { Card, Space, Tag, Typography, Button, Popconfirm, theme, Flex } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { DataSource, dataSourceTypes } from '@/utils/dataSource';
import { databaseController } from '@/utils/pocketbase/collections/databaseController';
import { csvController } from '@/utils/pocketbase/collections/csvController';

interface DataSourceCardProps {
  source: DataSource;
  onClick: (source: DataSource) => void;
  onDelete?: () => void;
}

export const DataSourceCard: React.FC<DataSourceCardProps> = ({ source, onClick, onDelete }) => {
  const config = dataSourceTypes.find(c => c.type === source.type)!;
  const Icon = config.icon;
  const { title, subtitle } = config.getDisplayInfo(source);
  const { token } = theme.useToken();

  const handleDelete = async () => {
    try {
      if (source.type === 'database') {
        await databaseController.delete(source.id);
      } else if (source.type === 'csv') {
        await csvController.delete(source.id);
      }
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete data source:', error);
    }
  };

  return (
    <Card 
      hoverable 
      style={{ height: '100%' }}
      onClick={() => onClick(source)}
    >
      <Flex vertical justify="space-between" style={{ height: '100%' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Flex align="center" justify="space-between">
            <Space align="center">
              <Typography.Text style={{ 
                fontSize: token.fontSizeXL,
                color: config.tagColor,
              }}>
                <Icon />
              </Typography.Text>
              <Tag color={config.tagColor}>{config.type}</Tag>
            </Space>
            <Popconfirm
              title="Delete Data Source"
              description="Are you sure you want to delete this data source?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete();
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ 
                danger: true,
                size: 'small'
              }}
            >
              <Button 
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  color: token.colorTextDescription,
                  opacity: 0.6,
                }}
              />
            </Popconfirm>
          </Flex>
          <Typography.Title 
            level={5} 
            style={{ 
              margin: 0,
              marginTop: token.marginXS
            }}
          >
            {title}
          </Typography.Title>
        </Space>
        <Typography.Text 
          type="secondary"
          style={{
            fontSize: token.fontSizeSM,
            marginTop: token.marginSM
          }}
        >
          {subtitle}
        </Typography.Text>
      </Flex>
    </Card>
  );
};