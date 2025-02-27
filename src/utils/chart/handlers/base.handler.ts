import { ChartTypeHandler, ProcessedData, ChartHandlerOptions, analyzeData, ChartError } from '../../../utils/chart/types/handler.types';
import type { 
    TooltipComponentOption, 
    GridComponentOption, 
    LegendComponentOption,
    DefaultLabelFormatterCallbackParams
} from 'echarts/types/dist/echarts';
import type { ChartType } from '../types/chartTypes';
import { themeManager } from '../theme';

export abstract class BaseChartHandler implements ChartTypeHandler {
    protected chartType: ChartType;

    constructor(chartType: ChartType) {
        this.chartType = chartType;
    }

    abstract validateData(data: any[]): { valid: boolean; message?: string };
    abstract getEncode(dimensions: string[]): Record<string, any>;
    abstract getSeriesConfig(processedData: ProcessedData, options?: ChartHandlerOptions): any;

    getSpecialConfig(processedData: ProcessedData, options?: ChartHandlerOptions): any {
        const theme = themeManager.getCurrentTheme();
        return {
            backgroundColor: theme.backgroundColor,
            textStyle: theme.textStyle,
            grid: this.getDefaultGrid(),
            title: this.getDefaultTitle()
        };
    }

    preProcess(data: any[], options?: ChartHandlerOptions): ProcessedData {
        try {
            // 基础数据验证
            if (!Array.isArray(data) || data.length === 0) {
                throw new ChartError('数据不能为空', this.chartType, 'validation');
            }

            // 数据分析
            const analysis = analyzeData(data);
            if (analysis.columns.length === 0) {
                throw new ChartError('数据格式无效', this.chartType, 'validation');
            }

            // 子类可以通过重写这个方法来实现自己的预处理逻辑
            return {
                dimensions: analysis.columns.map(col => col.name),
                source: data
            };
        } catch (error) {
            if (error instanceof ChartError) {
                throw error;
            }
            throw new ChartError(
                error instanceof Error ? error.message : '数据预处理失败',
                this.chartType,
                'processing'
            );
        }
    }

    protected getDefaultTooltip(options?: ChartHandlerOptions): TooltipComponentOption {
        const theme = themeManager.getCurrentTheme();
        return {
            trigger: 'axis',
            formatter: (params: DefaultLabelFormatterCallbackParams | DefaultLabelFormatterCallbackParams[]) => {
                if (Array.isArray(params)) {
                    return params.map(param => 
                        `${param.seriesName}: ${this.formatValue(param.value)}`
                    ).join('<br/>');
                }
                return `${params.seriesName}: ${this.formatValue(params.value)}`;
            },
            ...theme.tooltip
        };
    }

    protected getDefaultGrid(): GridComponentOption {
        return {
            top: '15%',      // 顶部空间，为标题留出位置
            bottom: '15%',    // 增加底部空间，为图例和轴标签留出位置
            left: '8%',       // 左侧空间，防止文字超出
            right: '3%',      // 右侧空间
            containLabel: true // 确保标签在容器内
        };
    }

    protected getDefaultTitle() {
        const theme = themeManager.getCurrentTheme();
        return {
            top: '3%',        // 距离顶部的距离
            left: 'center',   // 水平居中
            textStyle: theme.title?.textStyle,
            subtextStyle: theme.title?.subtextStyle,
            padding: [0, 0, 10, 0]  // 添加底部内边距
        };
    }

    protected getDefaultLegend(data: string[]): LegendComponentOption | undefined {
        if (data.length <= 1) return undefined;

        const theme = themeManager.getCurrentTheme();
        return {
            data,
            bottom: '5%',     // 距离底部的距离
            type: 'scroll',
            pageButtonPosition: 'end',
            pageTextStyle: theme.legend?.textStyle,
            textStyle: theme.legend?.textStyle,
            itemGap: 20,      // 图例项之间的间距
            padding: [5, 10]  // 图例内边距
        };
    }

    protected getDefaultAxis(name: string, isCategory: boolean = false) {
        const theme = themeManager.getCurrentTheme();
        return {
            type: isCategory ? 'category' : 'value',
            name,
            nameLocation: 'center',
            nameGap: isCategory ? 35 : 45,
            axisLine: theme.axisLine,
            splitLine: theme.splitLine,
            axisLabel: isCategory ? {
                rotate: 45,
                interval: 0,
                hideOverlap: true,
                ...theme.textStyle
            } : {
                ...theme.textStyle
            }
        };
    }

    protected formatValue(value: any): string {
        if (typeof value === 'number') {
            // 处理大数字和小数
            if (Math.abs(value) >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
            } else if (Math.abs(value) >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
            }
            return value.toLocaleString(undefined, {
                maximumFractionDigits: 2
            });
        }
        if (value instanceof Date) {
            return value.toLocaleDateString();
        }
        return String(value);
    }

    protected getColorPalette(): string[] {
        return themeManager.getColorPalette();
    }
} 