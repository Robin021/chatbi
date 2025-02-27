import { DataSetRecord, LLMRecord } from "@/utils/pocketbase/collections/type";
import { DataFetchingConfig, DataSource, FetchedData } from "@/utils/dataSource/type";
import { DataTransformActionType } from "@/utils/pipelines/transformDataPipeline/type";

export interface GetRelevantDataSourcesRequest {
    query: string;
    dataset: DataSetRecord;
    llm: LLMRecord
}

export interface GetRelevantDataSourcesResponse {
    dataSources: DataSource[];
}

export interface FetchDataRequest {
    query: string;
    dataSources: DataSource[];
    config: DataFetchingConfig;
    llm: LLMRecord
}

export interface FetchDataResponse {
    data: FetchedData[];
}