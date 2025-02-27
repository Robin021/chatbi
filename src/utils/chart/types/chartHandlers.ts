import type { EChartsOption } from 'echarts';

// 数据预处理的结果类型
export interface ProcessedData {
    dimensions: string[];
    source: any[];
    [key: string]: any; // 用于存储额外的处理数据
}

// 图表处理器的配置选项
export interface ChartHandlerOptions {
    lang?: 'cn' | 'en';
    query?: string;
    theme?: string;
}

// 图表处理器接口
export interface ChartTypeHandler {
    // 数据预处理
    preProcess: (data: any[], options?: ChartHandlerOptions) => ProcessedData;
    
    // 获取数据编码配置
    getEncode: (dimensions: string[]) => Record<string, any>;
    
    // 获取系列配置
    getSeriesConfig: (processedData: ProcessedData, options?: ChartHandlerOptions) => any;
    
    // 获取特殊配置（可选）
    getSpecialConfig?: (processedData: ProcessedData, options?: ChartHandlerOptions) => Partial<EChartsOption>;
    
    // 验证数据是否适合此图表类型
    validateData: (data: any[]) => { valid: boolean; message?: string };
}

// 图表处理器注册表
export class ChartHandlerRegistry {
    private static handlers: Map<string, ChartTypeHandler> = new Map();

    // 注册新的图表处理器
    static register(chartType: string, handler: ChartTypeHandler) {
        if (this.handlers.has(chartType)) {
            console.warn(`Handler for chart type "${chartType}" is being overwritten.`);
        }
        this.handlers.set(chartType, handler);
    }

    // 获取图表处理器
    static getHandler(chartType: string): ChartTypeHandler | undefined {
        return this.handlers.get(chartType);
    }

    // 检查是否支持某个图表类型
    static isSupported(chartType: string): boolean {
        return this.handlers.has(chartType);
    }

    // 获取所有已注册的图表类型
    static getRegisteredTypes(): string[] {
        return Array.from(this.handlers.keys());
    }
}

// 基础的错误类
export class ChartError extends Error {
    constructor(
        message: string,
        public readonly chartType: string,
        public readonly errorType: 'validation' | 'processing' | 'configuration'
    ) {
        super(message);
        this.name = 'ChartError';
    }
}

// 工具函数：检查数值类型
export const isNumeric = (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

// 工具函数：获取数据类型
export const getDataType = (value: any): 'number' | 'string' | 'date' | 'boolean' | 'object' | 'array' | 'null' => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (typeof value === 'boolean') return 'boolean';
    if (isNumeric(value)) return 'number';
    if (typeof value === 'object') return 'object';
    return 'string';
};

// 工具函数：分析数据列的类型
export const analyzeColumn = (data: any[], columnName: string) => {
    const values = data.map(row => row[columnName]).filter(val => val != null);
    const types = new Set(values.map(getDataType));
    return {
        name: columnName,
        types: Array.from(types),
        uniqueValues: new Set(values).size,
        hasNull: data.some(row => row[columnName] == null),
        min: types.has('number') ? Math.min(...values.filter(isNumeric)) : undefined,
        max: types.has('number') ? Math.max(...values.filter(isNumeric)) : undefined
    };
};

// 工具函数：分析数据结构
export const analyzeData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
        return {
            rowCount: 0,
            columns: []
        };
    }

    const columns = Object.keys(data[0]).map(columnName => analyzeColumn(data, columnName));
    
    return {
        rowCount: data.length,
        columns
    };
}; 