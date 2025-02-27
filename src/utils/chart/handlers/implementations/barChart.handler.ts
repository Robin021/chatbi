import { ProcessedData, ChartHandlerOptions, analyzeData, isNumeric } from '../../../../utils/chart/types/handler.types';
import { BaseChartHandler } from '../base.handler';
import type { 
    XAXisComponentOption, 
    YAXisComponentOption, 
    TooltipComponentOption, 
    GridComponentOption,
    DefaultLabelFormatterCallbackParams
} from 'echarts/types/dist/echarts';
import type { ChartType } from '../../types/chartTypes';
import { themeManager } from '../../theme';

export class BarChartHandler extends BaseChartHandler {
    constructor() {
        super('bar' as ChartType);
    }

    validateData(data: any[]) {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                valid: false,
                message: '数据不能为空'
            };
        }

        const analysis = analyzeData(data);
        
        // 至少需要两列数据：一列分类，一列数值
        if (analysis.columns.length < 2) {
            return {
                valid: false,
                message: '柱状图至少需要两列数据：一列分类，一列数值'
            };
        }

        // 检查是否至少有一列数值类型的数据
        const hasNumericColumn = analysis.columns.some(col => 
            col.types.includes('number') && col.types.length === 1
        );

        if (!hasNumericColumn) {
            return {
                valid: false,
                message: '柱状图至少需要一列数值类型的数据'
            };
        }

        return { valid: true };
    }

    preProcess(data: any[], options?: ChartHandlerOptions): ProcessedData {
        const analysis = analyzeData(data);
        
        // 找出最适合作为分类的列（唯一值较少的非数值列）
        const categoryColumn = analysis.columns.find(col => 
            !col.types.includes('number') && 
            col.uniqueValues <= data.length * 0.5
        ) || analysis.columns[0];

        // 找出数值列
        const valueColumns = analysis.columns.filter(col => 
            col.types.includes('number') && 
            col.name !== categoryColumn.name
        );

        // 如果有多个数值列，可能需要数据透视
        const needsPivot = valueColumns.length > 1;

        // 排序数据
        const sortedData = [...data].sort((a, b) => {
            if (needsPivot) {
                // 多系列时按第一个数值列排序
                return (Number(b[valueColumns[0].name]) || 0) - (Number(a[valueColumns[0].name]) || 0);
            }
            return (Number(b[valueColumns[0].name]) || 0) - (Number(a[valueColumns[0].name]) || 0);
        });

        if (needsPivot) {
            // 数据透视：每个数值列变成一个系列
            return {
                dimensions: [categoryColumn.name, ...valueColumns.map(col => col.name)],
                source: sortedData,
                categoryColumn: categoryColumn.name,
                valueColumns: valueColumns.map(col => col.name)
            };
        } else {
            // 单个数值列：简单的二维数据
            return {
                dimensions: [categoryColumn.name, valueColumns[0].name],
                source: sortedData,
                categoryColumn: categoryColumn.name,
                valueColumns: [valueColumns[0].name]
            };
        }
    }

    getEncode(dimensions: string[]) {
        return {
            x: dimensions[0],
            y: dimensions.slice(1)
        };
    }

    getSeriesConfig(processedData: ProcessedData, options?: ChartHandlerOptions) {
        const { valueColumns } = processedData;
        const colors = this.getColorPalette();
        
        // 为每个数值列创建一个系列
        return valueColumns.map((column, index) => ({
            type: 'bar',
            name: column,
            itemStyle: {
                color: colors[index % colors.length],
                borderRadius: [4, 4, 0, 0],  // 添加圆角
                borderWidth: 1,
                borderColor: colors[index % colors.length],
                opacity: 0.8
            },
            label: {
                show: true,
                position: 'top',
                formatter: (params: DefaultLabelFormatterCallbackParams) => {
                    const value = params.value as Record<string, any>;
                    return this.formatValue(value[column]);
                },
                ...this.getCurrentTheme().textStyle
            },
            emphasis: {
                itemStyle: {
                    opacity: 1,
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: colors[index % colors.length]
                }
            }
        }));
    }

    getSpecialConfig(processedData: ProcessedData, options?: ChartHandlerOptions) {
        const baseConfig = super.getSpecialConfig(processedData, options);
        const dimensions = processedData.dimensions || [];

        return {
            ...baseConfig,
            grid: {
                ...baseConfig.grid,
                bottom: '20%'  // 增加底部空间，为倾斜的标签留出更多空间
            },
            xAxis: this.getDefaultAxis(dimensions[0], true),
            yAxis: this.getDefaultAxis(dimensions[1]),
            tooltip: this.getDefaultTooltip(options),
            legend: this.getDefaultLegend(processedData.valueColumns)
        };
    }

    protected getCurrentTheme() {
        return themeManager.getCurrentTheme();
    }
}

// 导出处理器实例
export const barChartHandler = new BarChartHandler(); 