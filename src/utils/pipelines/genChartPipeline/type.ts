import { ChartType } from '@/utils/chart/types/chartTypes';
import type { EChartsOption } from 'echarts';

export interface ChartTypeResult {
    chartType: ChartType;
    reasoning: string;
}

export interface ChartConfigResult {
    config: EChartsOption;
    explanation: string;
}

export type ChartErrorType = 'validation' | 'processing' | 'configuration' | 'type_conversion';

export interface ChartGenerationError extends Error {
    type: ChartErrorType;
    chartType: ChartType;
} 