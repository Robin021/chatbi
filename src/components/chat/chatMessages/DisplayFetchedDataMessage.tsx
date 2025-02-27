import React, { useState } from 'react';
import { Typography, Flex, Tag, Button, Modal, Card, Badge } from 'antd';
import { TableOutlined, EyeOutlined, CloudOutlined } from '@ant-design/icons';
import { FetchedData } from '@/utils/dataSource/type';

const { Text } = Typography;

interface DisplayFetchedDataMessageProps {
    fetchedData: FetchedData;
}

export const FetchedDataMessage = ({fetchedData}: DisplayFetchedDataMessageProps) => {

    return (
        <Badge size='small' count={` ${fetchedData.currentLoadedRows} / ${fetchedData.totalRowsAvailable} `} status='default'> 
    <Card size="small">
        <Flex vertical gap="small">
            <Flex align="center" gap="small">
                <TableOutlined />
                <Text type="secondary">{fetchedData.dataName}</Text>
                <Tag color='default'>
                    {fetchedData.dataSource.name}
                </Tag>
            </Flex>
        </Flex>
    </Card>
    </Badge>)
}

export const DisplayFetchedDataMessage: React.FC<DisplayFetchedDataMessageProps> = ({
    fetchedData
}) => {
           
    return <FetchedDataMessage fetchedData={fetchedData} />
        
    
};