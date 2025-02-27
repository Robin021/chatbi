import { useLanguage } from '@/contexts/LanguageContext';
import { useMemo } from 'react';
import type { ChartCategory } from '../../../utils/chart/types/chartTypes';

// 定义图表相关的翻译键
export type ChartTranslationKey = 
    | 'message.development'
    | 'controls.selectChartType'
    | 'controls.adjustConfig'
    | 'controls.filterData'
    | 'controls.exportChart'
    | 'types.line'
    | 'types.bar'
    | 'types.pie'
    | 'types.scatter'
    | 'types.radar'
    | 'types.heatmap'
    | 'types.boxplot'
    | 'types.candlestick'
    | 'types.map'
    | 'types.tree'
    | 'types.treemap'
    | 'types.sunburst'
    | 'types.sankey'
    | 'types.line-bar'
    | 'types.scatter-line'
    | 'types.funnel'
    | 'types.gauge'
    | 'types.themeRiver'
    | 'types.parallel'
    | 'descriptions.line'
    | 'descriptions.bar'
    | 'descriptions.pie'
    | 'descriptions.scatter'
    | 'descriptions.radar'
    | 'descriptions.heatmap'
    | 'descriptions.boxplot'
    | 'descriptions.candlestick'
    | 'descriptions.map'
    | 'descriptions.tree'
    | 'descriptions.treemap'
    | 'descriptions.sunburst'
    | 'descriptions.sankey'
    | 'descriptions.line-bar'
    | 'descriptions.scatter-line'
    | 'descriptions.funnel'
    | 'descriptions.gauge'
    | 'descriptions.themeRiver'
    | 'descriptions.parallel'
    | 'categories.basic'
    | 'categories.advanced'
    | 'categories.hierarchy'
    | 'categories.flow'
    | 'categories.combination'
    | 'categories.others'
    // 配置相关
    | 'config.title'
    | 'config.textEditor'
    | 'config.visualEditor'
    | 'config.textEditorTip'
    | 'config.visualEditorTip'
    | 'config.jsonError'
    | 'config.update'
    | 'config.cancel'
    // 新增配置相关的键
    | 'config.showTitle'
    | 'config.titleText'
    | 'config.subTitleText'
    | 'config.legend'
    | 'config.showLegend'
    | 'config.legendPosition'
    | 'config.top'
    | 'config.bottom'
    | 'config.left'
    | 'config.right'
    | 'config.tooltip'
    | 'config.showTooltip'
    | 'config.tooltipTrigger'
    | 'config.tooltipTriggerItem'
    | 'config.tooltipTriggerAxis'
    | 'config.grid'
    | 'config.showGrid'
    | 'config.containLabel'
    | 'config.animation'
    | 'config.enableAnimation'
    | 'config.animationDuration'
    | 'config.themeSection'
    | 'config.theme'
    | 'config.themeDefault'
    | 'config.themeDark'
    | 'config.themeRomantic'
    | 'config.themeVintage'
    | 'config.themeTechBlue'
    // 筛选相关
    | 'filter.title'
    | 'filter.tip'
    | 'filter.selectField'
    | 'filter.selectOperator'
    | 'filter.addCondition'
    | 'filter.apply'
    | 'filter.cancel'
    | 'filter.preview'
    | 'filter.equals'
    | 'filter.notEquals'
    | 'filter.contains'
    | 'filter.notContains'
    | 'filter.greater'
    | 'filter.less'
    | 'filter.greaterEquals'
    | 'filter.lessEquals'
    | 'filter.startsWith'
    | 'filter.endsWith'
    | 'filter.before'
    | 'filter.after';

