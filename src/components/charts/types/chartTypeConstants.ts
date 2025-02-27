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
import { ChartType, ChartOptions } from './index';
import { getImplementedChartTypes } from '../../../utils/chart/handlers';

// 使用函数来获取已实现的图表类型，避免模块级别的执行
export const getImplementedCharts = () => getImplementedChartTypes();

// 图表类型选项接口
interface ChartTypeOption {
    label: string;
    value: string;
    category: string;
    description: string;
    icon: React.ComponentType;
}

const chartTypes: ChartTypeOption[] = [
    // 基础图表
    { 
        label: '折线图', 
        value: 'line', 
        category: '基础图表', 
        description: '适用于显示数据随时间的变化趋势，特别适合连续数据和时间序列数据', 
        icon: LineChartOutlined
    },
    { 
        label: '柱状图', 
        value: 'bar', 
        category: '基础图表', 
        description: '适用于分类数据的数值比较，展示不同类别之间的差异', 
        icon: BarChartOutlined
    },
    { 
        label: '散点图', 
        value: 'scatter', 
        category: '基础图表', 
        description: '适用于显示数据的分布和相关性，可以发现数据中的模式和异常', 
        icon: DotChartOutlined 
    },
    { 
        label: '饼图', 
        value: 'pie', 
        category: '基础图表', 
        description: '适用于显示占比关系，展示整体中各部分的比例', 
        icon: PieChartOutlined 
    },
    
    // 高级图表
    { 
        label: '雷达图', 
        value: 'radar', 
        category: '高级图表', 
        description: '适用于多维数据的对比，可以同时展示多个维度的数据', 
        icon: RadarChartOutlined 
    },
    { 
        label: '热力图', 
        value: 'heatmap', 
        category: '高级图表', 
        description: '适用于显示数据密度和分布，通过颜色深浅展示数值大小', 
        icon: HeatMapOutlined 
    },
    { 
        label: '箱线图', 
        value: 'boxplot', 
        category: '高级图表', 
        description: '适用于显示数据的统计分布，包括中位数、四分位数等', 
        icon: BoxPlotOutlined 
    },
    { 
        label: 'K线图', 
        value: 'candlestick', 
        category: '高级图表', 
        description: '适用于金融数据，展示开盘、收盘、最高、最低价格', 
        icon: StockOutlined 
    },
    { 
        label: '地图', 
        value: 'map', 
        category: '高级图表', 
        description: '适用于地理数据的可视化，展示地理位置相关的数据分布', 
        icon: GlobalOutlined 
    },
    
    // 层级关系图表
    { 
        label: '树图', 
        value: 'tree', 
        category: '层级关系图表', 
        description: '适用于展示层级结构，如组织架构、文件系统等', 
        icon: ApartmentOutlined 
    },
    { 
        label: '矩形树图', 
        value: 'treemap', 
        category: '层级关系图表', 
        description: '适用于展示层级数据的占比，同时显示层级关系', 
        icon: BlockOutlined 
    },
    { 
        label: '旭日图', 
        value: 'sunburst', 
        category: '层级关系图表', 
        description: '适用于展示层级数据的占比和层级关系，更直观', 
        icon: RadiusUprightOutlined 
    },
    { 
        label: '桑基图', 
        value: 'sankey', 
        category: '层级关系图表', 
        description: '适用于展示流向关系，如能量流向、资金流向等', 
        icon: NodeIndexOutlined 
    },
    
    // 组合图表
    { 
        label: '折线柱状图', 
        value: 'line-bar', 
        category: '组合图表', 
        description: '适用于同时展示趋势和数值对比，如销售额和增长率', 
        icon: FundOutlined 
    },
    { 
        label: '散点折线图', 
        value: 'scatter-line', 
        category: '组合图表', 
        description: '适用于展示趋势和离散点，可以突出显示异常值', 
        icon: DotChartOutlined 
    },
    
    // 统计图表
    { 
        label: '漏斗图', 
        value: 'funnel', 
        category: '统计图表', 
        description: '适用于展示转化率，如销售漏斗、用户转化等', 
        icon: FunnelPlotOutlined 
    },
    { 
        label: '仪表盘', 
        value: 'gauge', 
        category: '统计图表', 
        description: '适用于展示单个指标的进度或达成率', 
        icon: DashboardOutlined 
    },
    { 
        label: '主题河流图', 
        value: 'themeRiver', 
        category: '统计图表', 
        description: '适用于展示多个主题随时间的变化趋势', 
        icon: AreaChartOutlined 
    },
    { 
        label: '平行坐标图', 
        value: 'parallel', 
        category: '统计图表', 
        description: '适用于多维数据的对比分析和模式识别', 
        icon: PartitionOutlined 
    }
];

// 导出图表类型的图标映射
const chartTypeIcons = Object.fromEntries(
    chartTypes.map(type => [type.value, type.icon])
) as Record<string, React.ComponentType>;

export { chartTypes, chartTypeIcons }; 