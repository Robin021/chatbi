import { BaseChartHandler } from '../base.handler';
import { ChartError } from '../../types/handler.types';
import type { ProcessedData, ChartHandlerOptions } from '../../types/handler.types';
import type { ScatterSeriesOption } from 'echarts/charts';
import { isNumeric } from '../../types/handler.types';

export class ScatterChartHandler extends BaseChartHandler {
    constructor() {
        super('scatter');
    }

    validateData(data: any[]) {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                valid: false,
                message: '数据不能为空'
            };
        }

        // 检查是否至少有一个数值列
        const analysis = this.preProcess(data);
        const numericColumns = analysis.dimensions.filter(dim => 
            data.every(row => isNumeric(row[dim]))
        );

        if (numericColumns.length === 0) {
            return {
                valid: false,
                message: '散点图至少需要一个数值列作为Y轴'
            };
        }

        return { valid: true };
    }

    preProcess(data: any[], options?: ChartHandlerOptions): ProcessedData {
        const processed = super.preProcess(data, options);
        
        // 找出所有数值列和非数值列
        const numericColumns = processed.dimensions.filter(dim => 
            data.every(row => isNumeric(row[dim]))
        );
        const categoricalColumns = processed.dimensions.filter(dim => 
            !numericColumns.includes(dim)
        );

        if (numericColumns.length === 0) {
            throw new ChartError('散点图至少需要一个数值列作为Y轴', this.chartType, 'validation');
        }

        // 选择轴
        let xAxis, yAxis;
        if (numericColumns.length >= 2) {
            // 如果有两个或更多数值列，使用前两个作为X和Y轴
            xAxis = numericColumns[0];
            yAxis = numericColumns[1];
        } else {
            // 如果只有一个数值列，使用第一个分类列作为X轴
            xAxis = categoricalColumns[0] || numericColumns[0];
            yAxis = numericColumns[0];
        }

        // 如果有额外的数值列，可以用作气泡大小
        const sizeColumn = numericColumns.length > 2 ? numericColumns[2] : 
                          (numericColumns.length === 2 && xAxis !== numericColumns[0]) ? numericColumns[1] : 
                          undefined;

        // 如果还有其他非数值列，可以用作分类
        const categoryColumn = categoricalColumns.find(col => col !== xAxis);

        return {
            ...processed,
            xAxis,
            yAxis,
            xAxisType: numericColumns.includes(xAxis) ? 'value' : 'category',
            sizeColumn,
            categoryColumn,
            categories: categoryColumn ? Array.from(new Set(data.map(row => row[categoryColumn]))) : undefined
        };
    }

    getEncode(dimensions: string[]): Record<string, any> {
        return {};  // 散点图的编码在 series 配置中处理
    }

    getSeriesConfig(processedData: ProcessedData, options?: ChartHandlerOptions): ScatterSeriesOption | ScatterSeriesOption[] {
        const { xAxis, yAxis, sizeColumn, categoryColumn, categories, source } = processedData;
        const colors = this.getColorPalette();

        if (categoryColumn && categories) {
            // 如果有分类列，为每个分类创建一个系列
            return categories.map((category, index) => ({
                type: 'scatter',
                name: String(category),
                data: source
                    .filter(item => item[categoryColumn] === category)
                    .map(item => ([
                        item[xAxis],
                        item[yAxis],
                        sizeColumn ? item[sizeColumn] : undefined
                    ].filter(v => v !== undefined))),
                symbolSize: sizeColumn ? (data: number[]) => Math.sqrt(Math.abs(data[2] || 1)) * 10 : 10,
                itemStyle: {
                    color: colors[index % colors.length],
                    borderColor: colors[index % colors.length],
                    borderWidth: 1,
                    opacity: 0.8
                },
                emphasis: {
                    itemStyle: {
                        opacity: 1,
                        borderWidth: 2,
                        shadowBlur: 10,
                        shadowColor: colors[index % colors.length]
                    }
                }
            }));
        }

        // 没有分类列，创建单个系列
        return {
            type: 'scatter',
            data: source.map(item => ([
                item[xAxis],
                item[yAxis],
                sizeColumn ? item[sizeColumn] : undefined
            ].filter(v => v !== undefined))),
            symbolSize: sizeColumn ? (data: number[]) => Math.sqrt(Math.abs(data[2] || 1)) * 10 : 10,
            itemStyle: {
                color: colors[0],
                borderColor: colors[0],
                borderWidth: 1,
                opacity: 0.8
            },
            emphasis: {
                itemStyle: {
                    opacity: 1,
                    borderWidth: 2,
                    shadowBlur: 10,
                    shadowColor: colors[0]
                }
            }
        };
    }

    getSpecialConfig(processedData: ProcessedData, options?: ChartHandlerOptions): any {
        const { xAxis: xAxisName, yAxis: yAxisName, xAxisType } = processedData;
        const baseConfig = super.getSpecialConfig(processedData, options);

        return {
            ...baseConfig,
            xAxis: this.getDefaultAxis(xAxisName, xAxisType === 'category'),
            yAxis: this.getDefaultAxis(yAxisName),
            tooltip: {
                ...this.getDefaultTooltip(),
                trigger: 'item',
                formatter: (params: any) => {
                    const { data, seriesName } = params;
                    const result = [
                        `${seriesName || ''}`,
                        `${xAxisName}: ${this.formatValue(data[0])}`,
                        `${yAxisName}: ${this.formatValue(data[1])}`
                    ];
                    if (data[2] !== undefined) {
                        result.push(`Size: ${this.formatValue(data[2])}`);
                    }
                    return result.join('<br/>');
                }
            }
        };
    }
} 