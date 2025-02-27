import React, { useEffect, useState } from 'react';
import { Typography, Space, Table, Card, theme, Flex, Layout, Button, message, Input, Popconfirm, Tag, Tooltip, Modal, Form, Select, Result } from 'antd';
import type { TableColumnType } from 'antd';
import { useDataPageContext } from '@/contexts/DataPageContext';
import { EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, DownloadOutlined, QuestionCircleOutlined, BulbOutlined, ReloadOutlined } from '@ant-design/icons';
import { useToast } from '@/hooks/useToast';
import { csvController } from '@/utils/pocketbase/collections/csvController';
import { CSVDataSource, isCSV } from '@/utils/dataSource/type';
import { LoadingButton } from '../ui/LoadingButton';
import { CSVData } from '@/utils/csv/type';
import { getCSVData, updateCSVColumn, updateCSVRow, deleteCSVRow, getCSVRowCount } from '@/utils/csv/api';
import { llm } from '@/utils/llm/api';
import { promptTemplates } from '@/utils/llm/promptTemplates';
import PasteText from '../ui/PasteText';
import { CSVRecord, LLMRecord } from '@/utils/pocketbase/collections/type';
import { llmController } from '@/utils/pocketbase/collections/llmController';
const { Title, Text } = Typography;

export const DataCSVCard: React.FC = () => {
  const { selectedDataSource, setSelectedDataSource } = useDataPageContext();
  const [data, setData] = useState<CSVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedRows, setLoadedRows] = useState(10);
  const rowIncrement = 10;
  const { token } = theme.useToken();
  const toast = useToast();
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editedColumnName, setEditedColumnName] = useState('');
  const [isEditingRecordData, setIsEditingRecordData] = useState(false);
  const [editedRecordData, setEditedRecordData] = useState<CSVRecord>({} as CSVRecord);
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);

  const fetchCSVData = async (append: boolean = false) => {
    if (!selectedDataSource) return;

    try {
      setLoading(true);
      const limit = append ? loadedRows + rowIncrement : loadedRows;
      const csvData = await getCSVData(selectedDataSource.id, limit);

      setData(csvData);
      setLoadedRows(limit);
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      toast.error({ message: 'Failed to fetch CSV data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSVData();
  }, [selectedDataSource?.id, loadedRows]);

  const handleDownload = async () => {
    if (!selectedDataSource || !isCSV(selectedDataSource)) return;

    try {
      const csvFile = await csvController.getFile(selectedDataSource);
      const url = window.URL.createObjectURL(csvFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedDataSource.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error({ message: 'Failed to download file' });
      console.error(error);
    }
  };

  if (!selectedDataSource || !isCSV(selectedDataSource)) {
    return null;
  }

  const handleColumnRename = async (oldName: string, newName: string) => {
    try {
      setLoading(true);
      await updateCSVColumn(selectedDataSource?.id, oldName, newName);
      toast.success({ message: 'Column renamed successfully' });
      await fetchCSVData();
      setEditingColumn(null);
      setEditedColumnName('');
    } catch (error) {
      toast.error({ message: 'Failed to rename column' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDataSave = async () => {
    if (!selectedDataSource || !isCSV(selectedDataSource)) return;

    try {
      const updatedSource = await csvController.update(selectedDataSource.id, {
        name: selectedDataSource.name,
        description: editedRecordData.description,
        dataset: selectedDataSource.dataset,
        contextDesc: editedRecordData.contextDesc,
        totalAvailableRows: editedRecordData.totalAvailableRows
      });

      setSelectedDataSource({ ...updatedSource, type: 'csv' });
      toast.success({ message: 'Updated successfully' });
      setIsEditingRecordData(false);
    } catch (error) {
      toast.error({ message: 'Failed to update description' });
      console.error(error);
    }
  };

  const fetchRowCount = async () => {
    if (!selectedDataSource) return;

    try {
      const count = await getCSVRowCount(selectedDataSource.id);
      setEditedRecordData({ ...editedRecordData, totalAvailableRows: count });
      toast.success({ message: 'Row count updated' });
    } catch (error) {
      toast.error({ message: 'Failed to fetch row count' });
      console.error(error);
    }
  };

  const generateDescription = async () => {
    if (!data?.columns) return;
  
    try {
      const llmRecordList = await llmController.list()
      const description = await llm(promptTemplates.generateCsvDescription(data?.columns?.join(', ')), llmRecordList[0]);
      setEditedRecordData({ ...editedRecordData, description: description });
    } catch (e) {
      toast.error({ message: 'Failed to generate description' });
    }

  }


  const columns = (data?.columns || []).map((col) => ({
    title: col,
    dataIndex: col,
    key: col,
    ellipsis: true,
    render: (_: any, record: any, index: number) => (
      <Tooltip placement="topLeft" title={_}>
        {_}
      </Tooltip>
    )
  }));

  const TableControls = () => (
    <Card size="small">
      <Flex gap="small" justify="end">
        <Button
          icon={<EditOutlined />}
          onClick={() => setIsEditColumnModalOpen(true)}
        >
          Rename Column
        </Button>
      </Flex>
    </Card>
  );

  const EditColumnModal = (
    <Modal
      title="Rename Column"
      open={isEditColumnModalOpen}
      onOk={() => {
        if (!editingColumn) {
          toast.error({ message: 'Please select a column' });
          return;
        }
        handleColumnRename(editingColumn, editedColumnName);
        setIsEditColumnModalOpen(false);
      }}
      onCancel={() => {
        setEditingColumn(null);
        setEditedColumnName('');
        setIsEditColumnModalOpen(false);
      }}
    >
      <Flex vertical gap="middle">
        <Form.Item label="Select Column">
          <Select
            style={{ width: '100%' }}
            value={editingColumn}
            onChange={(value) => {
              setEditingColumn(value);
              setEditedColumnName(value);
            }}
            options={data?.columns.map(col => ({ label: col, value: col }))}
          />
        </Form.Item>
        {editingColumn && (
          <Form.Item label="New Column Name">
            <Input
              value={editedColumnName}
              onChange={(e) => setEditedColumnName(e.target.value)}
              autoFocus
            />
          </Form.Item>
        )}
      </Flex>
    </Modal>
  );

  return (
    <Flex vertical style={{ width: '100%', height: '100%' }} flex={1} gap={token.marginMD}>
      <Card size="small">
        <Flex vertical gap="small">
          <Flex justify="space-between" align="center">
            <Title level={4} style={{ margin: 0 }}>
              {selectedDataSource.name}
            </Title>
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                type='text'
              />
              {isEditingRecordData ? (
                <>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleRecordDataSave}
                  />
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => setIsEditingRecordData(false)}
                  />
                </>
              ) : (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsEditingRecordData(true);
                    setEditedRecordData({ ...editedRecordData, description: selectedDataSource.description, contextDesc: selectedDataSource.contextDesc, totalAvailableRows: selectedDataSource.totalAvailableRows });
                  }}
                  type="text"
                />
              )}
            </Space>
          </Flex>
          <Flex gap="small" align="center">
            <Text type="secondary">
              Showing {data?.rows?.length || 0} of {selectedDataSource.totalAvailableRows || 0} total rows
            </Text>
            <Text type="secondary">•</Text>
            <Text type="secondary">
              {data?.columns?.length || 0} columns
            </Text>
          </Flex>

          {isEditingRecordData ? (
            <Flex vertical gap="middle" style={{ width: '100%' }}>
              <Flex justify='space-between' align='center' gap='middle' style={{ width: '100%' }}>
                <Text type="warning" style={{ whiteSpace: 'nowrap' }}>Description</Text>
                <Input.TextArea
                  value={editedRecordData.description}
                  onChange={(e) => setEditedRecordData({ ...editedRecordData, description: e.target.value })}
                  placeholder="Provide a detailed description of this CSV file, including what data it contains and what it's used for"
                  autoSize={{ minRows: 3 }}
                  status={!editedRecordData.description ? 'warning' : undefined}
                />
                <LoadingButton
                  onClick={() => generateDescription()}
                  type="text"
                  icon={<BulbOutlined />}
                />
              </Flex>
              <Flex justify='start' align='center' gap='middle' style={{ width: '100%' }}>
                <Text style={{ whiteSpace: 'nowrap' }}>Total Rows</Text>
                <Input
                  value={editedRecordData.totalAvailableRows}
                  disabled
                  style={{ width: '120px' }}
                />
                <LoadingButton
                  onClick={fetchRowCount}
                  icon={<ReloadOutlined />}
                >
                  Count Rows
                </LoadingButton>
              </Flex>
              <Flex justify='start' align='center' gap='middle' style={{ width: '100%' }}>
                <Text style={{ whiteSpace: 'nowrap' }}>Context Description</Text>
                <PasteText
                  value={editedRecordData.contextDesc}
                  onChange={(value) => setEditedRecordData({ ...editedRecordData, contextDesc: value })}

                />
              </Flex>
            </Flex>
          ) : (
            <Flex gap="middle" vertical>
              <Card
                size="small"
                extra={<Tag color="error">Important</Tag>}
                title={
                  <Space>
                    <Text strong>Description</Text>
                    <Tooltip title="This description helps the AI understand when to use this data source">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Flex vertical gap="small">
                  <Text>{selectedDataSource.description || 'Please provide a description'}</Text>
                </Flex>
              </Card>
              <Card
                size="small"
                title={<Space>
                  <Text strong>Context Description</Text>
                  <Tooltip title="Provides contextual information about the CSV file to help the ai choose the correct columns">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>}
              >
                <Typography.Paragraph ellipsis={{ rows: 3 }} type='secondary'>
                  {selectedDataSource.contextDesc.length > 0 && selectedDataSource.contextDesc}
                </Typography.Paragraph>
              </Card>
            </Flex>
          )}
        </Flex>
      </Card>

      <TableControls />

      <Card
        style={{
          height: '100%',
          overflow: 'auto',
        }}
        size="small"
      >

        <Table
          columns={columns}
          dataSource={data?.rows?.map((row, index) => ({
            ...row,
            key: index,
          }))}
          loading={loading}
          pagination={false}
          size="middle"
          bordered
          scroll={{
            y: '100%',
          }}
          footer={() => (
            selectedDataSource.totalAvailableRows && selectedDataSource.totalAvailableRows > loadedRows ? (
              <Flex justify="center">
                <Button
                  onClick={() => fetchCSVData(true)}
                  loading={loading}
                  type="primary"
                >
                  Load More ({data?.rows?.length || 0} of {selectedDataSource.totalAvailableRows} rows)
                </Button>
              </Flex>
            ) : null
          )}



        />

      </Card>
      {EditColumnModal}
    </Flex>
  );
};

