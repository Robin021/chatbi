import { TableSchema } from "@/utils/db/type";

export interface ErrorResponse {
    error: string;
    message: string;
    details?: unknown;
  }

export interface FetchSchemaResponse {
    success: boolean;
    data: TableSchema[];
    timestamp: string;
    error?: ErrorResponse;
}

export interface TestConnectionResponse {
    success: boolean;
    timestamp: string;
    error?: ErrorResponse;
}