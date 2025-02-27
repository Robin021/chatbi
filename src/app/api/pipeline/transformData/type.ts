import { DataTransformActionType } from "@/utils/pipelines/transformDataPipeline/type";
import { FetchedData } from "@/utils/dataSource/type";
import { LLMRecord } from "@/utils/pocketbase/collections/type";

export interface ChooseActionRequest {
    query: string;
    llm: LLMRecord
}

export interface ChooseActionResponse {
    action: DataTransformActionType;
}

export interface ExecuteActionRequest {
    action: DataTransformActionType;
    fetchedData: FetchedData;
    query: string;
    llm: LLMRecord
}

export interface ExecuteActionResponse {
    fetchedData: FetchedData;
}