const translations: Record<ChartTranslationKey, { cn: string; en: string }> = {
    'message.development': {
        cn: '开发中',
        en: 'Coming Soon'
    },
    'controls.selectChartType': {
        cn: '选择图表类型',
        en: 'Select Chart Type'
    },
    'controls.adjustConfig': {
        cn: '调整图表配置',
        en: 'Adjust Chart Configuration'
    },
    'controls.filterData': {
        cn: '筛选数据',
        en: 'Filter Data'
    },
    'controls.exportChart': {
        cn: '导出图表',
        en: 'Export Chart'
    },
    'types.line': {
        cn: '折线图',
        en: 'Line Chart'
    },
    'types.bar': {
        cn: '柱状图',
        en: 'Bar Chart'
    },
    'types.pie': {
        cn: '饼图',
        en: 'Pie Chart'
    },
    'types.scatter': {
        cn: '散点图',
        en: 'Scatter Plot'
    },
    'types.radar': {
        cn: '雷达图',
        en: 'Radar Chart'
    },
    'types.heatmap': {
        cn: '热力图',
        en: 'Heat Map'
    },
    'types.boxplot': {
        cn: '箱线图',
        en: 'Box Plot'
    },
    'types.candlestick': {
        cn: 'K线图',
        en: 'Candlestick Chart'
    },
    'types.map': {
        cn: '地图',
        en: 'Map'
    },
    'types.tree': {
        cn: '树图',
        en: 'Tree'
    },
    'types.treemap': {
        cn: '矩形树图',
        en: 'Treemap'
    },
    'types.sunburst': {
        cn: '旭日图',
        en: 'Sunburst'
    },
    'types.sankey': {
        cn: '桑基图',
        en: 'Sankey Diagram'
    },
    'types.line-bar': {
        cn: '折线柱状图',
        en: 'Line-Bar Chart'
    },
    'types.scatter-line': {
        cn: '散点折线图',
        en: 'Scatter-Line Chart'
    },
    'types.funnel': {
        cn: '漏斗图',
        en: 'Funnel Chart'
    },
    'types.gauge': {
        cn: '仪表盘',
        en: 'Gauge'
    },
    'types.themeRiver': {
        cn: '主题河流图',
        en: 'Theme River'
    },
    'types.parallel': {
        cn: '平行坐标图',
        en: 'Parallel Coordinates'
    },
    'descriptions.line': {
        cn: '适用于显示数据随时间的变化趋势，特别适合连续数据和时间序列数据',
        en: 'Suitable for displaying data trends over time, especially for continuous data and time series'
    },
    'descriptions.bar': {
        cn: '适用于分类数据的数值比较，展示不同类别之间的差异',
        en: 'Suitable for comparing numerical values of categorical data, showing differences between categories'
    },
    'descriptions.pie': {
        cn: '适用于显示占比关系，展示整体中各部分的比例',
        en: 'Suitable for displaying proportional relationships, showing the ratio of parts to a whole'
    },
    'descriptions.scatter': {
        cn: '适用于显示数据的分布和相关性，可以发现数据中的模式和异常',
        en: 'Suitable for displaying data distribution and correlation, discovering patterns and anomalies'
    },
    'descriptions.radar': {
        cn: '适用于多维数据的对比，可以同时展示多个维度的数据',
        en: 'Suitable for comparing multi-dimensional data, displaying multiple dimensions simultaneously'
    },
    'descriptions.heatmap': {
        cn: '适用于展示二维数据的密度分布，通过颜色深浅表示数值大小',
        en: 'Suitable for displaying density distribution of 2D data, using color intensity to represent values'
    },
    'descriptions.boxplot': {
        cn: '适用于展示数据的分布特征，包括中位数、四分位数和异常值',
        en: 'Suitable for displaying data distribution characteristics, including median, quartiles, and outliers'
    },
    'descriptions.candlestick': {
        cn: '适用于金融数据分析，展示股票、期货等价格变动',
        en: 'Suitable for financial data analysis, showing price movements of stocks, futures, etc.'
    },
    'descriptions.map': {
        cn: '适用于地理数据的可视化，展示地理位置相关的数据分布',
        en: 'Suitable for geographic data visualization, showing data distribution related to locations'
    },
    'descriptions.tree': {
        cn: '适用于展示层级结构数据，如组织架构、文件系统等',
        en: 'Suitable for displaying hierarchical data, such as organizational structures, file systems'
    },
    'descriptions.treemap': {
        cn: '适用于展示层级数据的比例关系，通过矩形大小表示数值',
        en: 'Suitable for displaying proportional relationships in hierarchical data using rectangle sizes'
    },
    'descriptions.sunburst': {
        cn: '适用于展示多层级数据的层次和占比关系',
        en: 'Suitable for displaying hierarchy and proportion relationships in multi-level data'
    },
    'descriptions.sankey': {
        cn: '适用于展示流向关系，如能量流动、物质流动等',
        en: 'Suitable for displaying flow relationships, such as energy flow, material flow'
    },
    'descriptions.line-bar': {
        cn: '结合折线图和柱状图的特点，适用于展示多种相关数据',
        en: 'Combines features of line and bar charts, suitable for displaying multiple related data series'
    },
    'descriptions.scatter-line': {
        cn: '结合散点图和折线图，适用于展示离散数据的趋势',
        en: 'Combines scatter and line charts, suitable for displaying trends in discrete data'
    },
    'descriptions.funnel': {
        cn: '适用于展示流程数据，如销售漏斗、转化漏斗等',
        en: 'Suitable for displaying process data, such as sales funnel, conversion funnel'
    },
    'descriptions.gauge': {
        cn: '适用于展示单个指标值，直观显示目标完成情况',
        en: 'Suitable for displaying single metric values, showing goal completion status intuitively'
    },
    'descriptions.themeRiver': {
        cn: '适用于展示主题随时间变化的趋势和占比',
        en: 'Suitable for displaying trends and proportions of themes over time'
    },
    'descriptions.parallel': {
        cn: '适用于多维数据分析，展示维度之间的关系',
        en: 'Suitable for multi-dimensional data analysis, showing relationships between dimensions'
    },
    'categories.basic': {
        cn: '基础图表',
        en: 'Basic Charts'
    },
    'categories.advanced': {
        cn: '高级图表',
        en: 'Advanced Charts'
    },
    'categories.hierarchy': {
        cn: '层级图表',
        en: 'Hierarchy Charts'
    },
    'categories.flow': {
        cn: '流向图表',
        en: 'Flow Charts'
    },
    'categories.combination': {
        cn: '组合图表',
        en: 'Combination Charts'
    },
    'categories.others': {
        cn: '其他图表',
        en: 'Other Charts'
    },
    // 配置相关
    'config.title': {
        cn: '图表配置',
        en: 'Chart Configuration'
    },
    'config.textEditor': {
        cn: '文本编辑器',
        en: 'Text Editor'
    },
    'config.visualEditor': {
        cn: '可视化编辑器',
        en: 'Visual Editor'
    },
    'config.textEditorTip': {
        cn: '使用 JSON 格式编辑图表配置',
        en: 'Edit chart configuration in JSON format'
    },
    'config.visualEditorTip': {
        cn: '使用可视化界面编辑图表配置',
        en: 'Edit chart configuration with visual interface'
    },
    'config.jsonError': {
        cn: 'JSON 格式错误',
        en: 'JSON Format Error'
    },
    'config.update': {
        cn: '更新配置',
        en: 'Update'
    },
    'config.cancel': {
        cn: '取消',
        en: 'Cancel'
    },
    // 新增配置相关的翻译
    'config.showTitle': {
        cn: '显示标题',
        en: 'Show Title'
    },
    'config.titleText': {
        cn: '标题文本',
        en: 'Title Text'
    },
    'config.subTitleText': {
        cn: '副标题文本',
        en: 'Subtitle Text'
    },
    'config.legend': {
        cn: '图例',
        en: 'Legend'
    },
    'config.showLegend': {
        cn: '显示图例',
        en: 'Show Legend'
    },
    'config.legendPosition': {
        cn: '图例位置',
        en: 'Legend Position'
    },
    'config.top': {
        cn: '顶部',
        en: 'Top'
    },
    'config.bottom': {
        cn: '底部',
        en: 'Bottom'
    },
    'config.left': {
        cn: '左侧',
        en: 'Left'
    },
    'config.right': {
        cn: '右侧',
        en: 'Right'
    },
    'config.tooltip': {
        cn: '提示框',
        en: 'Tooltip'
    },
    'config.showTooltip': {
        cn: '显示提示框',
        en: 'Show Tooltip'
    },
    'config.tooltipTrigger': {
        cn: '触发方式',
        en: 'Trigger Type'
    },
    'config.tooltipTriggerItem': {
        cn: '数据项',
        en: 'Data Item'
    },
    'config.tooltipTriggerAxis': {
        cn: '坐标轴',
        en: 'Axis'
    },
    'config.grid': {
        cn: '网格',
        en: 'Grid'
    },
    'config.showGrid': {
        cn: '显示网格',
        en: 'Show Grid'
    },
    'config.containLabel': {
        cn: '包含标签',
        en: 'Contain Label'
    },
    'config.animation': {
        cn: '动画',
        en: 'Animation'
    },
    'config.enableAnimation': {
        cn: '启用动画',
        en: 'Enable Animation'
    },
    'config.animationDuration': {
        cn: '动画时长',
        en: 'Animation Duration'
    },
    'config.themeSection': {
        cn: '主题部分',
        en: 'Theme Section'
    },
    'config.theme': {
        cn: '主题',
        en: 'Theme'
    },
    'config.themeDefault': {
        cn: '默认主题',
        en: 'Default Theme'
    },
    'config.themeDark': {
        cn: '暗色主题',
        en: 'Dark Theme'
    },
    'config.themeRomantic': {
        cn: '浪漫主题',
        en: 'Romantic Theme'
    },
    'config.themeVintage': {
        cn: '复古主题',
        en: 'Vintage Theme'
    },
    'config.themeTechBlue': {
        cn: '科技蓝主题',
        en: 'Tech Blue Theme'
    },
    // 筛选相关
    'filter.title': {
        cn: '数据筛选',
        en: 'Data Filter'
    },
    'filter.tip': {
        cn: '添加一个或多个条件来筛选数据',
        en: 'Add one or more conditions to filter data'
    },
    'filter.selectField': {
        cn: '选择字段',
        en: 'Select Field'
    },
    'filter.selectOperator': {
        cn: '选择操作符',
        en: 'Select Operator'
    },
    'filter.addCondition': {
        cn: '添加筛选条件',
        en: 'Add Condition'
    },
    'filter.apply': {
        cn: '应用筛选',
        en: 'Apply'
    },
    'filter.cancel': {
        cn: '取消',
        en: 'Cancel'
    },
    'filter.preview': {
        cn: '数据预览',
        en: 'Data Preview'
    },
    'filter.equals': {
        cn: '等于',
        en: 'Equals'
    },
    'filter.notEquals': {
        cn: '不等于',
        en: 'Not Equals'
    },
    'filter.contains': {
        cn: '包含',
        en: 'Contains'
    },
    'filter.notContains': {
        cn: '不包含',
        en: 'Not Contains'
    },
    'filter.greater': {
        cn: '大于',
        en: 'Greater Than'
    },
    'filter.less': {
        cn: '小于',
        en: 'Less Than'
    },
    'filter.greaterEquals': {
        cn: '大于等于',
        en: 'Greater Than or Equal'
    },
    'filter.lessEquals': {
        cn: '小于等于',
        en: 'Less Than or Equal'
    },
    'filter.startsWith': {
        cn: '以...开始',
        en: 'Starts With'
    },
    'filter.endsWith': {
        cn: '以...结束',
        en: 'Ends With'
    },
    'filter.before': {
        cn: '早于',
        en: 'Before'
    },
    'filter.after': {
        cn: '晚于',
        en: 'After'
    }
};

export const useChartTranslation = () => {
    const { currentLanguage } = useLanguage();

    const t = useMemo(() => {
        return (key: ChartTranslationKey) => {
            return translations[key]?.[currentLanguage] || key;
        };
    }, [currentLanguage]);

    const translateCategory = useMemo(() => {
        return (category: ChartCategory): string => {
            const key = `categories.${category}` as ChartTranslationKey;
            return translations[key]?.[currentLanguage] || category;
        };
    }, [currentLanguage]);

    return {
        t,
        translateCategory,
        currentLanguage
    } as const;
}; 