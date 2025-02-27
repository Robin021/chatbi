import { FetchedData } from "@/utils/dataSource/type";
import { LLMRecord } from "@/utils/pocketbase/collections/type";

export enum DataTransformActionType {
    'remove columns' = 'remove columns',
    'remove duplicates' = 'remove duplicates',
    'group by' = 'group by',
    'sort by' = 'sort by',
    'filter' = 'filter',
    'invalid' = 'invalid'
}

export interface DataTransformAction {

    run(dataSourceData: FetchedData, query: string, llmRecord: LLMRecord): Promise<FetchedData>

}

