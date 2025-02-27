import React from 'react';
import type { EChartsOption } from 'echarts';
 
// 组件属性类型
export interface ChartControlsProps {
    chartType: string;
    chartConfig: EChartsOption;
    data: any[];
    onChartTypeChange: (type: string) => void;
    onConfigChange: (config: EChartsOption) => void;
    onDataFilter: (filteredData: any[]) => void;
    lang?: 'cn' | 'en';
}
 
export interface ChartConfigDrawerProps {
    visible: boolean;
    onClose: () => void;
    config: EChartsOption;
    onConfigUpdate: (config: EChartsOption) => void;
    lang?: 'cn' | 'en';
}
 
export interface ChartFilterDrawerProps {
    visible: boolean;
    onClose: () => void;
    data: any[];
    onFilter: (filteredData: any[]) => void;
    dimensions?: string[];
    lang?: 'cn' | 'en';
}
 
export interface EChartsRendererProps {
    option: EChartsOption;
    style?: React.CSSProperties;
    data?: any[];
}
 
// 导出其他文件中的类型定义
export * from '../../../utils/chart/types/chart.types';
export * from './control.types';
export * from './renderer.types';
export * from '../../../utils/chart/types/chartHandlers';
export * from './chartTypeConstants';