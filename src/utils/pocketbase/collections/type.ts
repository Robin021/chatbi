import { DbConfig, TableSchema } from "@/utils/db/type";
import { Agent } from "@/utils/agent/type";

export type RecordID = string;

export type ColumnRecord = TableSchema['columns'][0] & {
    id: RecordID;
    table: RecordID;
};

export type TableRecord = {
    id: RecordID;
    database: RecordID;
    tableName: TableSchema['tableName'];
    nodeX?: number;
    nodeY?: number;
}

export interface DataSetRecord {
    id: RecordID;
    name: string
    owner: RecordID[]
}

export interface CSVRecord {
    id: RecordID;
    name: string;
    file: string;
    dataset: RecordID;
    description: string;
    contextDesc: string;
    totalAvailableRows: number
}

export type DatabaseRecord = DbConfig & {
    id: RecordID;
    dataset: RecordID;
    description: string;
}

export interface LLMRecord { 
    id: RecordID,
    model: string;
    apiKey: string;
    baseURL: string;
    maxTokens: number;
    temperature: number;
    owner?: RecordID[]
}

export type AgentRecord = Omit<Agent, 'pipelines' | 'run' | 'llm'> & {owner: RecordID[], llm: RecordID, id: RecordID}


export function createTableSchema(TableRecord: TableRecord, ColumnRecords: ColumnRecord[]): TableSchema {
    return {
        tableName: TableRecord.tableName,
        columns: ColumnRecords
    };
}