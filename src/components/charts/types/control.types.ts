import type { EChartsOption } from 'echarts';
import type { ChartType, ChartTheme } from '../../../utils/chart/types/chart.types';
import type { ReactNode } from 'react';

// 图表控制组件属性
export interface ChartControlsProps {
    chartType: ChartType;
    chartConfig: EChartsOption;
    data: any[];
    theme?: ChartTheme;
    onChartTypeChange: (type: ChartType) => void;
    onConfigChange: (config: EChartsOption) => void;
    onDataFilter: (filteredData: any[]) => void;
    onThemeChange?: (theme: ChartTheme) => void;
}

// 图表配置抽屉属性
export interface ChartConfigDrawerProps {
    visible: boolean;
    onClose: () => void;
    config: EChartsOption;
    onConfigUpdate: (config: EChartsOption) => void;
    customTabs?: {
        key: string;
        title: string;
        content: ReactNode;
    }[];
}

// 图表数据筛选抽屉属性
export interface ChartFilterDrawerProps {
    visible: boolean;
    onClose: () => void;
    data: any[];
    dimensions: string[];
    onFilter: (filteredData: any[]) => void;
    customFilters?: {
        field: string;
        type: 'range' | 'select' | 'search';
        options?: any[];
    }[];
}

// 图表工具栏属性
export interface ChartToolbarProps {
    onExport?: () => void;
    onRefresh?: () => void;
    onFullscreen?: () => void;
    extraButtons?: ReactNode[];
}

// 图表类型选择器属性
export interface ChartTypeSelectorProps {
    value: ChartType;
    onChange: (type: ChartType) => void;
    disabled?: boolean;
    disabledTypes?: ChartType[];
    customTypes?: {
        type: ChartType;
        label: string;
        icon: ReactNode;
    }[];
} 