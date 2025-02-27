export interface CSVData {
    columns: string[];
    rows: Record<string, any>[];
}

export interface CSVResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export interface CSVColumnUpdate {
    oldName: string;
    newName: string;
}

export interface CSVRowUpdate {
    rowIndex: number;
    updatedData: Record<string, any>;
}