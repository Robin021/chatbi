import { ChatPipeline, ChatPipelineInput } from "./type";
import { aiErrorMessage, ChatMessage, emptyChatMessage, PipelineHistoryData } from "../type";
import { getChartType, generateChartConfig } from '@/utils/pipelines/genChartPipeline/api';
import { dataSetController } from "@/utils/pocketbase/collections/dataSetController";
import { FetchedData } from "@/utils/dataSource/type";
import { GenChartMessageData, createGenChartMessage } from "../chatMessages/GenChartMessage";
import { ChartTypeResult, ChartConfigResult } from "@/utils/pipelines/genChartPipeline/type";
import translation from '@/locales/translation';

const getTranslation = (path: string[], lang: 'cn' | 'en' = 'en') => {
    let current: any = translation;
    for (const key of path) {
        if (current[key]) {
            current = current[key];
        } else {
            return '';
        }
    }
    return current[lang] || '';
};

const createPipelineHistoryData = (toolResult: any, status: 'success' | 'error'): PipelineHistoryData => {
    return {
        toolResult,
        toolName: 'GenChart',
        status
    };
};

export const genChartsPipeline: ChatPipeline = {
    name: 'GenChart',
    description: 'Based on the data query it selects the chart type, generates a chart and displays it in chat. Don\'t use for analysis only for visualization.',
    requiredInputs: [ChatPipelineInput.fetchedDataId, ChatPipelineInput.dataQuery],
    run: async (actions, input, agent, lang: 'cn' | 'en' = 'en') => {
        const chartGenQuery = input[ChatPipelineInput.dataQuery];
        const fetchedDataId = input[ChatPipelineInput.fetchedDataId];

        console.log('GenChartsPipeline inputs:', { chartGenQuery, fetchedDataId });

        const messageData: GenChartMessageData = {
            currentStep: 'analyzingData'
        };

        if (!fetchedDataId || !chartGenQuery) {
            const missingInputs = {
                dataSourceDataName: !fetchedDataId,
                chartGenQuery: !chartGenQuery
            };
            console.error('Missing required inputs:', missingInputs);
            const errorMessage = getTranslation(['chart', 'pipeline', 'errors', 'missingInputs'], lang) + 
                Object.keys(missingInputs).filter(k => missingInputs[k]).join(', ');
            const errorResult = createPipelineHistoryData(errorMessage, 'error');
            return { 
                ...emptyChatMessage, 
                sender: 'pipeline', 
                historyData: errorResult 
            };
        }

        const dataSourceData = actions.getFetchedDataById(fetchedDataId);
        if (!dataSourceData) {
            console.error('Data not found in chat history:', { fetchedDataId });
            const errorMessage = getTranslation(['chart', 'pipeline', 'errors', 'dataNotFound'], lang);
            const errorResult = createPipelineHistoryData(errorMessage, 'error');
            return { 
                ...emptyChatMessage, 
                sender: 'pipeline', 
                historyData: errorResult 
            };
        }

        if (!dataSourceData.data?.rows || !Array.isArray(dataSourceData.data.rows) || dataSourceData.data.rows.length === 0) {
            console.error('Invalid data format:', dataSourceData);
            const errorMessage = getTranslation(['chart', 'pipeline', 'errors', 'invalidData'], lang);
            const errorResult = createPipelineHistoryData(errorMessage, 'error');
            return { 
                ...emptyChatMessage, 
                sender: 'pipeline', 
                historyData: errorResult 
            };
        }

        const aiMessageId = actions.getNextMessageId();
        const aiMessage: ChatMessage = {
            id: aiMessageId,
            content: createGenChartMessage(messageData, lang),
            sender: 'pipeline',
            timestamp: new Date()
        };

        actions.addMessage(aiMessage);

        try {
            // 1. Sample data for analysis
            const sampleDataForAnalysis = sampleData(dataSourceData.data.rows);
            console.log('Sample data for analysis:', sampleDataForAnalysis);

            // 2. Use LLM to analyze and recommend chart type
            const chartTypeResult: ChartTypeResult = await getChartType({
                sampleData: sampleDataForAnalysis,
                query: chartGenQuery,
                llm: agent.llm
            });
            console.log('Chart type result:', chartTypeResult);
            messageData.chartType = chartTypeResult.chartType;
            messageData.explanation = chartTypeResult.reasoning;
            messageData.currentStep = 'generatingChart';
            actions.updateMessage({...aiMessage, content: createGenChartMessage(messageData, lang)});

            // 3. Generate complete ECharts config
            const chartConfigResult: ChartConfigResult = await generateChartConfig({
                chartType: chartTypeResult.chartType,
                data: dataSourceData.data.rows,
                query: chartGenQuery
            });
            
            messageData.chartConfig = chartConfigResult.config;
            messageData.currentStep = 'finished';
            messageData.data = dataSourceData.data.rows;
            messageData.query = chartGenQuery;
            
            const successResult = createPipelineHistoryData('Successfully generated and displayed chart', 'success');

            const finalMessage = {
                ...aiMessage,
                content: createGenChartMessage(messageData, lang),
                historyData: successResult
            };

            actions.updateMessage(finalMessage);
            return finalMessage;

        } catch (error) {
            console.error('Error in chart generation:', error);
            const errorMessage = error instanceof Error ? error.message : (
                lang === 'cn' ? '生成图表时发生错误' : 'Error occurred while generating chart'
            );
            messageData.error = errorMessage;
            const errorResult = createPipelineHistoryData(errorMessage, 'error');
            
            const finalMessage = {
                ...aiMessage,
                content: createGenChartMessage(messageData, lang),
                historyData: errorResult
            };
            
            actions.updateMessage(finalMessage);
            return finalMessage;
        }
    }
};

const sampleData = (data: any[], sampleSize: number = 5) => {
    if (data.length <= sampleSize) return data;
    const step = Math.floor(data.length / sampleSize);
    return data.filter((_, index) => index % step === 0).slice(0, sampleSize);
};