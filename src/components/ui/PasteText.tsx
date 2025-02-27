import { useState } from 'react';
import { Typography, Input, Button, Space, Modal, Alert, Spin } from 'antd';
import { DeleteOutlined, CopyOutlined, FileTextOutlined } from '@ant-design/icons';
import { useToast } from '@/hooks/useToast';
import { theme } from 'antd';

const { Text } = Typography;

interface PasteTextProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PasteText({ value, onChange }: PasteTextProps) {
  const { token } = theme.useToken();
  const { error, success } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        error({ message: 'No text found in clipboard' });
        return;
      }
      setEditValue(text);
      success({ message: 'Content pasted successfully' });
    } catch (e) {
      error({ message: 'Failed to read from clipboard' });
    }
  };

  const handleSave = () => {
    onChange(editValue);
    setIsModalOpen(false);
    success({ message: 'Changes saved successfully' });
  };

  const handleOpen = async () => {
    setIsLoading(true);
    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setEditValue(value);
    setIsModalOpen(true);
    setIsLoading(false);
  };

  const stats = {
    chars: value.length,
    lines: value.split('\n').length,
    size: (value.length * 2) / (1024 * 1024) // Rough MB estimate
  };

  return (
    <Spin spinning={isLoading} delay={300}>
      <Space.Compact block>
        <Button 
          icon={<FileTextOutlined />}
          onClick={handleOpen}
          style={{ width: '100%' }}
          disabled={isLoading}
        >
          <Space>
            {stats.chars > 0 ? (
              <>
                <Text>{`${stats.chars.toLocaleString()} characters`}</Text>
                <Text type="secondary">{`(~${stats.size.toFixed(2)} MB)`}</Text>
              </>
            ) : (
              'Click to Edit Content'
            )}
          </Space>
        </Button>
        <Button
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
            setEditValue('');
          }}
          disabled={!value || isLoading}
        />
      </Space.Compact>

      <Modal
        title="Edit Content"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width="80%"
        style={{ top: 20 }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Save Changes
          </Button>
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Content Statistics"
            description={
              <Space direction="vertical">
                <Text>{`Characters: ${editValue.length.toLocaleString()}`}</Text>
                <Text>{`Lines: ${editValue.split('\n').length.toLocaleString()}`}</Text>
                <Text>{`Approximate Size: ${((editValue.length * 2) / (1024 * 1024)).toFixed(2)} MB`}</Text>
              </Space>
            }
            type="info"
            showIcon
          />

          <Button
            icon={<CopyOutlined />}
            onClick={handlePasteFromClipboard}
          >
            Paste from Clipboard
          </Button>

          <Input.TextArea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={20}
            placeholder="Enter your text here"
            style={{
              fontFamily: 'monospace',
              fontSize: token.fontSize,
            }}
          />
        </Space>
      </Modal>
    </Spin>
  );
}