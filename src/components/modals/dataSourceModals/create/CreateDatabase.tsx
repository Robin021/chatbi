import { useState } from 'react';
import { Form, Input, Space, Typography, theme, Button, Flex } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { DatabaseForm } from '@/components/forms/DatabaseForm';
import { databaseController } from '@/utils/pocketbase/collections/databaseController';
import { DbConfig } from '@/utils/db/type';

const { Text, Title } = Typography;

interface CreateDatabaseProps {
  dataSetId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateDatabase = ({ dataSetId, onSuccess, onCancel }: CreateDatabaseProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  const handleSubmit = async (values: DbConfig) => {
    try {
      setLoading(true);
      await databaseController.create({
        ...values,
        name: form.getFieldValue('name'),
        dataset: dataSetId,
        description: ''
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create database connection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input 
            placeholder="Enter a name for this data source" 
            size="large"
          />
        </Form.Item>
      </Form>

      <DatabaseForm 
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Space>
  );
};

export default CreateDatabase;