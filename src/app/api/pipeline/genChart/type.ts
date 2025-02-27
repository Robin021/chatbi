import { LLMRecord } from "@/utils/pocketbase/collections/type";

export interface GetChartTypeRequest {
    query: string;
    sampleData: any[];
    llm: LLMRecord
}

export interface GetChartTypeResponse {
    chartType: string;
    reasoning: string;
}

export interface GenerateChartConfigRequest {
    query: string;
    chartType: string;
    data: any[];
}

export interface GenerateChartConfigResponse {
    config: any;
    explanation: string;
} 