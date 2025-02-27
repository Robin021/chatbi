'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Card, Space } from 'antd';
import ChatMessageContainer from '@/components/chat/ChatMessageContainer';
import { createUserMessage, ChatMessage, aiWelcomeMessage, createLoadingMessage, createUserMessageWithEdit } from '@/components/chat/type';
import ChatInput from '@/components/chat/ChatInput';
import QuickActionBar from './QuickActionBar';
import { useToast } from '@/hooks/useToast';
import { fetchDataPipeline } from './chatPipelines/fetchDataPipeline';
import { ChatActions, ChatPipelineInput } from './chatPipelines/type';
import { databaseController } from '@/utils/pocketbase/collections/databaseController';
import { fetchSchema } from '@/utils/db/schema';
import { DataSetRecord } from '@/utils/pocketbase/collections/type';
import { Agent } from '@/utils/agent/type';
import { DataFetchingConfig, FetchedData, FetchedDataHash, calculateFetchedDataHash } from '@/utils/dataSource/type';
import {DisplayFetchedDataListModal} from '@/components/modals/DisplayFetchedDataListModal'
import { fetchMore } from '@/utils/dataSource/api';


interface ChatProps {
    dataset: DataSetRecord;
    agent: Agent;
}


const Chat: React.FC<ChatProps> = ({dataset, agent}) => {

    const { success, error } = useToast(); 

    const fetchedDataList = useRef<{data: FetchedData, hash: FetchedDataHash}[]>([]);

    const [isDisplayFetchedDataListModalVisible , setIsDisplayFetchedDataListModalVisible] = useState(false)
    const [agentRunning, setAgentRunning] = useState(false);

    const getNextMessageId = () => {
        return `msg-${Math.random().toString(36).slice(2, 11)}`;
    };

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'msg-1',
            content: aiWelcomeMessage(),
            sender: 'ai',
            timestamp: new Date(),
            historyData: 'Hello! I\'m your AI Data Assistant. How can I help you today?'
        }
    ]);

    const dataRef = useRef<FetchedData[]>([]);

    const removeMessage = (messageId: string) => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    };

    const addMessage = (message: ChatMessage) => {
        setMessages(prevMessages => [...prevMessages, message]);
    };

    const updateMessage = (message: Partial<ChatMessage>) => {
        let foundMessage = false;

        setMessages(prevMessages => {
            const messageIndex = prevMessages.findIndex(msg => msg.id === message.id);
            if (messageIndex === -1) {
                foundMessage = false;
                return prevMessages;
            }

            return [
                ...prevMessages.slice(0, messageIndex),
                {
                    ...prevMessages[messageIndex],
                    ...message
                },
                ...prevMessages.slice(messageIndex + 1)
            ];
        });

        return foundMessage;
    };

    const getFetchedDataById = (id: string) => {
        return fetchedDataList.current.find(item => item.data.id === id)?.data;
    }

    const removeFetchedDataById = (id: string) => {
        fetchedDataList.current = fetchedDataList.current.filter(
            item => item.data.id !== id
        );
    };

    const setFetchedData = (fetchedData: FetchedData) => {
        // Calculate hash for the new data
        const newHash = calculateFetchedDataHash(fetchedData);
        
        // First check for existing ID
        const existingIdIndex = fetchedDataList.current.findIndex(
            item => item.data.id === fetchedData.id
        );

        if (existingIdIndex !== -1) {
            // Update existing data by ID while updating the hash
            fetchedDataList.current[existingIdIndex] = {
                data: fetchedData,
                hash: newHash
            };
            return;
        }

        // If no ID match, check for hash match
        const existingHashIndex = fetchedDataList.current.findIndex(
            item => item.hash === newHash
        );

        if (existingHashIndex === -1) {
            // Add new data with its hash
            fetchedDataList.current.push({
                data: fetchedData,
                hash: newHash
            });
        } else {
            // Update existing data while preserving the hash
            fetchedDataList.current[existingHashIndex] = {
                data: fetchedData,
                hash: newHash
            };
        }
    };

    const getFetchedDataList = () => {
        return fetchedDataList.current.map((item) => item.data);
    }

    const getFetchedDataListPreview = () => {
        return fetchedDataList.current.map((item) => {
            const {dataSource, metadata, ...previewData} = { ...item.data };
                     
            if (previewData.data.rows.length > agent.maxLLMRows) {
                previewData.data = {
                    columns: previewData.data.columns,
                    rows: previewData.data.rows.slice(0, agent.maxLLMRows)
                };
                previewData.currentLoadedRows = agent.maxLLMRows;
            }
        

            return previewData;
        });
    }

    const actions: ChatActions = {
        addMessage,
        updateMessage,
        removeMessage,
        getNextMessageId,
        getFetchedDataById,
        setFetchedData,
        getFetchedDataList,
        getFetchedDataListPreview
    }

    const handleSendMessage = async (message: string) => {

        setAgentRunning(true);

        const userMessageId = getNextMessageId();
        const userMessage: ChatMessage = {
            id: userMessageId,
            content: createUserMessage(message),
            sender: 'user',
            historyData: message,
            timestamp: new Date(),
            onRefresh: (text?: string) => {
                setMessages(prevMessages => {
                    const messageIndex = prevMessages.findIndex(msg => msg.id === userMessageId);
                    if (messageIndex !== -1) {
                        // Remove this message and all subsequent messages
                        const updatedMessages = prevMessages.slice(0, messageIndex);
                        return updatedMessages;
                    }
                    return prevMessages;
                });
                // Call handleSendMessage after the state update is complete
                setTimeout(() => handleSendMessage(text || message), 0);
            },
            onEdit: () => {
                setMessages(prevMessages => {
                    const newMessages = prevMessages.map(msg => {
                        if (msg.id === userMessageId) {
                            return {
                                ...msg,
                                content: createUserMessageWithEdit(message, msg.onRefresh)
                            };
                        }
                        return msg;
                    });
                    return newMessages;
                });
            }
        };

        //fix this is not the best way to do this maybe store some intermediate messages
        setMessages(prev => [...prev, userMessage]);

        const finishedCallback = () => {    
            setAgentRunning(false);
        }

        await agent.run([...messages, userMessage], actions, {datasetID: dataset.id }, finishedCallback);

    };

    const handleFetchMore = async (oldData: FetchedData, config: DataFetchingConfig): Promise<FetchedData> => {
        try {
            const newData = await fetchMore(oldData, config);
            actions.setFetchedData(newData)

            return newData;
        } catch (err) {
            console.error('Error fetching more data:', err);
            throw err;
        }
    };

    return (

        <Card style={{ width: '100%', margin: 'auto' }}>
            <QuickActionBar modelName={agent.llm.model} onClearChat={() => { if (!agentRunning){ setMessages([]); dataRef.current = []} }} onOpenFetchedData={() => setIsDisplayFetchedDataListModalVisible(true)}/>

            <ChatMessageContainer messages={messages} height={70} agentRunning={agentRunning} />
            <ChatInput onSendMessage={handleSendMessage} disabled={agentRunning} loading={agentRunning}  />

            <DisplayFetchedDataListModal
                fetchedDataList={getFetchedDataList()} 
                visible={isDisplayFetchedDataListModalVisible} 
                onCancel={() => setIsDisplayFetchedDataListModalVisible(false)} 
                onFetchMore={handleFetchMore}
                onRemoveFetchData={(id: string) => removeFetchedDataById(id)}
                maxLLMRows={agent.maxLLMRows}
            />

        </Card>

        

    );
};

export default Chat; 