import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, message, List, Button, Avatar, Spin } from 'antd';
import { DataSetRecord } from '@/utils/pocketbase/collections/type';
import { getPocketBaseClient } from '@/utils/pocketbase';
import { UserOutlined } from '@ant-design/icons';

interface AccessManagementModalProps {
  open: boolean;
  onCancel: () => void;
  dataset: DataSetRecord;
  onSuccess: () => void;
}

export const AccessManagementModal: React.FC<AccessManagementModalProps> = ({
  open,
  onCancel,
  dataset,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const pb = getPocketBaseClient();

  const handleAddOwner = async (values: { email: string }) => {
    try {
      setLoading(true);
      
      // Search for user by email in the authing collection
      const authUser = await pb.collection('authing').getFirstListItem(`email = "${values.email}"`);
      
      if (!authUser) {
        message.error('User not found');
        return;
      }

      // Add the user ID to the dataset owners
      const updatedOwners = [...dataset.owner, authUser.id];
      
      // Update the dataset with the new owners
      await pb.collection('dataset').update(dataset.id, {
        owner: updatedOwners,
      });

      message.success('User added successfully');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Failed to add user:', error);
      message.error('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Manage Access"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleAddOwner}
        layout="vertical"
      >
        <Form.Item
          name="email"
          label="User Email"
          rules={[
            { required: true, message: 'Please input user email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input placeholder="Enter user email" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add User
          </Button>
        </Form.Item>
      </Form>

      <List
        header={<div>Current Users</div>}
        dataSource={dataset.owner}
        renderItem={(ownerId) => (
          <List.Item>
            <UserDisplay userId={ownerId} />
          </List.Item>
        )}
      />
    </Modal>
  );
};

// Separate component for displaying user information
const UserDisplay: React.FC<{ userId: string }> = ({ userId }) => {
  const [userData, setUserData] = useState<{ email?: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const pb = getPocketBaseClient();
        const user = await pb.collection('authing').getOne(userId);
        setUserData({ email: user.email });
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <List.Item.Meta
      avatar={<Avatar icon={<UserOutlined />} />}
      title={loading ? <Spin size="small" /> : userData?.email}
    />
  );
};
