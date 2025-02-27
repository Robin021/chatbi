import { ChatPipeline, ChatPipelineInput } from "./type";
import { Agent } from "@/utils/agent/type";
import { aiErrorMessage, ChatMessage, createFetchDataMessage, emptyChatMessage, FetchDataMessageData, createLoadingPulsingMessage, createDisplayFetchedDataMessage, createTransformDataMessage, TransformDataMessageData } from "../type";
import { fetchMore } from "@/utils/dataSource/api";
import { chooseAction, executeAction } from "@/utils/pipelines/transformDataPipeline/api";

export const transformDataPipeline: ChatPipeline = {
    name: 'TransformData',
    description: 'Transforms data based on a query. Available transformations are: remove columns, remove duplicates, group by, sort by, filter. Don\'t input queries that can\'t be achived with the available actions',
    requiredInputs: [ChatPipelineInput.fetchedDataId, ChatPipelineInput.dataQuery],
    run: async (actions, input, agent) => {
        
        const fetchedData = actions.getFetchedDataById(input[ChatPipelineInput.fetchedDataId]);

        if (!fetchedData) {
            console.log('Wrong fetchedDataid provided')
            return { ...emptyChatMessage, sender: 'pipeline', historyData: { toolResult: 'Wrong fetchedDataId, insert a correct id from the context data!', toolName: 'FetchMoreData', status: 'error' } };
        }

        const transformDataMessageData: TransformDataMessageData = {
            finished: false,
            query: input[ChatPipelineInput.dataQuery]
        }

        const aiMessage: ChatMessage = {
            id: actions.getNextMessageId(),
            sender: 'pipeline',
            content: createTransformDataMessage(transformDataMessageData),
            timestamp: new Date()
        }

        actions.addMessage(aiMessage);

        try {

        const action = await chooseAction(input[ChatPipelineInput.dataQuery], agent.llm);
        
        if (action.action == 'invalid') {

            actions.updateMessage({...aiMessage, content: aiErrorMessage('Tried to perform invalid action!'), historyData: { toolResult: 'This action does not exist.', toolName: 'TransformData', status: 'error'} });
            return { ...emptyChatMessage, sender: 'pipeline', historyData: { toolResult: 'This action does not exist.', toolName: 'TransformData', status: 'error'} }

        }

        transformDataMessageData.action = action.action;

        const transformedData = await executeAction(action.action, fetchedData, input[ChatPipelineInput.dataQuery], agent.llm);

        actions.setFetchedData({...transformedData.fetchedData, id: fetchedData.id})

        transformDataMessageData.finished = true
        transformDataMessageData.transformData = transformedData.fetchedData

        actions.updateMessage({...aiMessage, content: createTransformDataMessage(transformDataMessageData)});

        
        return { ...emptyChatMessage, sender: 'pipeline', historyData: { toolResult: 'Successfully transformed the data', toolName: 'TransformData', status: 'success' } };
        } catch (e) {

            actions.updateMessage({...aiMessage, content: aiErrorMessage('Failed to transform data'), historyData: { toolResult: 'Error transforming data', toolName: 'TransformData', status: 'error'} });
            return { ...emptyChatMessage, sender: 'pipeline', historyData: { toolResult: 'Error transforming data', toolName: 'TransformData', status: 'error'} }}
        }
    
    }
