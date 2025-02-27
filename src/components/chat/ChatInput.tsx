import React, { useState, KeyboardEvent } from 'react';
import { Input, Button, Space, Row, Card } from 'antd';
import { SendOutlined, LineChartOutlined } from '@ant-design/icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  loading = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card style={{ width: '100%', padding: '0px', marginTop: '16px' }} size="small"  hoverable={true}>
      <Space.Compact block style={{ width: '100%' }}>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Type your message..."
          disabled={disabled}
          prefix={ <LineChartOutlined />}
          size="large"
          allowClear
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          loading={loading}
          size="large"
        >
          Send
        </Button>
      </Space.Compact>

    </Card>
  );
};

export default ChatInput;
