import React, { useState, useEffect, useRef } from 'react';
import { Space, Spin, Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import { LoadingOutlined } from '@ant-design/icons';
import gfm from 'remark-gfm';
const { Paragraph } = Typography;

interface TextStreamProps {
  stream: ReadableStream<Uint8Array> | null;
  finishCallback?: (content: string) => void;
  removeTooling?: boolean;
}

export const TextStream: React.FC<TextStreamProps> = ({ stream, finishCallback, removeTooling }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!stream || hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsLoading(true);

    const decoder = new TextDecoder();
    let accumulatedContent = '';

    const processStream = async () => {
      try {
        const reader = stream.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsLoading(false);
            break;
          }
          
          const text = decoder.decode(value, { stream: true });
          if (!text) continue;
          
          accumulatedContent += text;
          
          if (removeTooling) {
            // Check for unbalanced tool tags
            const openTags = (accumulatedContent.match(/<tool>/g) || []).length;
            const closeTags = (accumulatedContent.match(/<\/tool>/g) || []).length;
            
            if (openTags === closeTags) {
              // Only display content when tags are balanced
              setContent(accumulatedContent.replace(/<tool>[\s\S]*?<\/tool>/g, ''));
            } else {
              // If tags are unbalanced, display content up to the last complete tag pair
              const lastCompleteContent = accumulatedContent.split('<tool>')[0];
              setContent(lastCompleteContent);
            }
          } else {
            setContent(accumulatedContent);
          }
        }
        
        finishCallback?.(accumulatedContent);
      } catch (error) {
        console.error('Error processing stream:', error);
        setIsLoading(false);
      }
    };

    processStream();
  }, [stream, finishCallback, removeTooling]);

  return (
    <Space direction="vertical" size="small">
      
      {content.length > 10 && <ReactMarkdown remarkPlugins={[gfm]}>{content}</ReactMarkdown>}
      
    </Space>
  );
};
