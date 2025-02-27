import React, { useState } from 'react';
import { Modal, Form, Button, Space, Input } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { dataSetController } from '@/utils/pocketbase/collections/dataSetController';
import { DataSetRecord } from '@/utils/pocketbase/collections/type';
import { useToast } from '@/hooks/useToast';

interface CreateDataSetModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateDataSetModal: React.FC<CreateDataSetModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const {error, success} = useToast();

    const handleSubmit = async (values: Omit<DataSetRecord, 'id'>) => {
    setLoading(true);
    try {
      const record = await dataSetController.create(values);
      success({
        message: 'Data set created successfully'
      });
      form.resetFields();
      onSuccess();
    } catch (err) {
      error({
        message: 'Failed to create data set'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Create Dataset"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ type: 'database' }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};