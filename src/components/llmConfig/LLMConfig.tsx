import React, { useState, useEffect } from 'react';
import { Card, Button, List, Modal, Typography } from 'antd';
import { LLMForm } from './LLMForm';
import { llmController } from '@/utils/pocketbase/collections/llmController';
import { LLMRecord } from '@/utils/pocketbase/collections/type';
import { llm } from '@/utils/llm/api';
import { useToast } from '@/hooks/useToast';
import { LoadingButton } from '../ui/LoadingButton';

const { Text } = Typography;

interface LLMConfigProps {
  disabled?: boolean;
}

const LLMConfig: React.FC<LLMConfigProps> = ({ disabled = false }) => {
  const [llms, setLlms] = useState<LLMRecord[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentLLM, setCurrentLLM] = useState<LLMRecord | null>(null);
  const {error, success} = useToast()

  useEffect(() => {
    const fetchLLMs = async () => {
      const llmList = await llmController.list();
      setLlms(llmList);
    };
    fetchLLMs();
  }, []);

  const handleDelete = async (id: string) => {
    await llmController.delete(id);
    setLlms(llms.filter(llm => llm.id !== id));
  };

  const showModal = (llm?: LLMRecord) => {
    setCurrentLLM(llm || null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentLLM(null);
  };

  const refreshLLMs = async () => {
    const llmList = await llmController.list();
    setLlms(llmList);
  };

  const testConnection = async (llmRecord: LLMRecord) => {
    try {
      const response = await llm('Hi', llmRecord)
      if (response) {
        success({ message: 'Connection successful!' });
      } else {
        error({ message: 'Failed to reach llm!' });
      }
    } catch (e) {
      error({ message: 'Failed to reach llm!' });
    }
  };

  return (
    <Card 
      title="LLM Configuration" 
      extra={
        <Button 
          type='primary' 
          onClick={() => showModal()} 
          disabled={disabled}
        >
          Add LLM
        </Button>
      } 
      style={{width: '80%'}}
    >
      <List
        dataSource={llms}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                key={item.id} 
                onClick={() => showModal(item)}
                disabled={disabled}
              >
                Edit
              </Button>,
              <Button 
                key={item.id} 
                danger 
                onClick={() => handleDelete(item.id)}
                disabled={disabled}
              >
                Delete
              </Button>,
              <LoadingButton 
                key={item.id} 
                onClick={() => testConnection(item)}
              >
                Test Connection
              </LoadingButton>
            ]}
          >
            <Text strong>{item.model}</Text>
          </List.Item>
        )}
      />
      <Modal 
        title={currentLLM ? "Edit LLM" : "Add LLM"} 
        open={isModalVisible} 
        onCancel={handleModalClose} 
        footer={null}
      >
        <LLMForm 
          llm={currentLLM} 
          onClose={handleModalClose} 
          onRefresh={refreshLLMs}
          disabled={disabled}
        />
      </Modal>
    </Card>
  );
};

export default LLMConfig;
