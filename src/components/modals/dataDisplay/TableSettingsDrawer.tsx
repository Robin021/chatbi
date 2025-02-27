import React from 'react';
import { Drawer, Space, Typography, Checkbox, Divider, Button, Alert } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { FetchedData } from '@/utils/dataSource/type';

interface TableSettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  columns: string[];
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  fetchedData: FetchedData;
}

const { Title, Text } = Typography;

export const TableSettingsDrawer: React.FC<TableSettingsDrawerProps> = ({
  visible,
  onClose,
  columns,
  selectedColumns,
  onColumnsChange,
  fetchedData,
}) => {
  const handleDownloadCSV = () => {
    const headers = selectedColumns.join(',');
    const rows = fetchedData.data.rows
      .map(row => selectedColumns.map(col => row[col]).join(','))
      .join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fetchedData.dataName}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Drawer
      title="Table Settings"
      placement="right"
      onClose={onClose}
      open={visible}
      width={320}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="Display Settings Only"
          description="These settings only affect how the data is displayed. The AI assistant will continue to use all available data columns for analysis and responses."
          type="info"
          showIcon
        />
        
        <div>
          <Title level={5}>Visible Columns</Title>
          <Text type="secondary">Select columns to display in the table</Text>
          <Divider />
          <Checkbox.Group
            options={columns}
            value={selectedColumns}
            onChange={(checkedValues) => onColumnsChange(checkedValues as string[])}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          />
        </div>
        
        <div>
          <Title level={5}>Export Data</Title>
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleDownloadCSV}
            block
          >
            Download as CSV
          </Button>
        </div>
      </Space>
    </Drawer>
  );
};