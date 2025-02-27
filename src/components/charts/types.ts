import type { EChartsOption } from 'echarts';

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