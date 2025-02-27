import { ChatPipeline, ChatPipelineInput } from "./type";
import { aiErrorMessage, ChatMessage, createAIMessage, createDataSetInfoMessage, createLoadingMessage, createLoadingPulsingMessage, emptyChatMessage } from "../type";
import { getDataSetInfo } from "@/utils/dataSource/api";
import { Result } from "antd";
import { dataSetController } from "@/utils/pocketbase/collections/dataSetController";

export const getDataSetInfoPipeline: ChatPipeline = {
    name: 'GetDataSetInfo',
    description: 'Fetches the data sources of the data set. Use it to get a overview of the data and general information about the dataset.',
    requiredInputs: [ChatPipelineInput.datasetID],
    run: async (actions, input, agent) => {

        const datasetID = input[ChatPipelineInput.datasetID];

        if (!datasetID) {
            return { ...emptyChatMessage, sender: 'pipeline', historyData: { toolResult: 'No dataset provided', toolName: 'GetDataSetInfo', status: 'error' } };
        }

        const dataset = await dataSetController.getById(datasetID);

        if (!dataset) {
            return { ...emptyChatMessage, sender: 'pipeline', historyData: { toolResult: 'Dataset not found', toolName: 'GetDataSetInfo', status: 'error' } };
        }
       
        const aiMessageId = actions.getNextMessageId();

        const aiMessage: ChatMessage = {
            id: aiMessageId,
            content: createLoadingPulsingMessage('...', 'secondary'),
            sender: 'pipeline',
            historyData: '',
            timestamp: new Date()
        }

        actions.addMessage(aiMessage);
        
        try {     

            const dataSetInfo = await getDataSetInfo(dataset);

            await new Promise(resolve => setTimeout(resolve, 2000));    

            actions.updateMessage({ ...aiMessage, content: createDataSetInfoMessage(dataSetInfo), historyData:  { toolResult: dataSetInfo, toolName: 'GetDataSetInfo', status: 'success' } });

            return {...aiMessage, historyData: { toolResult:  {availableDataSources: dataSetInfo}, toolName: 'GetDataSetInfo', status: 'success' }};

        } catch (error) {
            actions.updateMessage({ ...aiMessage, content: aiErrorMessage('Error getting data set info'), historyData: { toolResult: 'Error getting data set info', toolName: 'GetDataSetInfo', status: 'error' } });
            return {...aiMessage, historyData: { toolResult: 'Error getting data set info', toolName: 'GetDataSetInfo', status: 'error' }};
        }
    }
}