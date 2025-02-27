import type { ChartType } from '../types/chartTypes';  

// 数据分析结果
export interface DataAnalysis {
    columns: Array<{
        name: string;
        types: string[];
        uniqueValues: number;
    }>;
}

// 处理后的数据
export interface ProcessedData {
    dimensions: string[];
    source: any[];
    [key: string]: any;
}

// 图表处理器选项
export interface ChartHandlerOptions {
    [key: string]: any;
}

// 数据验证结果
export interface ValidationResult {
    valid: boolean;
    message?: string;
}

// 图表处理器接口
export interface ChartTypeHandler {
    validateData(data: any[]): ValidationResult;
    preProcess(data: any[], options?: ChartHandlerOptions): ProcessedData;
    getEncode(dimensions: string[]): Record<string, any>;
    getSeriesConfig(processedData: ProcessedData, options?: ChartHandlerOptions): any;
    getSpecialConfig?(processedData: ProcessedData, options?: ChartHandlerOptions): any;
}

// 数据分析函数
export function analyzeData(data: any[]): DataAnalysis {
    if (!Array.isArray(data) || data.length === 0) {
        return { columns: [] };
    }

    const firstRow = data[0];
    const columns = Object.keys(firstRow).map(name => {
        const types = new Set<string>();
        let uniqueValues = new Set();

        data.forEach(row => {
            const value = row[name];
            types.add(typeof value);
            uniqueValues.add(value);
        });

        return {
            name,
            types: Array.from(types),
            uniqueValues: uniqueValues.size
        };
    });

    return { columns };
}

// 数值类型检查
export function isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

// 图表错误类
export class ChartError extends Error {
    constructor(
        message: string,
        public chartType: ChartType,
        public errorType: 'validation' | 'processing' | 'rendering'
    ) {
        super(message);
        this.name = 'ChartError';
    }
} 