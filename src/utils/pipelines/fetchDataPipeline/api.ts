import { DataSetRecord, LLMRecord } from "@/utils/pocketbase/collections/type";
import { apiRequest } from "@/utils/api";
import { GetRelevantDataSourcesResponse, GetRelevantDataSourcesRequest, FetchDataRequest, FetchDataResponse } from "@/app/api/pipeline/fetchData/type";
import { DataSource } from "@/utils/dataSource";
import { DataFetchingConfig } from "@/utils/dataSource/type";


export const getRelevantDataSources = async (dataset: DataSetRecord, query: string, llm: LLMRecord) => {
    const request: GetRelevantDataSourcesRequest = {
        query,
        dataset,
        llm
    }
    const response = await apiRequest<GetRelevantDataSourcesResponse>('/api/pipeline/fetchData/step/getDataSources', 'POST', request);
    return response.dataSources;
}

export const fetchData = async (dataSources: DataSource[], query: string, fetchDataConfig: DataFetchingConfig, llm: LLMRecord) => {
    
    const request: FetchDataRequest = {
        dataSources,
        query,
        config: fetchDataConfig,
        llm
    }

    const response = await apiRequest<FetchDataResponse>('/api/pipeline/fetchData/step/fetchData', 'POST', request);
    return response.data;

}