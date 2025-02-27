import React, { useEffect, useState } from 'react';
import { Modal, Typography, Dropdown, Flex, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { FetchedData, DataFetchingConfig } from '@/utils/dataSource/type';
import type { MenuProps } from 'antd';
import DataDisplay from './dataDisplay/DataDisplay';

interface DisplayFetchedDataListModalProps {
    fetchedDataList: FetchedData[];
    visible: boolean;
    onCancel: () => void;
    onFetchMore: (oldData: FetchedData, config: DataFetchingConfig) => Promise<FetchedData>;
    onRemoveFetchData: (id: string) => void,
    maxLLMRows: number
}

export const DisplayFetchedDataListModal: React.FC<DisplayFetchedDataListModalProps> = ({ 
    fetchedDataList, 
    visible, 
    onCancel,
    onFetchMore,
    onRemoveFetchData,
    maxLLMRows
}) => {
    const [selectedFetchedData, setSelectedFetchedData] = useState<FetchedData | null>(null);
    const [loading, setLoading] = useState(false);
    const [availableData, setAvailableData] = useState<FetchedData[]>(fetchedDataList);

    useEffect(() => {
        setSelectedFetchedData(null);
        setAvailableData(fetchedDataList);
    }, [visible, fetchedDataList]);

    const items: MenuProps['items'] = fetchedDataList.map(data => ({
        key: data.id,
        label: data.dataName,
        onClick: () => setSelectedFetchedData(data),
    }));

    const handleFetchMore = async (config: DataFetchingConfig) => {
        if (!selectedFetchedData) return;
        setLoading(true);
        try {
            const newData = await onFetchMore(selectedFetchedData, config);
            setSelectedFetchedData(newData);
        } catch (error) {
            console.error('Error fetching more data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFetchData = (id: string) => {
        onRemoveFetchData(id);
        if (selectedFetchedData?.id === id) {
            setSelectedFetchedData(null);
        }
        setAvailableData(prev => prev.filter(data => data.id !== id));
    };

    return (
        <Modal
            open={visible}
            width='60%'
            onCancel={onCancel}
            footer={null}
        >
            <Flex vertical style={{width: '100%', gap: '1rem'}}>
                {availableData.length === 0 ? (
                    <Typography.Text type="secondary">
                        No fetched data available
                    </Typography.Text>
                ) : (
                    <>
                        <Flex justify='flex-start'>
                            <Dropdown
                                menu={{
                                    items: availableData.map(data => ({
                                        key: data.id,
                                        label: data.dataName,
                                        onClick: () => setSelectedFetchedData(data),
                                    })),
                                    selectable: true,
                                    selectedKeys: selectedFetchedData ? [selectedFetchedData.id] : [],
                                }}
                            >
                                <Typography.Link>
                                    <Space>
                                        {selectedFetchedData?.dataName || 'Select Data'}
                                        <DownOutlined />
                                    </Space>
                                </Typography.Link>
                            </Dropdown>
                        </Flex>

                        <Flex vertical align="center" style={{width: '100%'}}>
                            {selectedFetchedData ? (
                                <DataDisplay
                                    fetchedData={selectedFetchedData}
                                    loading={loading}
                                    onFetchMore={handleFetchMore}
                                    onRemoveFetchedData={handleRemoveFetchData}
                                    maxLLMRows={maxLLMRows}
                                />
                            ) : (
                                <Typography.Text type="secondary">
                                    Please select fetched data to preview
                                </Typography.Text>
                            )}
                        </Flex>
                    </>
                )}
            </Flex>
        </Modal>
    );
};
