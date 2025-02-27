import { ProcessedData, ChartHandlerOptions, analyzeData, ChartError } from '../../../../utils/chart/types/handler.types';
import { BaseChartHandler } from '../base.handler';
import type { 
    TooltipComponentOption,
    LegendComponentOption,
    DefaultLabelFormatterCallbackParams
} from 'echarts/types/dist/echarts';
import type { ChartType } from '../../types/chartTypes';

interface TreemapChartOptions extends ChartHandlerOptions {
    leafDepth?: number;
    visualMin?: number;
    visualMax?: number;
    colorSaturation?: number;
    colorAlpha?: number;
    borderWidth?: number;
    gapWidth?: number;
    levels?: Array<{
        itemStyle?: {
            borderWidth?: number;
            borderColor?: string;
            gapWidth?: number;
        };
        upperLabel?: {
            show?: boolean;
        };
    }>;
}

export class TreemapChartHandler extends BaseChartHandler {
    protected override chartType: ChartType;
    
    constructor() {
        super('treemap' as ChartType);
        this.chartType = 'treemap';
    }

    validateData(data: any[]) {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                valid: false,
                message: '数据不能为空'
            };
        }

        // 检查数据结构
        const analysis = analyzeData(data);
        
        // 至少需要一个非数值字段作为名称，一个数值字段作为值
        const categoryColumns = analysis.columns.filter(col => !col.types.includes('number'));
        const valueColumns = analysis.columns.filter(col => col.types.includes('number'));

        if (categoryColumns.length === 0) {
            return {
                valid: false,
                message: '数据中必须包含至少一个文本字段作为名称'
            };
        }

        if (valueColumns.length === 0) {
            return {
                valid: false,
                message: '数据中必须包含至少一个数值字段作为值'
            };
        }

        return { valid: true };
    }

    preProcess(data: any[], options?: TreemapChartOptions): ProcessedData {
        try {
            // 分析数据结构
            const analysis = analyzeData(data);
            
            // 获取可能的类别字段和数值字段
            const categoryColumns = analysis.columns
                .filter(col => !col.types.includes('number'))
                .map(col => col.name);
            const valueColumns = analysis.columns
                .filter(col => col.types.includes('number'))
                .map(col => col.name);

            // 智能选择最合适的字段
            const nameField = this.selectNameField(data, categoryColumns);
            const valueField = this.selectValueField(data, valueColumns);

            // 转换数据为标准格式
            const transformedData = data.map(item => ({
                name: String(item[nameField] || ''),
                value: Number(item[valueField]) || 0
            }));

            return {
                dimensions: ['name', 'value'],
                source: transformedData,
                datasets: [
                    {
                        source: data,
                        dimensions: [...categoryColumns, ...valueColumns]
                    },
                    {
                        transform: [
                            {
                                type: 'filter',
                                config: {
                                    dimension: valueField,
                                    '>=': 0
                                }
                            },
                            {
                                type: 'sort',
                                config: {
                                    dimension: valueField,
                                    order: 'desc'
                                }
                            }
                        ]
                    }
                ],
                originalFields: {
                    nameField,
                    valueField
                }
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

    /**
     * 智能选择名称字段
     * 基于数据特征选择最合适的分类字段
     */
    private selectNameField(data: any[], categoryColumns: string[]): string {
        if (categoryColumns.length === 0) {
            throw new ChartError('没有找到合适的分类字段', this.chartType, 'processing');
        }

        // 计算每个字段的评分
        const scores = categoryColumns.map(column => {
            const values = data.map(item => item[column]);
            const uniqueValues = new Set(values).size;
            
            return {
                column,
                score: this.calculateNameFieldScore({
                    uniqueRatio: uniqueValues / data.length,  // 唯一值比例
                    avgLength: values.reduce((sum, v) => sum + String(v || '').length, 0) / data.length,  // 平均字符长度
                    nullCount: values.filter(v => v == null).length,  // 空值数量
                    hasSpecialChars: values.some(v => /[^a-zA-Z0-9\u4e00-\u9fa5\s]/.test(String(v)))  // 是否包含特殊字符
                })
            };
        });

        // 选择得分最高的字段
        const bestField = scores.sort((a, b) => b.score - a.score)[0];
        return bestField.column;
    }

    /**
     * 智能选择数值字段
     * 基于数据特征选择最合适的数值字段
     */
    private selectValueField(data: any[], valueColumns: string[]): string {
        if (valueColumns.length === 0) {
            throw new ChartError('没有找到合适的数值字段', this.chartType, 'processing');
        }

        // 计算每个字段的评分
        const scores = valueColumns.map(column => {
            const values = data.map(item => Number(item[column]));
            const nonZeroCount = values.filter(v => v !== 0).length;
            const variance = this.calculateVariance(values);
            
            return {
                column,
                score: this.calculateValueFieldScore({
                    nonZeroRatio: nonZeroCount / data.length,  // 非零值比例
                    variance,  // 数据方差（表示数据分散程度）
                    nullCount: values.filter(v => isNaN(v)).length,  // 无效值数量
                    range: Math.max(...values) - Math.min(...values)  // 数据范围
                })
            };
        });

        // 选择得分最高的字段
        const bestField = scores.sort((a, b) => b.score - a.score)[0];
        return bestField.column;
    }

    /**
     * 计算名称字段的适用性评分
     */
    private calculateNameFieldScore(metrics: {
        uniqueRatio: number;
        avgLength: number;
        nullCount: number;
        hasSpecialChars: boolean;
    }): number {
        let score = 0;
        
        // 唯一值比例适中（不要太高也不要太低）
        score += Math.abs(0.5 - metrics.uniqueRatio) * 5;
        
        // 平均长度适中（太长或太短都不适合）
        const idealLength = 10;
        score += Math.max(0, 5 - Math.abs(metrics.avgLength - idealLength) / 2);
        
        // 空值越少越好
        score += (1 - metrics.nullCount) * 3;
        
        // 不含特殊字符更好
        score += metrics.hasSpecialChars ? 0 : 2;
        
        return score;
    }

    /**
     * 计算数值字段的适用性评分
     */
    private calculateValueFieldScore(metrics: {
        nonZeroRatio: number;
        variance: number;
        nullCount: number;
        range: number;
    }): number {
        let score = 0;
        
        // 非零值比例越高越好
        score += metrics.nonZeroRatio * 5;
        
        // 数据分散程度适中
        const normalizedVariance = Math.min(metrics.variance / (metrics.range * metrics.range), 1);
        score += (1 - Math.abs(0.5 - normalizedVariance)) * 3;
        
        // 无效值越少越好
        score += (1 - metrics.nullCount) * 2;
        
        return score;
    }

    /**
     * 计算数组的方差
     */
    private calculateVariance(values: number[]): number {
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    }

    private processHierarchicalData(data: any[]): any[] {
        return data.map(item => {
            const processedItem: any = {
                name: item.name,
                value: item.value
            };

            if (item.children && Array.isArray(item.children)) {
                processedItem.children = this.processHierarchicalData(item.children);
            }

            return processedItem;
        });
    }

    private buildTreeFromFlatData(
        data: any[],
        hierarchyColumns: string[],
        valueColumn: string
    ): any[] {
        const tree: any = {
            name: 'root',
            children: []
        };

        // 按层级分组数据
        data.forEach(item => {
            let currentNode = tree;
            
            // 遍历每一层级
            hierarchyColumns.forEach((col, index) => {
                const nodeName = item[col];
                if (!nodeName) return;

                let child = currentNode.children.find((n: any) => n.name === nodeName);
                
                if (!child) {
                    child = {
                        name: nodeName,
                        children: [],
                        value: 0
                    };
                    currentNode.children.push(child);
                }

                // 如果是最后一层，添加值
                if (index === hierarchyColumns.length - 1) {
                    child.value = Number(item[valueColumn]) || 0;
                    delete child.children;
                }

                currentNode = child;
            });
        });

        return tree.children;
    }

    getEncode(dimensions: string[]) {
        return {
            value: dimensions[1],
            itemName: dimensions[0]
        };
    }

    getSeriesConfig(processedData: ProcessedData, options?: TreemapChartOptions) {
        const defaultOptions: TreemapChartOptions = {
            leafDepth: 1,
            visualMin: 0,
            visualMax: 100,
            colorSaturation: 0.5,
            colorAlpha: 0.8,
            borderWidth: 1,
            gapWidth: 1,
            levels: [
                {
                    itemStyle: {
                        borderWidth: 0,
                        gapWidth: 1
                    }
                },
                {
                    itemStyle: {
                        borderWidth: 1,
                        borderColor: '#fff',
                        gapWidth: 1
                    },
                    upperLabel: {
                        show: true
                    }
                }
            ]
        };

        const finalOptions = { ...defaultOptions, ...options };

        // 计算最大值，用于 visualMap
        const maxValue = Math.max(...processedData.source.map(item => item.value));

        return [{
            type: 'treemap',
            data: processedData.source,
            width: '95%',        // 控制图表宽度
            height: '85%',       // 控制图表高度
            top: '10%',          // 距离顶部的距离，为标题留出空间
            left: 'center',      // 水平居中
            leafDepth: finalOptions.leafDepth,
            roam: false,
            nodeClick: false,
            visibleMin: 10,
            visualDimension: 1,
            visualMin: 0,
            visualMax: maxValue,
            colorSaturation: finalOptions.colorSaturation,
            colorAlpha: finalOptions.colorAlpha,
            breadcrumb: {
                show: false
            },
            label: {
                show: true,
                position: 'inside',
                formatter: (params: DefaultLabelFormatterCallbackParams) => {
                    const value = params.value;
                    if (Array.isArray(value)) {
                        return [
                            `{name|${params.name || ''}}`,
                            `{value|${super.formatValue(value[1] || 0)}}`
                        ].join('\n');
                    }
                    return [
                        `{name|${params.name || ''}}`,
                        `{value|${super.formatValue(value || 0)}}`
                    ].join('\n');
                },
                rich: {
                    name: {
                        fontSize: 14,
                        color: '#fff',
                        padding: [5, 0, 0, 0],
                        width: 120,
                        overflow: 'truncate'
                    },
                    value: {
                        fontSize: 12,
                        color: '#fff',
                        padding: [0, 0, 5, 0]
                    }
                }
            },
            itemStyle: {
                borderColor: '#fff',
                borderWidth: finalOptions.borderWidth,
                gapWidth: finalOptions.gapWidth,
                borderRadius: 3
            },
            emphasis: {
                label: {
                    show: true,
                    fontWeight: 'bold'
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0,0,0,0.5)'
                }
            },
            levels: finalOptions.levels,
            visualMap: {
                type: 'continuous',
                min: 0,
                max: maxValue,
                text: ['高', '低'],
                inRange: {
                    color: ['#91cc75', '#5470c6']  // 从浅色到深色
                },
                show: true,
                right: 10,
                top: 'middle',
                calculable: true,
                itemWidth: 15,
                itemHeight: 120,
                textStyle: {
                    color: '#333'
                }
            }
        }];
    }

    getSpecialConfig(processedData: ProcessedData, options?: TreemapChartOptions) {
        // 获取基类的配置
        const baseConfig = super.getSpecialConfig(processedData, options);
        
        const tooltip: TooltipComponentOption = {
            trigger: 'item',                // 修改为 item 触发
            formatter: (params: DefaultLabelFormatterCallbackParams) => {
                const value = Array.isArray(params.value) ? params.value[1] : params.value;
                return `${params.name}<br/>${super.formatValue(value)}`;
            }
        };

        // 从原始字段中获取标题信息
        const title = processedData.originalFields?.nameField 
            ? `${processedData.originalFields.nameField} - ${processedData.originalFields.valueField}`
            : 'Treemap Chart';

        // 合并基类配置和自定义配置
        return {
            ...baseConfig,
            tooltip,
            grid: undefined,  // treemap 不需要 grid 配置
            title: {
                text: title,
                left: 'center',
                top: '3%',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            legend: {
                show: false  // 矩形树图不需要图例
            }
        };
    }
}

// 导出处理器实例
export const treemapChartHandler = new TreemapChartHandler(); 