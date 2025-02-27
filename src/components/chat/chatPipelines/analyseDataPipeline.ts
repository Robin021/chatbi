import { ChatPipeline, ChatPipelineInput } from "./type";
import { Agent } from "@/utils/agent/type";
import { aiErrorMessage, AnalysisMessageData, ChatMessage, createAnalysisMessage, createFetchDataMessage, createLoadingPulsingMessage, emptyChatMessage, FetchDataMessageData } from "../type";
import { getRelevantDataSources, fetchData } from '@/utils/pipelines/fetchDataPipeline/api'
import { dataSetController } from "@/utils/pocketbase/collections/dataSetController";
import { llm } from "@/utils/llm/api";
import { promptTemplates } from "@/utils/llm/promptTemplates";

export const analyseDataPipeline: ChatPipeline = {
    name: 'AnalyseData',
    description: 'Generates a detailed analysis report from a query and displays it in the chat',
    requiredInputs: [ChatPipelineInput.dataQuery, ChatPipelineInput.fetchedDataId],
    run: async (actions, input, agent) => {

        const fetchedData = actions.getFetchedDataById(input[ChatPipelineInput.fetchedDataId]);

        if (!fetchedData) {
            console.log('Wrong fetchedDataid provided')
            return { ...emptyChatMessage, sender: 'pipeline', historyData: { toolResult: 'Wrong fetchedDataId, insert a correct id from the context data!', toolName: 'FetchMoreData', status: 'error' } };
        }

        const aiMessageId = actions.getNextMessageId();

        const analysisData: AnalysisMessageData = {
            finished: false
        }

        const aiMessage: ChatMessage = {
            id: aiMessageId,
            content: createAnalysisMessage(analysisData),
            sender: 'pipeline',
            historyData: '',
            timestamp: new Date()
        }

        actions.addMessage(aiMessage);

        try {

            const reportTitle = await llm(promptTemplates.generateAnalysisReportTitle(input[ChatPipelineInput.dataQuery], fetchedData.data.columns), agent.llm)

            analysisData.title = reportTitle
            
            actions.updateMessage({...aiMessage, content: createAnalysisMessage(analysisData)})


            analysisData.finished = true
            actions.updateMessage({...aiMessage, content: createAnalysisMessage(analysisData)})

            return {...aiMessage, historyData: { toolResult: 'Successfully generated and displayed the analysis report', toolName: 'AnalyseData', status: 'success' }}


        } catch (e) {

            actions.updateMessage({ ...aiMessage, content: aiErrorMessage('Error generating analysis!'), historyData: { toolResult: 'Error generating analysis.', toolName: 'AnalyseData', status: 'error' } });
            return {...aiMessage, historyData: { toolResult: 'Error generating the analysis', toolName: 'AnalyseData', status: 'error' }};

        }

    }
}