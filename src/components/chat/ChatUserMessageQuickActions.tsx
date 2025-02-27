import React from 'react';
import { Space, Button, Tooltip } from 'antd';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { ChatMessage } from './type';

interface ChatUserMessageQuickActionsProps {
  onRefresh?: () => void;
  disabled?: boolean;
  onEdit?: () => void;
}

export const ChatUserMessageQuickActions: React.FC<ChatUserMessageQuickActionsProps> = ({
  onRefresh,
  disabled = false,
  onEdit,
}) => {
  return (
    <Space.Compact size="small">
      <Tooltip title="Refresh">
        <Button
          type="text"
          icon={<ReloadOutlined />}
          size="small"
          onClick={() => onRefresh?.()}
          disabled={disabled}
        />
      </Tooltip>

      <Tooltip title="Edit">
        <Button
          type="text"
          icon={<EditOutlined />}
          size="small"
          onClick={() => onEdit?.()}
          disabled={disabled}
        />
      </Tooltip>
    </Space.Compact>
  );
};

export default ChatUserMessageQuickActions;
