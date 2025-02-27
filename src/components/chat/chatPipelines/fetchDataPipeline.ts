import { ChatPipeline, ChatPipelineInput } from "./type";
import { Agent } from "@/utils/agent/type";
import { aiErrorMessage, ChatMessage, createFetchDataMessage, emptyChatMessage, FetchDataMessageData } from "../type";
import { getRelevantDataSources, fetchData } from '@/utils/pipelines/fetchDataPipeline/api'
import { dataSetController } from "@/utils/pocketbase/collections/dataSetController";

const updateAiMessage = (message: ChatMessage, fetchDataMessageData: FetchDataMessageData) => {
    return {
        ...message,
        content: createFetchDataMessage(fetchDataMessageData)
    };
}

export const fetchDataPipeline: ChatPipeline = {
    name: 'FetchData',
    description: 'Determines which data sources are relevant to the input query and fetches new data and displays it in the chat. Don\' use to get general information about dataset or transform data! Use only if the user specificly requested to fetch new data! Prefer to use already fetched data!',
    requiredInputs: [ChatPipelineInput.dataQuery, ChatPipelineInput.datasetID],
    run: async (actions, input, agent) => {

        const dataQuery = input[ChatPipelineInput.dataQuery];
        const datasetID = input[ChatPipelineInput.datasetID];

        if (!dataQuery || !datasetID) {
            return { ...emptyChatMessage, sender: 'pipeline', historyData: { toolResult: 'No data query or dataset provided', toolName: 'FetchData', status: 'error' } };
        }

        const dataset = await dataSetController.getById(datasetID);

        if (!dataset) {
            return { ...emptyChatMessage, sender: 'pipeline', historyData: { toolResult: 'Dataset not found', toolName: 'FetchData', status: 'error' } };
        }

        const fetchDataMessageData: FetchDataMessageData = {
            relevantDataSources: [],
            currentStep: 'getDataSources',
            query: dataQuery
        }

        const aiMessageId = actions.getNextMessageId();

        const aiMessage: ChatMessage = {
            id: aiMessageId,
            content: createFetchDataMessage(fetchDataMessageData),
            sender: 'pipeline',
            timestamp: new Date()
        }

        actions.addMessage(aiMessage);

        try {

            const relevantDataSources = await getRelevantDataSources(dataset, dataQuery, agent.llm);

            if (relevantDataSources.length === 0) {
                actions.updateMessage({ ...aiMessage, content: aiErrorMessage('No relevant data sources found'), historyData: { toolResult: 'No relevant data sources found', toolName: 'FetchData', status: 'error'} });
                
                return {...aiMessage, historyData: { toolResult: 'No relevant data sources found, change query', toolName: 'FetchData', status: 'error', statusMessage: 'No relevant data sources found' }};
            }

            fetchDataMessageData.relevantDataSources = relevantDataSources;
            fetchDataMessageData.currentStep = 'fetchData';

            actions.updateMessage(updateAiMessage(aiMessage, fetchDataMessageData));

            const fetchedData = await fetchData(relevantDataSources, dataQuery, agent.dataFetchingConfig, agent.llm);

            if (fetchedData.length === 0) {

                actions.updateMessage({ ...aiMessage, content: aiErrorMessage('No data found'), historyData: { toolResult: 'No data found, change query', toolName: 'FetchData', status: 'error'} });
                
                return {...aiMessage, historyData: { toolResult: 'No data found, change query', toolName: 'FetchData', status: 'error', statusMessage: 'No data found, change query' }};

            } 

            fetchDataMessageData.fetchedData = fetchedData;
            fetchDataMessageData.currentStep = 'finished';

            actions.updateMessage(updateAiMessage(aiMessage, fetchDataMessageData));

            actions.updateMessage({ ...aiMessage, historyData: { toolResult: 'Successfully fetched new data', toolName: 'FetchData', status: 'success' } });

            fetchedData.forEach(fetchedData => {
                actions.setFetchedData(fetchedData);
            });

            return {...aiMessage, historyData: { toolResult: 'Successfully fetched new data', toolName: 'FetchData', status: 'success' }};
        } catch (error) {
            actions.updateMessage({ ...aiMessage, content: aiErrorMessage('Error fetching data'), historyData: { toolResult: 'Error fetching data', toolName: 'FetchData', status: 'error'} });
            return {...aiMessage, historyData: { toolResult: 'Error fetching data', toolName: 'FetchData', status: 'error' }};
        }
    }
}