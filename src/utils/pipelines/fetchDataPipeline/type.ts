import { DataSetRecord } from "../../pocketbase/collections/type";

export interface PipelineData {

    query: string;
    dataSet: DataSetRecord;

}