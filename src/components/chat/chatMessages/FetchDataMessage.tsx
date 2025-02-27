import React, { useState } from 'react';
import { Typography, Flex, List, Space, Tag, Button, Modal, Table, Card } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { FetchDataMessageData } from '../type';
import { dataSourceTypes } from '@/utils/dataSource';
import { PulsingText } from '@/components/ui/PulsingText';
import { DisplayFetchedDataMessage } from './DisplayFetchedDataMessage';

const { Text } = Typography;

export const FetchDataMessage: React.FC<{ fetchDataMessageData: FetchDataMessageData }> = ({
    fetchDataMessageData
}) => {
    const { currentStep, relevantDataSources, fetchedData, query } = fetchDataMessageData;

    return (
        <Flex vertical gap="middle">
            {query && (
                <Text type="secondary" italic>
                    Query: {query}
                </Text>
            )}
            
            {/* Data Sources Section */}
            {relevantDataSources.length > 0 && (
                <Card size="small">
                    <Flex vertical gap="small">
                        {relevantDataSources.map((source, index) => (
                            <Flex key={index} align="center" gap="small">
                                {React.createElement(dataSourceTypes.find(type => type.type === source.type)?.icon || DatabaseOutlined)}
                                <Text type="secondary">{source.name}</Text>
                                <Tag color={dataSourceTypes.find(type => type.type === source.type)?.tagColor}>
                                    {source.type}
                                </Tag>
                            </Flex>
                        ))}
                    </Flex>
                </Card>
            )}

            {/* Fetched Data Section */}        
            {fetchedData && fetchedData.length > 0 && (         
                <Flex vertical gap="small">
                    {fetchedData.map((data, index) => (
                        <DisplayFetchedDataMessage 
                            key={index} 
                            fetchedData={data}
                        />
                    ))}
                </Flex>            
            )}

            {currentStep !== 'finished' && (
                <Flex align="flex-start" gap="small" justify='flex-start' vertical>
                    <PulsingText type='secondary'>...</PulsingText>
                </Flex>
            )}
        </Flex>
    );
};