import { CSVData, CSVResponse, CSVColumnUpdate, CSVRowUpdate } from './type';
import { apiRequest } from '@/utils/api';

// Fetch CSV data with pagination
export const getCSVData = async (id: string, limit: number = 10): Promise<CSVData> => {
    const response = await apiRequest<CSVData>(`/api/data/sources/csv/${id}?limit=${limit}`, 'GET');
    return response;
}

export const getCSVRowCount = async (id: string): Promise<number> => {
    const response = await apiRequest<number>(`/api/data/sources/csv/rowCount/${id}`, 'GET');
    return response;
}

// Update column name
export const updateCSVColumn = async (id: string, oldName: string, newName: string): Promise<CSVResponse> => {
    const response = await apiRequest<CSVResponse>(`/api/data/sources/csv/${id}/columns`, 'PUT', {
        oldName,
        newName
    });

    if (response.success) {
        return response;
    }
    throw new Error(response.error);
}

// Update row data
export const updateCSVRow = async (id: string, rowIndex: number, updatedData: Record<string, any>): Promise<CSVResponse> => {
    const response = await apiRequest<CSVResponse>(`/api/data/sources/csv/${id}`, 'PUT', {
        rowIndex,
        updatedData
    });

    if (response.success) {
        return response;
    }
    throw new Error(response.error);
}

// Delete row
export const deleteCSVRow = async (id: string, rowIndex: number): Promise<CSVResponse> => {
    const response = await apiRequest<CSVResponse>(`/api/data/sources/csv/${id}`, 'DELETE', {
        rowIndex
    });

    if (response.success) {
        return response;
    }
    throw new Error(response.error);
}