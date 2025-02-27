import { ChatPipeline } from '@/components/chat/chatPipelines/type';
import { ChatCompletionMessageParam } from '@/utils/llm/type'

export function getFewShotMessages(systemPrompt: string, datasetID: string, datasetInfoPipeline: ChatPipeline): ChatCompletionMessageParam[] {
    return [
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "user",
            content: "What data sources are available in this dataset?"
        },
        {
            role: "assistant",
            content: `Let me check the dataset structure for you:
            <tool>
            name: GetDataSetInfo
            parameters: {
                datasetID: "${datasetID}"
            }
            </tool>`
        },
        {
            role: "assistant",
            content: `{"toolResult":{"availableDataSources":[{"collectionId":"234023842","collectionName":"database","dataset":"${datasetID}","description":"Database for movie rentals."},{"collectionId":"pbc_125978662","collectionName":"csv","dataset":"${datasetID}","description":"CSV tracking project tasks."},{"collectionId":"pbc_125978662","collectionName":"csv","dataset":"5s4d8ht85zn7wvx","description":"CSV with vehicle data."}]},"toolName":"GetDataSetInfo","status":"success"}`
        },
        {
            role: "assistant",
            content: "The dataset contains 3 data sources: sales, customers, and products. Let me know if you'd like to explore any of them further."
        },
        {
            role: "user",
            content: "Can you fetch the sales data for Q1 2023?"
        },
        {
            role: "assistant",
            content: `I will fetch the sales data for Q1 2023:
            <tool>
            name: FetchData
            parameters: {
                dataQuery: "sales data for Q1 2023",
                datasetID: "${datasetID}"
            }
            </tool>`
        },
        {
            role: "assistant",
            content: `{ toolResult: 'Successfully fetched new data', toolName: 'FetchData', status: 'success' }`
        },
    ];
}