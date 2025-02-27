import React, { useState } from 'react';
import { Button, Tooltip, Space, Modal, Flex, Typography } from 'antd';
import { ClearOutlined, SaveOutlined, DownloadOutlined, SettingOutlined, BulbOutlined, HddOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { DbConfig } from '@/utils/db/type';
import { DatabaseForm } from '@/components/forms/DatabaseForm';

interface QuickActionBarProps {
    onClearChat: () => void;
    onSaveChat?: () => void;
    onExportChat?: () => void;
    onOpenFetchedData?: () => void;
    onSetDbConfig?: (config: DbConfig) => Promise<void>;
    onGenerateSuggestions?: () => void;
    modelName: string
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({
    onClearChat,
    onOpenFetchedData,
    onSaveChat,
    onExportChat,
    onSetDbConfig,
    onGenerateSuggestions,
    modelName
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDbConfig = async (config: DbConfig) => {
        if (onSetDbConfig) {
            setLoading(true);
            try {
                await onSetDbConfig(config);
                setIsModalOpen(false);
            } finally {
                setLoading(false);
            }
        }
    };

    return (

        <Flex justify='space-between' style={{width: '100%'}}>
            <Space direction="horizontal" style={{flex: 1}}>
                <Tooltip title="Clear History">
                    <Button
                        icon={<ClearOutlined />}
                        onClick={onClearChat}
                        type="text"
                    />
                </Tooltip>
                {onSaveChat && (
                    <Tooltip title="Save Chat">
                        <Button
                            icon={<SaveOutlined />}
                            onClick={onSaveChat}
                            type="text"
                        />
                    </Tooltip>
                )}
                {onExportChat && (
                    <Tooltip title="Export Chat">
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={onExportChat}
                            type="text"
                        />
                    </Tooltip>
                )}
                {onSetDbConfig && (
                    <Tooltip title="Database Configuration">
                        <Button
                            icon={<SettingOutlined />}
                            onClick={() => setIsModalOpen(true)}
                            type="text"
                        />
                    </Tooltip>
                )}
                {onGenerateSuggestions && (
                    <Tooltip title="Generate Suggestions">
                        <Button
                            icon={<BulbOutlined />}
                            onClick={onGenerateSuggestions}
                            type="text"
                        />
                    </Tooltip>
                )}

                {onOpenFetchedData && (
                    <Tooltip title="Open available data">
                        <Button
                            icon={<FolderOpenOutlined />}
                            onClick={onOpenFetchedData}
                            type="text"
                        />
                    </Tooltip>
                )}


            </Space>

            <Flex>
                <Typography.Text type='secondary'>{modelName}</Typography.Text>
            </Flex>
        </Flex>
    );
};

export default QuickActionBar;
