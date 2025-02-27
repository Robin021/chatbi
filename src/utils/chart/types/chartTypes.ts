import React from 'react';
import { 
    BarChartOutlined, 
    LineChartOutlined, 
    PieChartOutlined, 
    DotChartOutlined, 
    RadarChartOutlined, 
    HeatMapOutlined, 
    BoxPlotOutlined, 
    FunnelPlotOutlined, 
    DashboardOutlined, 
    ApartmentOutlined, 
    AreaChartOutlined, 
    NodeIndexOutlined,
    StockOutlined,
    GlobalOutlined,
    AppstoreOutlined,
    PartitionOutlined,
    BlockOutlined,
    RadiusUprightOutlined,
    FundOutlined
} from '@ant-design/icons';

// 图表类型定义
export const CHART_TYPES = ['bar', 'line', 'pie', 'scatter', 'radar', 'heatmap', 'boxplot', 'candlestick', 'map', 'tree', 'treemap', 'sunburst', 'sankey', 'line-bar', 'scatter-line', 'funnel', 'gauge', 'themeRiver', 'parallel'] as const;
export type ChartType = typeof CHART_TYPES[number];

// 图表类别定义
export const CHART_CATEGORIES = ['basic', 'advanced', 'hierarchy', 'flow', 'combination', 'others'] as const;
export type ChartCategory = typeof CHART_CATEGORIES[number];

// 图表类型选项接口
export interface ChartTypeOption {
    value: ChartType;
    category: ChartCategory;
    description?: string;
    icon: React.ComponentType;
    development?: boolean;
}

// 图表类型配置
export const chartTypeConfigs: ChartTypeOption[] = [
    // 基础图表
    { 
        value: 'line', 
        category: 'basic', 
        icon: LineChartOutlined
    },
    { 
        value: 'bar', 
        category: 'basic', 
        icon: BarChartOutlined
    },
    { 
        value: 'pie', 
        category: 'basic', 
        icon: PieChartOutlined 
    },
    { 
        value: 'scatter', 
        category: 'basic', 
        icon: DotChartOutlined 
    },
    { 
        value: 'radar', 
        category: 'advanced', 
        icon: RadarChartOutlined,
        development: true
    },
    { 
        value: 'heatmap', 
        category: 'advanced', 
        icon: HeatMapOutlined,
        development: true
    },
    { 
        value: 'boxplot', 
        category: 'advanced', 
        icon: BoxPlotOutlined,
        development: true
    },
    { 
        value: 'candlestick', 
        category: 'advanced', 
        icon: StockOutlined,
        development: true
    },
    { 
        value: 'map', 
        category: 'advanced', 
        icon: GlobalOutlined,
        description: '适用于地理数据的可视化，展示地理位置相关的数据分布'
    },
    { 
        value: 'tree', 
        category: 'hierarchy', 
        icon: ApartmentOutlined,
        development: true
    },
    { 
        value: 'treemap', 
        category: 'hierarchy', 
        icon: AppstoreOutlined
    },
    { 
        value: 'sunburst', 
        category: 'hierarchy', 
        icon: PartitionOutlined,
        development: true
    },
    { 
        value: 'sankey', 
        category: 'flow', 
        icon: NodeIndexOutlined,
        development: true
    },
    { 
        value: 'line-bar', 
        category: 'combination', 
        icon: AreaChartOutlined,
        development: true
    },
    { 
        value: 'scatter-line', 
        category: 'combination', 
        icon: FundOutlined,
        development: true
    },
    { 
        value: 'funnel', 
        category: 'others', 
        icon: FunnelPlotOutlined,
        development: true
    },
    { 
        value: 'gauge', 
        category: 'others', 
        icon: DashboardOutlined,
        development: true
    },
    { 
        value: 'themeRiver', 
        category: 'others', 
        icon: RadiusUprightOutlined,
        development: true
    },
    { 
        value: 'parallel', 
        category: 'others', 
        icon: BlockOutlined,
        development: true
    }
];

// 导出图表类型选项
export const chartTypeOptions = chartTypeConfigs.map(config => ({
    ...config,
    disabled: config.development
}));

// 图表类型图标映射
export const chartTypeIcons = Object.fromEntries(
    chartTypeConfigs.map(type => [type.value, type.icon])
) as Record<ChartType, React.ComponentType>; 