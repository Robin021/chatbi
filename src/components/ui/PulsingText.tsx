import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export const PulsingText: React.FC<{
  children: React.ReactNode;
  type?: 'secondary' | 'success' | 'warning' | 'danger';
}> = ({ children, type}) => {
  const text = children?.toString() || '';
  const endsWithDots = text.endsWith('...');
  const isOnlyDots = text === '...';
  
  const baseText = endsWithDots ? text.slice(0, -3) : text;
  
  return (
    <Text
      type={type}
      strong
      italic
      style={{
        display: 'inline-block',
        animation: 'pulse 1.2s ease-in-out infinite',
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0% { 
              opacity: 0.3;
              transform: scale(0.99);
            }
            50% { 
              opacity: 1;
              transform: scale(1);
            }
            100% { 
              opacity: 0.3;
              transform: scale(0.99);
            }
          }
          .dot {
            display: inline-block;
            margin-left: 2px;
            opacity: 0;
            transform: translateY(0);
          }
          .dot-large {
            font-size: 24px;
            margin-left: 4px;
          }
          .dot-1 {
            animation: dotAnimation 1.2s ease-in-out infinite;
          }
          .dot-2 {
            animation: dotAnimation 1.2s ease-in-out infinite 0.2s;
          }
          .dot-3 {
            animation: dotAnimation 1.2s ease-in-out infinite 0.4s;
          }
          @keyframes dotAnimation {
            0%, 100% { 
              opacity: 0;
              transform: translateY(0);
            }
            25% { 
              opacity: 1;
              transform: translateY(-4px);
            }
            50% { 
              opacity: 1;
              transform: translateY(0);
            }
            75% { 
              opacity: 0;
              transform: translateY(0);
            }
          }
        `}
      </style>
      {baseText}
      {endsWithDots && (
        <>
          <span className={`dot dot-1 ${isOnlyDots ? 'dot-large' : ''}`}>.</span>
          <span className={`dot dot-2 ${isOnlyDots ? 'dot-large' : ''}`}>.</span>
          <span className={`dot dot-3 ${isOnlyDots ? 'dot-large' : ''}`}>.</span>
        </>
      )}
    </Text>
  );
}; 