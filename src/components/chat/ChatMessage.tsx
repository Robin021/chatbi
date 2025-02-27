import React from 'react';
import { Card, Typography, Space, Row, theme, Spin } from 'antd';
import { ChatMessage as ChatMessageType } from './type';
import { ChatUserMessageQuickActions } from './ChatUserMessageQuickActions';

const { Text } = Typography;
const { useToken } = theme;
interface ChatMessageProps {
  message: ChatMessageType;
  loading: boolean
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, loading }) => {
  const isAI = message.sender === 'ai' || message.sender === 'pipeline';
  const { token } = useToken();

  return (
    <Row justify={isAI ? 'start' : 'end'} style={{ width: '100%' }}>
      {loading ? ( // Check if loading is true
        <Spin style={{ margin: 'auto' }} /> // Show loading animation
      ) : isAI ? (
        <Space direction="vertical" style={{ maxWidth: '70%', marginRight: 'auto' }}>
          {message.content}
        </Space>
      ) : (
        <Card
          size="small"
          style={{ 
            maxWidth: '70%',
            marginLeft: 'auto',
            backgroundColor: token.colorBgContainerDisabled,
          }}
        >
          {message.content}
          <Space align="center" size="small" style={{ width: '100%', justifyContent: 'space-between', marginTop: 10 }}>
            <Text type="secondary">You</Text>
            <ChatUserMessageQuickActions onRefresh={message.onRefresh} onEdit={message.onEdit}/>
          </Space>
        </Card>
      )}
    </Row>
  );
};

export default ChatMessage;
