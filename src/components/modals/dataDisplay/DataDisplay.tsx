import React, { useEffect, useState, useMemo } from 'react';
import { Table, Card, Typography, Button, Flex, Statistic, Tabs, Progress, Alert, Select } from 'antd';
import { ReloadOutlined, TableOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { FetchedData, DataFetchingConfig } from '@/utils/dataSource/type';
import { DataDisplayHeader } from './DataDisplayHeader';
import { TableSettingsDrawer } from './TableSettingsDrawer';

interface DataDisplayProps {
  fetchedData: FetchedData;
  loading?: boolean;
  onFetchMore: (config: DataFetchingConfig) => void;
  onRemoveFetchedData: (id: string) => void;
  maxLLMRows: number;
}

const { Text, Title } = Typography;

const DataDisplay: React.FC<DataDisplayProps> = ({
  fetchedData,
  loading,
  onFetchMore,
  onRemoveFetchedData,
  maxLLMRows
}) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(fetchedData.data.columns);
  const [rowsToFetch, setRowsToFetch] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    setActiveTab('overview');
    setSelectedColumns(fetchedData.data.columns);
  }, [fetchedData]);

  const columns = useMemo(() => 
    selectedColumns.map(col => ({
      title: col,
      dataIndex: col,
      key: col,
      ellipsis: true,
      sorter: (a: any, b: any) => {
        if (typeof a[col] === 'number') {
          return a[col] - b[col];
        }
        return String(a[col]).localeCompare(String(b[col]));
      },
    }))
  , [selectedColumns, fetchedData.data.columns]);

  const handleFetchMore = () => {
    const newConfig: DataFetchingConfig = {
      limitRows: fetchedData.currentLoadedRows + rowsToFetch,
    };
    onFetchMore(newConfig);
  };

  // Calculate progress percentage
  const progressPercent = Math.min(
    Math.round((fetchedData.currentLoadedRows / fetchedData.totalRowsAvailable) * 100),
    100
  );

  const hasMoreData = fetchedData.currentLoadedRows < fetchedData.totalRowsAvailable;

  const loadMoreSection = hasMoreData && (
    <Flex align="center" gap="small">
      <Select
        value={rowsToFetch}
        onChange={setRowsToFetch}
        options={[
          { value: 50, label: '50 rows' },
          { value: 100, label: '100 rows' },
          { value: 500, label: '500 rows' },
          { value: 1000, label: '1000 rows' },
        ]}
        style={{ width: 120 }}
      />
      <Button 
        type="primary" 
        onClick={handleFetchMore}
        icon={<ReloadOutlined />}
        loading={loading}
      >
        Load More Data
      </Button>
    </Flex>
  );

  const items = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <InfoCircleOutlined />,
      children: (
        <Flex vertical gap="middle" style={{ width: '100%' }}>
          <Card style={{ width: '100%' }}>
            <Flex gap="large" wrap="wrap">
              <Statistic 
                title="Total Available Rows" 
                value={fetchedData.totalRowsAvailable}
                prefix={<TableOutlined />}
              />
              <Statistic 
                title="Currently Loaded" 
                value={fetchedData.currentLoadedRows}
                suffix={`/ ${fetchedData.totalRowsAvailable}`}
              />
              <Statistic 
                title="Columns" 
                value={fetchedData.data.columns.length} 
              />
              <Statistic 
                title="Data Source Type" 
                value={fetchedData.type} 
              />
            </Flex>
          </Card>
          
          {fetchedData.currentLoadedRows > maxLLMRows && (
            <Alert
              message="Large Dataset Notice"
              description={`This dataset contains more rows (${fetchedData.currentLoadedRows}) than what will be sent to the AI assistant (${maxLLMRows} rows). For direct AI interactions like questions and summaries, only the first ${maxLLMRows} rows will be used. However, all rows will be included for data analysis, chart generation, and transformations.`}
              type="warning"
              showIcon
            />
          )}
          
          <Card style={{ width: '100%' }}>
            <Flex vertical gap="middle">
              <Title level={5}>Data Loading Progress</Title>
              <Progress 
                percent={progressPercent} 
                status={hasMoreData ? "active" : "success"}
              />
              <Flex justify="space-between" align="center">
                <Text type="secondary">
                  Loaded {fetchedData.currentLoadedRows} of {fetchedData.totalRowsAvailable} total rows
                </Text>
                {loadMoreSection}
              </Flex>
              {!hasMoreData && (
                <Alert 
                  message="All data loaded" 
                  type="success" 
                  showIcon
                />
              )}
            </Flex>
          </Card>
        </Flex>
      ),
    },
    {
      key: 'data',
      label: 'Data Table',
      icon: <TableOutlined />,
      children: (
        <Card style={{ width: '100%' }}>
          <Table
            columns={columns}
            dataSource={fetchedData.data.rows.map((row, index) => ({
              key: index,
              ...row,
            }))}
            loading={loading}
            size="small"
            pagination={{
              defaultPageSize: 10,
              showTotal: (total) => `Total ${total} records`,
            }}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      ),
    },
  ];

  const handleRemoveFetchedData = () => {
      onRemoveFetchedData(fetchedData.id)
  }

  return (
    <Card style={{ width: '100%' }}>
      <Flex vertical gap="middle" style={{ width: '100%' }}>
        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
          <DataDisplayHeader
            dataName={fetchedData.dataName}
            dataType={fetchedData.type}
            rowCount={fetchedData.currentLoadedRows}
            onOpenSettings={() => setSettingsVisible(true)}
            onRemoveFetchedData={handleRemoveFetchedData}
          />
        </Flex>

        <Tabs 
          items={items}
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          style={{ width: '100%' }}
        />

        <TableSettingsDrawer
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          columns={fetchedData.data.columns}
          selectedColumns={selectedColumns}
          onColumnsChange={setSelectedColumns}
          fetchedData={fetchedData}
        />
      </Flex>
    </Card>
  );
};

export default DataDisplay;