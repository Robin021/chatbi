import React, { useState, useEffect } from 'react';
import { Typography, Space, Card, Button, Descriptions, Flex, Input, Tag, Tooltip, Popconfirm, Form, theme } from 'antd';
import { DatabaseOutlined, SyncOutlined, CheckCircleOutlined, EditOutlined, SaveOutlined, CloseOutlined, TableOutlined, QuestionCircleOutlined, BulbOutlined } from '@ant-design/icons';
import { useDataPageContext } from '@/contexts/DataPageContext';
import { DatabaseDataSource, isDatabase } from '@/utils/dataSource/type';
import { useToast } from '@/hooks/useToast';
import { databaseController } from '@/utils/pocketbase/collections/databaseController';
import { saveSchema, deleteSchema } from '@/utils/db/schema';
import { tableController } from '@/utils/pocketbase/collections/tableController';
import { LoadingButton } from '../ui/LoadingButton';
import { fetchDatabaseSchema, testDatabaseConnection } from '@/utils/db/api';
import { llm } from '@/utils/llm/api';
import { promptTemplates } from '@/utils/llm/promptTemplates';
import { llmController } from '@/utils/pocketbase/collections/llmController';

const { Text, Title } = Typography;
const { useToken } = theme;
export const DataDatabaseCard: React.FC = () => {
  const { selectedDataSource, setSelectedDataSource, setCurrentCard } = useDataPageContext();
  const [loading, setLoading] = useState(false);
  const [hasSchema, setHasSchema] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{ uri?: string; details?: DatabaseDataSource['details'], description?: string }>({});
  const toast = useToast();
  const { token } = useToken();
  useEffect(() => {
    const checkExistingSchema = async () => {
      if (!selectedDataSource || !isDatabase(selectedDataSource)) return;
      try {
        const tables = await tableController.list(selectedDataSource.id);
        setHasSchema(tables.length > 0);
      } catch (error) {
        console.error('Failed to check existing schema:', error);
      }
    };

    checkExistingSchema();
  }, [selectedDataSource]);

  if (!selectedDataSource || !isDatabase(selectedDataSource)) {
    return null;
  }

  const database = selectedDataSource;

  const handleAction = async (action: 'test' | 'schema' | 'save' | 'generate_description') => {
    try {
      switch (action) {
        case 'test':
          if (await testDatabaseConnection(database)) {
            toast.success({ message: 'Connection successful' });
          } else {
            toast.error({ message: 'Connection failed' });
          }
          break;
        case 'schema':
          try {

            const response = await fetchDatabaseSchema(database);
            await saveSchema(response, database.id);
            setHasSchema(true);
            toast.success({ message: 'Schema updated successfully' });
          } catch (error) {
            toast.error({ message: 'Failed to update schema' });
            console.error(error);
          }
          break;
        case 'save':
          setLoading(true);
          const connectionData = database.uri
            ? { uri: editedData.uri, name: database.name, dataset: database.dataset, description: editedData.description || '' }
            : { details: editedData.details, name: database.name, dataset: database.dataset, description: editedData.description || '' };

          const updatedDatabase = await databaseController.update(database.id, connectionData);

          // Delete schema if it exists
          if (hasSchema) {
            await deleteSchema(database.id);
            setHasSchema(false);
          }

          setSelectedDataSource({ ...updatedDatabase, type: 'database' });
          toast.success({ message: 'Database updated successfully' });
          setIsEditing(false);
          break;
        case 'generate_description':
          const tables = await tableController.list(database.id);
          const llmRecordList = await llmController.list();
          const description = await llm(promptTemplates.generateDatabaseDescription(tables.map(table => table.tableName).join(', ')), llmRecordList[0]);
          setEditedData({ ...editedData, description: description });      
          break;
      }
    } catch (error) {
      toast.error({ message: `Failed to ${action} database` });
    } finally {
      setLoading(false);
    }
  };

  const viewSchema = () => {

    setCurrentCard('DatabaseSchema');

  }

  const renderDescription = () => {
    if (isEditing) {
      return (

        <>
          <Flex justify='space-between' align='center' gap='middle' style={{ width: '100%' }}>
            <Text type="warning" style={{ whiteSpace: 'nowrap' }}>Description</Text>
            <Input.TextArea
              value={editedData.description}
              onChange={(e) => setEditedData({...editedData, description: e.target.value})}
              placeholder="Provide a detailed description of this database, including what data it contains and what it's used for"
              autoSize={{ minRows: 3 }}
              status={!editedData.description ? 'warning' : undefined}
            />
            {hasSchema && <LoadingButton type="text" onClick={() => handleAction('generate_description')} icon={<BulbOutlined />} size='large' />}
          </Flex>


        </>
      );
    }
    return (
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
        <Text>{database.description || 'Please provide a description'}</Text>
      </Card>
    );
  }

  const renderConnectionDetails = () => {
    if (database.uri) {
      return isEditing ? (
        <Input.TextArea
          value={editedData.uri}
          onChange={(e) => setEditedData({...editedData, uri: e.target.value})}
          autoSize
        />
      ) : (
        <Text copyable strong>
          {database.uri}
        </Text>
      );
    }

    return (
      <Descriptions bordered column={2}>
        {Object.entries(database.details || {}).map(([key, value]) => (
          <Descriptions.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} span={key === 'host' ? 2 : 1}>
            {isEditing && key !== 'dialect' ? (
              <Input
                value={editedData.details?.[key as keyof typeof database.details]}
                onChange={(e) => setEditedData({...editedData, details: {
                  ...database.details!,
                  [key]: e.target.value
                }})}
              />
            ) : value}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  const renderSchemaAction = () => {
    if (!hasSchema) {
      return (
        <Card>
          <Flex vertical align="center" gap="middle">
            <DatabaseOutlined style={{ fontSize: 32 }} />
            <Title level={5} style={{ margin: 0 }}>Database Schema</Title>
            <Text type="secondary">
              Import tables and columns from your database
            </Text>
            <Text type="danger">
              This process may take several minutes for large databases
            </Text>
            <LoadingButton 
              type="primary"
              size="large"
              icon={<DatabaseOutlined />}
              onClick={() => handleAction('schema')}
              
            >
              Fetch Schema
            </LoadingButton>
          </Flex>
        </Card>
      );
    }

    return (
      <Card>
        <Flex justify="space-between" align="center">
          <Space>
            <TableOutlined />
            <Text strong>Database Schema</Text>
          </Space>
          <Button type="primary" icon={<TableOutlined />} onClick={() => viewSchema()}>
            View Schema
          </Button>
        </Flex>
      </Card>
    );
  };

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      <Card>
        <Flex vertical gap="middle">
          <Flex justify="space-between" align="center">
            <Space>
              <DatabaseOutlined style={{ fontSize: 24 }} />
              <Title level={4} style={{ margin: 0 }}>{database.name}</Title>
              <Text type="secondary">({database.details?.dialect || 'Unknown'})</Text>
              <Tag color={hasSchema ? 'success' : 'warning'}>
                {hasSchema ? 'Schema Available' : 'No Schema'}
              </Tag>
            </Space>
            <Space>
              {isEditing ? (
                <>
                  <Popconfirm
                    title="Save Database Connection"
                    description={
                      hasSchema
                        ? "Saving will delete the current schema. Are you sure?"
                        : "Are you sure you want to save the connection details?"
                    }
                    onConfirm={() => handleAction('save')}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button icon={<SaveOutlined />} type="primary" loading={loading}>
                      Save
                    </Button>
                  </Popconfirm>
                  <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Tooltip title="Edit connection details">
                    <Button icon={<EditOutlined />} onClick={() => {
                      setIsEditing(true);
                      setEditedData(database.uri ? { uri: database.uri, description: database.description } : { details: database.details, description: database.description });
                    }} type='text'>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Test database connection">
                    <LoadingButton
                      icon={<SyncOutlined/>}
                      onClick={() => handleAction('test')}                      
                      type='text'
                    >
                    </LoadingButton>
                  </Tooltip>
                </>
              )}
            </Space>
          </Flex>
          {renderConnectionDetails()}
          {renderDescription()}
        </Flex>
      </Card>
      {renderSchemaAction()}
    </Flex>
  );
};