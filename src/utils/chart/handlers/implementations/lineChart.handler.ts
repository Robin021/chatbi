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

interface LineChartOptions extends ChartHandlerOptions {
    smooth?: boolean;
    showArea?: boolean;
    showSymbol?: boolean;
    step?: boolean | 'start' | 'middle' | 'end';
}

export class LineChartHandler extends BaseChartHandler {
    constructor() {
        super('line' as ChartType);
    }

    validateData(data: any[]) {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                valid: false,
                message: '数据不能为空'
            };
        }

        const analysis = analyzeData(data);
        
        // 至少需要两列数据：一列作为 X 轴（通常是时间或类别），一列作为 Y 轴值
        if (analysis.columns.length < 2) {
            return {
                valid: false,
                message: '折线图至少需要两列数据：一列作为 X 轴，一列作为 Y 轴值'
            };
        }

        // 检查是否至少有一列数值类型的数据
        const hasNumericColumn = analysis.columns.some(col => 
            col.types.includes('number') && col.types.length === 1
        );

        if (!hasNumericColumn) {
            return {
                valid: false,
                message: '折线图至少需要一列数值类型的数据作为 Y 轴值'
            };
        }

        return { valid: true };
    }

    preProcess(data: any[], options?: LineChartOptions): ProcessedData {
        const analysis = analyzeData(data);
        
        // 尝试找到最适合作为 X 轴的列
        // 优先选择日期类型的列，其次是唯一值较多的非数值列
        const xColumn = analysis.columns.find(col => 
            col.types.includes('date')
        ) || analysis.columns.find(col => 
            !col.types.includes('number') && 
            col.uniqueValues > data.length * 0.1
        ) || analysis.columns[0];

        // 找出数值列作为 Y 轴
        const valueColumns = analysis.columns.filter(col => 
            col.types.includes('number') && 
            col.name !== xColumn.name
        );

        // 处理数据，确保日期格式正确并排序
        const processedData = {
            dimensions: [xColumn.name, ...valueColumns.map(col => col.name)],
            source: [...data]
                .map(row => ({
                    ...row,
                    [xColumn.name]: this.parseDate(row[xColumn.name])
                }))
                .sort((a, b) => {
                    const aValue = a[xColumn.name];
                    const bValue = b[xColumn.name];
                    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                }),
            xColumn: xColumn.name,
            valueColumns: valueColumns.map(col => col.name),
            isTimeAxis: this.isDateValue(data[0]?.[xColumn.name])
        };

        return processedData;
    }

    private parseDate(value: any): any {
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date;
        }
        return value;
    }

    private isDateValue(value: any): boolean {
        if (value instanceof Date) return true;
        if (typeof value === 'string') {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }
        return false;
    }

    private formatDate(date: Date): string {
        const now = new Date();
        const isThisYear = date.getFullYear() === now.getFullYear();
        
        if (isThisYear) {
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    getEncode(dimensions: string[]) {
        return {
            x: dimensions[0],
            y: dimensions.slice(1)
        };
    }

    getSeriesConfig(processedData: ProcessedData, options?: LineChartOptions) {
        const { valueColumns } = processedData;
        const colors = this.getColorPalette();
        const theme = themeManager.getCurrentTheme();
        const defaultOptions: LineChartOptions = {
            smooth: true,
            showArea: false,
            showSymbol: processedData.source.length <= 20,
            step: false
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        return valueColumns.map((column, index) => ({
            type: 'line',
            name: column,
            smooth: finalOptions.smooth,
            showSymbol: finalOptions.showSymbol,
            symbolSize: 6,
            step: finalOptions.step,
            itemStyle: {
                color: colors[index % colors.length],
                borderWidth: 2,
                borderColor: colors[index % colors.length],
                opacity: 0.9
            },
            lineStyle: {
                width: 2,
                opacity: 0.9
            },
            areaStyle: finalOptions.showArea ? {
                opacity: 0.1,
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: colors[index % colors.length]
                    }, {
                        offset: 1,
                        color: theme.backgroundColor || 'rgba(255, 255, 255, 0.2)'
                    }]
                }
            } : undefined,
            label: {
                show: false,
                position: 'top',
                formatter: (params: DefaultLabelFormatterCallbackParams) => {
                    const value = params.value as Record<string, any>;
                    return this.formatValue(value[column]);
                },
                ...theme.textStyle
            },
            emphasis: {
                focus: 'series',
                itemStyle: {
                    opacity: 1,
                    borderWidth: 3
                },
                lineStyle: {
                    width: 3,
                    opacity: 1,
                    shadowBlur: 10,
                    shadowColor: colors[index % colors.length]
                }
            }
        }));
    }

    getSpecialConfig(processedData: ProcessedData, options?: LineChartOptions) {
        const { xColumn, valueColumns, isTimeAxis } = processedData;
        const baseConfig = super.getSpecialConfig(processedData, options);
        
        const tooltip: TooltipComponentOption = {
            ...this.getDefaultTooltip(options),
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    ...themeManager.getCurrentTheme().textStyle
                }
            },
            formatter: (params: DefaultLabelFormatterCallbackParams | DefaultLabelFormatterCallbackParams[]) => {
                if (!Array.isArray(params)) return '';
                
                const param = params[0];
                const value = param.value as Record<string, any>;
                const xValue = value[xColumn];
                const xLabel = isTimeAxis && xValue instanceof Date
                    ? this.formatDate(xValue)
                    : this.formatValue(xValue);

                return [
                    `${xLabel}<br/>`,
                    ...params.map(param => {
                        const value = param.value as Record<string, any>;
                        const seriesName = param.seriesName || '';
                        return `${param.marker} ${seriesName}: ${this.formatValue(value[seriesName])}`;
                    })
                ].join('<br/>');
            }
        };

        return {
            ...baseConfig,
            xAxis: this.getDefaultAxis(xColumn, !isTimeAxis),
            yAxis: this.getDefaultAxis(valueColumns.length === 1 ? valueColumns[0] : ''),
            tooltip,
            legend: this.getDefaultLegend(valueColumns)
        };
    }
}

// 导出处理器实例
export const lineChartHandler = new LineChartHandler(); 