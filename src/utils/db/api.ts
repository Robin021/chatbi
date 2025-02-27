import { apiRequest } from "@/utils/api";
import { TableNodeData, TableSchema } from "@/utils/db/type";
import { DatabaseRecord } from "../pocketbase/collections/type";
import { FetchSchemaResponse, TestConnectionResponse } from "@/app/api/data/sources/db/type";

export const fetchDatabaseSchema = async (database: DatabaseRecord): Promise<TableSchema[]> => {
    const response = await apiRequest<FetchSchemaResponse>('/api/data/sources/db/schema', 'POST', database);
    if (response.success) {
        return response.data;
    }
    throw new Error(response.error?.message || 'Failed to fetch database schema');
};

export const testDatabaseConnection = async (database: DatabaseRecord): Promise<boolean> => {
    const response = await apiRequest<TestConnectionResponse>('/api/data/sources/db/test', 'POST', database);
    if (response.success) {
        return true;
    }
    throw new Error(response.error?.message || 'Failed to test database connection');
};