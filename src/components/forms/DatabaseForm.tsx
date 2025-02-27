import React, { useState } from 'react';
import { Button, Form, Input, Select, Space, InputNumber, Switch, Typography, Divider, theme, Row, Col, Flex } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { DbConfig } from '@/utils/db/type';

interface DatabaseFormProps {
  onSubmit: (config: DbConfig) => Promise<void>;
  loading?: boolean;
}

export const DatabaseForm: React.FC<DatabaseFormProps> = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [connectionType, setConnectionType] = useState<'uri' | 'details'>('uri');
  const { token } = theme.useToken();

  const dialectOptions = [
    { label: 'PostgreSQL', value: 'postgres' },
    { label: 'MySQL', value: 'mysql' },
    { label: 'SQLite', value: 'sqlite' },
    { label: 'SQL Server', value: 'mssql' },
  ];

  const handleSubmit = async (values: DbConfig) => {
    await onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={loading}
      initialValues={{
        details: {
          host: 'localhost',
          port: 5432,
          dialect: 'postgres',
          username: '',
          password: '',
          database: ''
        }
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Flex align="center" gap="small">
          <Typography.Text>Connection URI</Typography.Text>
          <Switch
            checked={connectionType === 'uri'}
            onChange={(checked) => setConnectionType(checked ? 'uri' : 'details')}
          />
        </Flex>

        {connectionType === 'uri' ? (
          <Form.Item
            name="uri"
            rules={[{ required: true, message: 'Please enter connection URI' }]}
          >
            <Input.TextArea 
              placeholder="postgresql://user:password@localhost:5432/dbname"
              autoSize={{ minRows: 1, maxRows: 1 }}
              size="large"
            />
          </Form.Item>
        ) : (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Database Type"
                name={['details', 'dialect']}
                rules={[{ required: true }]}
                style={{ marginBottom: 12 }}
              >
                <Select options={dialectOptions} size="middle" />
              </Form.Item>
            </Col>
            
            <Col span={16}>
              <Form.Item
                label="Host"
                name={['details', 'host']}
                rules={[{ required: true }]}
                style={{ marginBottom: 12 }}
              >
                <Input placeholder="localhost" size="middle" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Port"
                name={['details', 'port']}
                rules={[{ required: true }]}
                style={{ marginBottom: 12 }}
              >
                <InputNumber 
                  min={1} 
                  max={65535} 
                  style={{ width: '100%' }} 
                  size="middle" 
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Database"
                name={['details', 'database']}
                rules={[{ required: true }]}
                style={{ marginBottom: 12 }}
              >
                <Input placeholder="database name" size="middle" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Username"
                name={['details', 'username']}
                rules={[{ required: true }]}
                style={{ marginBottom: 12 }}
              >
                <Input placeholder="username" size="middle" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Password"
                name={['details', 'password']}
                rules={[{ required: true }]}
                style={{ marginBottom: 12 }}
              >
                <Input.Password placeholder="password" size="middle" />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Flex justify="flex-end" style={{ marginTop: token.marginSM }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            size="large"
            icon={<CheckOutlined />}
          >
            Create
          </Button>
        </Flex>
      </Space>
    </Form>
  );
}; 