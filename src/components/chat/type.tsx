import React, { useState } from 'react';
import { Space, Spin, Typography, Button, Alert, List, Input, Card, Tag, Flex } from 'antd';
import { LoadingOutlined, RobotOutlined, BarChartOutlined, LineChartOutlined, BulbOutlined, CommentOutlined, SendOutlined, DatabaseOutlined } from '@ant-design/icons';
import { DbConfig } from '@/utils/db/type';
import { FetchDataMessage } from './chatMessages/FetchDataMessage';
import { DataSource, FetchedData } from '@/utils/dataSource';
import ReactMarkdown from 'react-markdown';
import { TextStream } from '../ui/TextStream';
import { PulsingText } from '../ui/PulsingText';
import { DisplayFetchedDataMessage } from './chatMessages/DisplayFetchedDataMessage';
import { DataTransformActionType } from '@/utils/pipelines/transformDataPipeline/type';
import TransformDataMessage from './chatMessages/TransformDataMessage';
import { AnalysisReportMessage } from './chatMessages/AnalysisReportMessage';
const { Text, Paragraph } = Typography;

export interface ChatMessage {
  id: string;
  content: React.ReactNode;
  sender: 'ai' | 'user' | 'pipeline';
  timestamp: Date;
  historyData?: PipelineHistoryData | string;
  onRefresh?: (text?: string) => void;
  onEdit?: () => void;
}

export interface PipelineHistoryData {

  toolResult: any;
  toolName: string;
  status: 'success' | 'error';

}

export const emptyChatMessage: ChatMessage = {
  id: '',
  content: <></>,
  sender: 'ai',
  timestamp: new Date(),
  historyData: ''
}

export interface FetchDataMessageData{
  relevantDataSources: DataSource[]
  currentStep: 'getDataSources' | 'fetchData' | 'finished'
  fetchedData?: FetchedData[]
  query?: string
}

export interface AnalysisMessageData{
  title?: string
  finished: boolean
}

export interface TransformDataMessageData {
  action?: DataTransformActionType;
  query?: string
  transformData?: FetchedData;
  finished: boolean;
}

export const createUserMessage = (text: string) => {
  return <Text type="secondary">{text}</Text>;
};

interface EditableMessageProps {
  text: string;
  onRefresh?: (text?: string) => void;
}

const EditableMessage: React.FC<EditableMessageProps> = ({ text, onRefresh }) => {
  const [editedText, setEditedText] = useState(text);

  return (
    <Space.Compact direction="horizontal" style={{ width: '100%' }}>
      
      <Input
        value={editedText} 
        onChange={(e) => setEditedText(e.target.value)} 
        variant="outlined"
        style={{ width: '100%' }}

      />
     
        <Button type="primary" onClick={() => onRefresh?.(editedText)} icon={<SendOutlined />}>
        </Button>
    </Space.Compact>
  );
};

export const createUserMessageWithEdit = (text: string, onRefresh?: (text?: string) => void) => {
  return <EditableMessage text={text} onRefresh={onRefresh} />;
};

export const createAIMessage = (text: string): React.ReactNode => {
  return <ReactMarkdown>{text}</ReactMarkdown>;
};


export const createAIMessageStream = (stream: ReadableStream<Uint8Array>, finishCallback?: (content: string) => void, removeTooling?: boolean): React.ReactNode => {
  return <TextStream stream={stream} finishCallback={finishCallback} removeTooling={removeTooling} />;
};

export const aiWelcomeMessage = (): React.ReactNode => {
  return (
    <Card size='small'>
      <Space direction="vertical" size="large">
        <Flex align="center" gap="small">
          <RobotOutlined style={{ fontSize: 24 }} />
          <Text strong>Welcome to PDI - Your AI-Powered Data Intelligence Assistant</Text>
        </Flex>
        <Paragraph>
          I can help you analyze and visualize your data from multiple sources including databases and CSV files. Here are some ways I can assist you:
        </Paragraph>
        <Space direction="vertical" size="middle">
          <Flex align="center" gap="small">
            <DatabaseOutlined />
            <Text>Connect and analyze data from MySQL and PostgreSQL databases</Text>
          </Flex>
          <Flex align="center" gap="small">
            <BarChartOutlined />
            <Text>Create intelligent data visualizations with multiple chart types</Text>
          </Flex>
          <Flex align="center" gap="small">
            <LineChartOutlined />
            <Text>Identify trends and patterns in your data</Text>
          </Flex>
          <Flex align="center" gap="small">
            <CommentOutlined />
            <Text>Answer questions about your data using natural language</Text>
          </Flex>
          <Flex align="center" gap="small">
            <BulbOutlined />
            <Text>Provide smart suggestions and insights from your data</Text>
          </Flex>
        </Space>
        <Paragraph type="secondary">
          To get started, you can ask me to load your data, create visualizations, or answer specific questions about your datasets.
        </Paragraph>
      </Space>
    </Card>
  );
};

export const aiErrorMessage = (error: string): React.ReactNode => {
  return <Text type="danger">{error}</Text>;
};

export const createLoadingMessage = (): React.ReactNode => {
  return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} size="large" />      
};

export const createLoadingPulsingMessage = (text: string, type: "secondary" | "success" | "warning" | "danger"): React.ReactNode => {
  return <PulsingText type={type}>{text}</PulsingText>
};

export const createFetchDataMessage = (fetchDataMessageData: FetchDataMessageData) => {
  return <FetchDataMessage fetchDataMessageData={fetchDataMessageData} />;
};

export const createDisplayFetchedDataMessage = (fetchedData: FetchedData) => {
  return <DisplayFetchedDataMessage fetchedData={fetchedData} />;
};

export const createSuggestionsMessage = (suggestions: string[], onSuggestionClick: (suggestion: string) => void) => {

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion);
  };

  return (
    <>
      <BulbOutlined style={{ fontSize: 18 }} />
      <Text>
        Here are some suggestions for your query:
      </Text>

        {suggestions.map((suggestion) => (
          <Button key={suggestion} type="default" size="small" onClick={() => handleSuggestionClick(suggestion)}>{suggestion}</Button>
        ))}
    </>
  )

};

export const createDataSetInfoMessage = (dataSources: DataSource[]) => {
  return (
    <Card size="small">
      <Space direction="horizontal" size="small">
        <Tag color="green">Data sources</Tag>
        <Text>
          {dataSources.map(dataSource => dataSource.name).join(', ')}
        </Text>
      </Space>
    </Card>
  )
};

export const createTransformDataMessage = (transformDataMessageData: TransformDataMessageData) => {
  return <TransformDataMessage transformDataMessageData={transformDataMessageData} />;
};

export const createAnalysisMessage = (analysisMessageData: AnalysisMessageData) => {
  return <AnalysisReportMessage analysisData={analysisMessageData}></AnalysisReportMessage>
}


