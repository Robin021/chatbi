import React, { useEffect, useRef } from 'react';
import { List, Card } from 'antd';
import { ChatMessage as ChatMessageType } from './type';
import ChatMessage from './ChatMessage';
import { theme } from 'antd';

const { useToken } = theme;

interface ChatMessageContainerProps {
  messages: ChatMessageType[];
  height?: number;
  agentRunning: boolean
}

export const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({ messages, height = 60, agentRunning }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { token } = useToken();
  
  useEffect(() => {
    const shouldScroll = containerRef.current && (
      messages.length > 0 && 
      containerRef.current.scrollHeight > containerRef.current.clientHeight
    );
    
    if (shouldScroll) {
      containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
    }
  }, [messages.length, messages[messages.length - 1]]);

  return (
    <Card 
      style={{ 
        width: '100%', 
        overflowY: 'auto', 
        overflowX: 'hidden', 
        height: `${height}vh`, 
        display: 'block',
        position: 'relative',
      }}
      ref={containerRef}
    >
      {messages.length > 0 && (
        <List
          dataSource={messages}
          renderItem={(message, index) => {
            const isLastUserMessage = index === messages.length - 1 && message.sender === 'user';
            return (
              <List.Item key={message.id} style={{ border: 'none' }}>
                {message.content && <ChatMessage message={message} loading={isLastUserMessage} />}
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default ChatMessageContainer;
