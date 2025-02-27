import { DataTransformActionType } from "./type"
import { apiRequest } from "@/utils/api"
import {ChooseActionRequest, ChooseActionResponse, ExecuteActionRequest, ExecuteActionResponse} from '@/app/api/pipeline/transformData/type'
import { FetchedData } from "@/utils/dataSource/type"
import { LLMRecord } from "@/utils/pocketbase/collections/type"

export const chooseAction = async (query: string, llm: LLMRecord): Promise<ChooseActionResponse> => {

    const request: ChooseActionRequest = {
        query, llm
    }

    const response = await apiRequest('/api/pipeline/transformData/step/chooseAction', 'POST',request)

    return response as ChooseActionResponse
}

export const executeAction = async (action: DataTransformActionType, fetchedData: FetchedData, query: string, llm: LLMRecord): Promise<ExecuteActionResponse> => {
    
    const request: ExecuteActionRequest = {
        action, fetchedData, query, llm
    }
    
    const response = await apiRequest('/api/pipeline/transformData/step/executeAction', 'POST', request)

    return response as ExecuteActionResponse
}