'use client';

import React, { useEffect, useState } from 'react';
import { Card, Typography, Menu, Button, Empty, Flex, theme, Layout, Drawer, Space, Spin, Tooltip, Select, Divider } from 'antd';
import Chat from '@/components/chat/Chat';
import { DataSetRecord, LLMRecord } from '@/utils/pocketbase/collections/type';
import { dataSetController } from '@/utils/pocketbase/collections/dataSetController';
import { DatabaseOutlined, ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import { createToolCallingAgent, createRecursiveToolCallingAgent, createSimpleToolCallingAgent } from '@/utils/agent/api';
import { fetchDataPipeline } from '@/components/chat/chatPipelines/fetchDataPipeline';
import { getDataSetInfoPipeline } from '@/components/chat/chatPipelines/getDataSetInfoPipeline';
import { genChartsPipeline } from '@/components/chat/chatPipelines/genChartsPipeline';
import { analyseDataPipeline } from '@/components/chat/chatPipelines/analyseDataPipeline';
import { transformDataPipeline } from '@/components/chat/chatPipelines/transformDataPipeline';
import { llmController } from '@/utils/pocketbase/collections/llmController';
import { Agent } from '@/utils/agent/type';
const { Title, Text } = Typography;
const { Content } = Layout;

const systemPrompt = `You are an recursive data analysis agent focused on helping users analyze their dataset effectively. You give short and concise answers.
            
            Important:
            - Don't let the user know that you are using tools to get information.
            - Don't directly copy tool responses, instead extract the information you need from the tool response.
            - Make sure to input the complete parameters.
            - Don't response with whole data. The user can see the data in the ui
            - Focus on Data structure (columns) instead of the actual data (rows)
            - Use the most recent information from the context data instead of the chat history

            Additional information:
            - A dataset is a collection of data sources.
            - A data source is a collection of data.
            - A data source can be queried using natural language.
            - A data source data is a container holding fetched data from a data source.
            - You only operate on one dataset, don't try to get information from other datasets
            - Never use the datasetID in your responses, only use it internally.

            If you can't solve a user query because you are missing tools or have other concerns give the user a friendly and polite sorry message. 

`;

const agentData = {
  name: 'Data Analysis Agent',
  pipelines: [fetchDataPipeline, getDataSetInfoPipeline, genChartsPipeline, transformDataPipeline],
  systemPrompt: systemPrompt,
  dataFetchingConfig: {
    limitRows: 20
  },
  maxLLMRows: 100
};

const ChartAnalysisPage: React.FC = () => {
  const { token } = theme.useToken();
  const [dataSet, setDataSet] = useState<DataSetRecord | null>(null);
  const [dataSets, setDataSets] = useState<DataSetRecord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [availableLlms, setAvailableLLMs] = useState<LLMRecord[]>([])
  const [selectedLlm, setSelectedLlm] = useState<LLMRecord | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null)

  useEffect(() => {
    setMounted(true);
    setDrawerOpen(false);

    const fetchLLMs = async () => {
      const llmList = await llmController.list();
      setAvailableLLMs(llmList);
    };
    fetchLLMs();

  }, []);

  useEffect(() => {
    const fetchDataSets = async () => {
      const dataSets = await dataSetController.list();
      setDataSets(dataSets);
    }
    fetchDataSets();
  }, []);

  const handleDataSetSelect = async (selectedSet: DataSetRecord) => {
    setIsLoading(true);
    setDrawerOpen(false);

    // Simulate loading for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (selectedLlm) {
      setAgent(createRecursiveToolCallingAgent({ ...agentData, llm: selectedLlm }))
    }
    setDataSet(selectedSet);
    setIsLoading(false);
  };

  const handleLlmSelect = (value: string) => {
    const selected = availableLlms.find(llm => llm.id === value);
    setSelectedLlm(selected || null);
  };

  const DataSetSelector = () => (
    <Flex vertical gap="middle">

      {dataSets.length > 0 ? (
        <Menu
          style={{ overflow: 'auto', border: 'none' }}
          items={dataSets.map((item) => ({
            key: item.id,
            label: item.name,
            icon: <DatabaseOutlined />,
            onClick: () => handleDataSetSelect(item)
          }))}
          theme="light"
        />
      ) : (
        <Empty description="No datasets found">
          <Button type="primary" href="/data">Create Dataset</Button>
        </Empty>
      )}
    </Flex>
  );

  return (
    <Layout>
      <Content>
        <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>

          {isLoading ? (
            <Spin size="large" />
          ) : (dataSet && agent) ? (
            <Flex vertical style={{ maxWidth: token.screenXL, width: '100%', padding: token.padding }}>
              <Flex justify="flex-end" align="center" gap="large" style={{ marginBottom: token.margin }}>

                <Text strong>{dataSet.name}</Text>
                <Tooltip title="Change Dataset">
                  <Button
                    icon={<DatabaseOutlined />}
                    onClick={() => setDrawerOpen(true)}
                    type="text"
                  >
                  </Button>
                </Tooltip>
              </Flex>
              <Chat dataset={dataSet} agent={agent} />

            </Flex>
          ) : (
            <Card title={<Flex style={{width: '100%'}} justify='center'><Typography.Text  strong>Chart Lab</Typography.Text></Flex>}>
             
              <Flex vertical>

                
                <Select
                  placeholder="Select an LLM"
                  onChange={handleLlmSelect}
                  style={{ width: 200, marginBottom: token.margin }}
                >
                  {availableLlms.map(llm => (
                    <Select.Option key={llm.id} value={llm.id}>
                      {llm.model}
                    </Select.Option>
                  ))}
                </Select>

                <Button
                  type="primary"
                  size="large"
                  icon={<DatabaseOutlined />}
                  onClick={() => setDrawerOpen(true)}
                  disabled={selectedLlm === null}
                >
                  Select a Dataset
                </Button>
              </Flex>
            </Card>
          )}

          {mounted && (
            <Drawer
              title={
                <Flex justify="space-between" align="center" style={{ padding: token.paddingXS }}>
                  <Typography.Title level={5} style={{ margin: 0 }}>Select Dataset</Typography.Title>
                  <Button
                    onClick={() => setDrawerOpen(false)}
                    icon={<CloseOutlined />}
                    type="text"
                    size="small"
                  />
                </Flex>
              }
              placement="right"
              open={drawerOpen}
              onClose={() => dataSet && setDrawerOpen(false)}
              closeIcon={false}
              width={400}
            >
              <DataSetSelector />
            </Drawer>
          )}
        </Flex>
      </Content>
    </Layout>
  );
};

export default ChartAnalysisPage;