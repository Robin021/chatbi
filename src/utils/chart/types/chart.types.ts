import type { EChartsOption } from 'echarts';

// 图表类型枚举
export type ChartType = 
    // 基础图表
    | 'line' | 'bar' | 'scatter' | 'pie' 
    // 高级图表
    | 'radar' | 'heatmap' | 'boxplot' | 'candlestick' | 'map'
    // 层级关系图表
    | 'tree' | 'treemap' | 'sunburst' | 'sankey'
    // 组合图表
    | 'line-bar' | 'scatter-line'
    // 统计图表
    | 'funnel' | 'gauge' | 'themeRiver' | 'parallel';

// 图表配置选项
export interface ChartOptions extends EChartsOption {
    dataset?: {
        dimensions?: string[];
        source: any[];
    };
}

// 图表数据分析结果
export interface ChartDataAnalysis {
    dimensions: string[];
    metrics: string[];
    categoryColumn?: string;
    timeColumn?: string;
    dataType: 'timeSeries' | 'categorical' | 'numerical' | 'hierarchical';
    rowCount: number;
    hasNullValues: boolean;
}

// 图表主题选项
export interface ChartTheme {
    colors: string[];
    backgroundColor: string;
    textStyle: {
        color: string;
        fontFamily: string;
    };
    title: {
        textStyle: {
            color: string;
            fontSize: number;
        };
    };
    // 其他主题相关配置...
}

// 图表交互事件
export interface ChartEvent {
    type: 'click' | 'mouseover' | 'mouseout';
    seriesType: string;
    seriesIndex: number;
    dataIndex: number;
    data: any;
    name: string;
    value: any;
} 