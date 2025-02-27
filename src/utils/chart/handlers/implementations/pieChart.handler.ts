import { ProcessedData, ChartHandlerOptions, analyzeData, isNumeric } from '../../../../utils/chart/types/handler.types';
import { BaseChartHandler } from '../base.handler';
import type { 
    TooltipComponentOption,
    LegendComponentOption,
    DefaultLabelFormatterCallbackParams
} from 'echarts/types/dist/echarts';
import type { ChartType } from '../../types/chartTypes';
import { themeManager } from '../../theme';

interface PieChartOptions extends ChartHandlerOptions {
    roseType?: boolean | 'radius' | 'area';
    labelPosition?: 'outside' | 'inside' | 'center';
    minAngle?: number;
    startAngle?: number;
    sortBy?: 'value' | 'name' | 'none';
    sortOrder?: 'asc' | 'desc';
}

export class PieChartHandler extends BaseChartHandler {
    constructor() {
        super('pie' as ChartType);
    }

    validateData(data: any[]) {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                valid: false,
                message: '数据不能为空'
            };
        }

        const analysis = analyzeData(data);
        
        // 饼图需要两列数据：一列分类，一列数值
        if (analysis.columns.length < 2) {
            return {
                valid: false,
                message: '饼图需要两列数据：一列分类，一列数值'
            };
        }

        // 检查是否有一列数值类型的数据
        const hasNumericColumn = analysis.columns.some(col => 
            col.types.includes('number') && col.types.length === 1
        );

        if (!hasNumericColumn) {
            return {
                valid: false,
                message: '饼图需要一列数值类型的数据'
            };
        }

        return { valid: true };
    }

    preProcess(data: any[], options?: PieChartOptions): ProcessedData {
        const analysis = analyzeData(data);
        
        // 找出分类列（非数值列）
        const categoryColumn = analysis.columns.find(col => 
            !col.types.includes('number')
        ) || analysis.columns[0];

        // 找出数值列
        const valueColumn = analysis.columns.find(col => 
            col.types.includes('number') && 
            col.name !== categoryColumn.name
        );

        if (!valueColumn) {
            throw new Error('无法找到合适的数值列');
        }

        // 计算总和用于百分比
        const total = data.reduce((sum, row) => sum + (Number(row[valueColumn.name]) || 0), 0);

        // 处理数据：计算百分比并排序
        let processedData = {
            dimensions: [categoryColumn.name, valueColumn.name, 'percentage'],
            source: data.map(row => ({
                ...row,
                percentage: ((Number(row[valueColumn.name]) || 0) / total * 100).toFixed(2) + '%'
            })),
            categoryColumn: categoryColumn.name,
            valueColumn: valueColumn.name,
            total
        };

        // 排序数据
        if (options?.sortBy && options.sortBy !== 'none') {
            const { sortBy, sortOrder = 'desc' } = options;
            processedData.source.sort((a, b) => {
                let comparison: number;
                if (sortBy === 'value') {
                    comparison = (Number(b[valueColumn.name]) || 0) - (Number(a[valueColumn.name]) || 0);
                } else {
                    comparison = String(a[categoryColumn.name]).localeCompare(String(b[categoryColumn.name]));
                }
                return sortOrder === 'desc' ? comparison : -comparison;
            });
        }

        return processedData;
    }

    getEncode(dimensions: string[]) {
        return {
            itemName: dimensions[0],
            value: dimensions[1]
        };
    }

    getSeriesConfig(processedData: ProcessedData, options?: PieChartOptions) {
        const colors = this.getColorPalette();
        const { categoryColumn, valueColumn, total } = processedData;
        const theme = themeManager.getCurrentTheme();
        const defaultOptions: PieChartOptions = {
            roseType: false,
            labelPosition: 'outside',
            minAngle: 5,
            startAngle: 90
        };

        const finalOptions = { ...defaultOptions, ...options };

        return [{
            type: 'pie',
            radius: finalOptions.roseType ? ['20%', '70%'] : ['40%', '70%'],
            roseType: finalOptions.roseType === true ? 'radius' : finalOptions.roseType || false,
            minAngle: finalOptions.minAngle,
            startAngle: finalOptions.startAngle,
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 10,
                borderColor: theme.backgroundColor || '#fff',
                borderWidth: 2,
                opacity: 0.8
            },
            label: {
                show: true,
                position: finalOptions.labelPosition,
                formatter: (params: DefaultLabelFormatterCallbackParams) => {
                    const value = params.value as Record<string, any>;
                    const percentage = ((Number(value[valueColumn]) || 0) / total * 100).toFixed(1);
                    
                    if (finalOptions.labelPosition === 'inside') {
                        return percentage + '%';
                    }
                    
                    return [
                        `{name|${params.name}}`,
                        `{value|${percentage}%}`
                    ].join('\n');
                },
                rich: {
                    name: {
                        ...theme.textStyle,
                        fontSize: 14
                    },
                    value: {
                        ...theme.textStyle,
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                }
            },
            emphasis: {
                scale: true,
                scaleSize: 10,
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                itemStyle: {
                    opacity: 1,
                    borderWidth: 3,
                    shadowBlur: 10,
                    shadowColor: theme.backgroundColor || 'rgba(0, 0, 0, 0.5)'
                }
            },
            data: processedData.source.map((item, index) => ({
                name: item[categoryColumn],
                value: item[valueColumn],
                itemStyle: {
                    color: colors[index % colors.length]
                }
            }))
        }];
    }

    getSpecialConfig(processedData: ProcessedData, options?: PieChartOptions) {
        const baseConfig = super.getSpecialConfig(processedData, options);
        const tooltip: TooltipComponentOption = {
            ...this.getDefaultTooltip(),
            trigger: 'item',
            formatter: (params: DefaultLabelFormatterCallbackParams) => {
                const value = params.value as Record<string, any>;
                const percentage = ((Number(value[processedData.valueColumn]) || 0) / processedData.total * 100).toFixed(1);
                return [
                    `${params.marker} ${params.name}`,
                    `数值: ${this.formatValue(value[processedData.valueColumn])}`,
                    `占比: ${percentage}%`
                ].join('<br/>');
            }
        };

        const legend: LegendComponentOption = {
            ...this.getDefaultLegend(processedData.source.map(item => item[processedData.categoryColumn])),
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20,
            formatter: (name: string) => {
                const item = processedData.source.find(item => item[processedData.categoryColumn] === name);
                if (!item) return name;
                const percentage = ((Number(item[processedData.valueColumn]) || 0) / processedData.total * 100).toFixed(1);
                return `${name} (${percentage}%)`;
            }
        };

        return {
            ...baseConfig,
            tooltip,
            legend
        };
    }
}

// 导出处理器实例
export const pieChartHandler = new PieChartHandler(); 