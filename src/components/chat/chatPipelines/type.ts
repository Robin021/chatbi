import { Agent } from "@/utils/agent/type";
import { ChatMessage } from "../type";
import { FetchedData } from "@/utils/dataSource/type";
export interface ChatActions {

    addMessage: (message: ChatMessage) => void;
    updateMessage: (message: Partial<ChatMessage>) => boolean;
    removeMessage: (messageId: string) => void;
    getNextMessageId: () => string;
    getFetchedDataById: (id: string) => FetchedData | undefined;
    setFetchedData: (fetchedData: FetchedData) => void;
    getFetchedDataList: () => FetchedData[];
    getFetchedDataListPreview: () => Partial<FetchedData>[];
}

export interface ChatPipeline {
    run(actions: ChatActions, input: Partial<Record<ChatPipelineInput, any>>, agent: Omit<Agent, 'run'>): Promise<ChatMessage>;
    description: string;
    name: string;
    requiredInputs: ChatPipelineInput[];
}

export enum ChatPipelineInput { 
    dataQuery = 'dataQuery',
    fetchedDataId = 'fetchedDataId',
    additionalDataCount = 'additionalDataCount',
    datasetID = 'datasetID',
}

export const ChatPipelineInputTypes: Record<ChatPipelineInput, {type: string, description: string}> = { 
    dataQuery: {type: 'string', description: 'A natural language query'},
    fetchedDataId: {type: 'string', description: 'The id of the fetched data'},
    datasetID: {type: 'string', description: 'The ID of the dataset to fetch data from'},
    additionalDataCount: {type: 'number', description: 'The number of additional data to fetch'},
}