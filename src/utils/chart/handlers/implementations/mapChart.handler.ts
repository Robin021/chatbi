import { ProcessedData, ChartHandlerOptions, analyzeData, ChartError } from '../../../../utils/chart/types/handler.types';
import { BaseChartHandler } from '../base.handler';
import type { 
    TooltipComponentOption,
    VisualMapComponentOption,
    GeoComponentOption,
    DefaultLabelFormatterCallbackParams
} from 'echarts/types/dist/echarts';
import type { ChartType } from '../../types/chartTypes';
import { themeManager } from '../../theme';

interface MapChartOptions extends ChartHandlerOptions {
    mapName?: string;
    roam?: boolean;
    visualMin?: number;
    visualMax?: number;
    showLabel?: boolean;
    emphasis?: {
        label?: boolean;
        itemStyle?: {
            areaColor?: string;
            shadowBlur?: number;
            shadowColor?: string;
        };
    };
}

export class MapChartHandler extends BaseChartHandler {
    constructor() {
        super('map' as ChartType);
    }

    validateData(data: any[]): { valid: boolean; message?: string } {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                valid: false,
                message: '数据不能为空'
            };
        }

        const firstItem = data[0];
        // 检查是否已经是标准格式
        if ('name' in firstItem && 'value' in firstItem) {
            return { valid: true };
        }

        // 检查是否可以转换为标准格式
        const possibleNameFields = ['name', 'region', 'area', 'country', 'province'];
        const possibleValueFields = ['value', 'count', 'amount', 'total', 'active_users'];
        
        const hasNameField = possibleNameFields.some(field => field in firstItem);
        const hasValueField = possibleValueFields.some(field => field in firstItem);

        if (!hasNameField || !hasValueField) {
            return {
                valid: false,
                message: '数据必须包含地区名称字段（name/region/area/country/province）和值字段（value/count/amount/total）'
            };
        }

        return { valid: true };
    }

    preProcess(data: any[], options?: MapChartOptions): ProcessedData {
        try {
            const analysis = analyzeData(data);
            
            // 如果数据已经是标准格式，直接返回
            if ('name' in data[0] && 'value' in data[0]) {
                return {
                    dimensions: ['name', 'value'],
                    source: data,
                    datasets: [{
                        source: data,
                        dimensions: ['name', 'value']
                    }]
                };
            }

            // 获取区域名称字段和值字段
            const nameField = this.findNameField(data);
            const valueField = this.findValueField(data);

            if (!nameField || !valueField) {
                throw new Error('无法确定区域名称字段或值字段');
            }

            // 转换数据为标准格式
            const transformedData = data.map(item => ({
                name: String(item[nameField]),
                value: Number(item[valueField]) || 0
            }));

            return {
                dimensions: ['name', 'value'],
                source: transformedData,
                datasets: [{
                    source: data,
                    dimensions: [nameField, valueField]
                }],
                originalFields: {
                    nameField,
                    valueField
                }
            };
        } catch (error) {
            throw new ChartError(
                error instanceof Error ? error.message : '数据预处理失败',
                'map' as ChartType,
                'processing'
            );
        }
    }

    private findNameField(data: any[]): string | null {
        const firstItem = data[0];
        const possibleNameFields = ['name', 'region', 'area', 'country', 'province'];
        
        // 首先检查常见的字段名
        for (const field of possibleNameFields) {
            if (field in firstItem) {
                return field;
            }
        }
        
        // 如果没有找到常见字段名，查找包含这些关键词的字段
        const nameKeywords = ['name', 'region', 'area', 'country', 'province', 'city', 'state', 'location'];
        const fields = Object.keys(firstItem);
        const matchingField = fields.find(field => 
            nameKeywords.some(keyword => 
                field.toLowerCase().includes(keyword.toLowerCase())
            )
        );
        
        if (matchingField) {
            return matchingField;
        }

        // 最后尝试找到任何字符串类型的字段
        return fields.find(key => 
            typeof firstItem[key] === 'string'
        ) || null;
    }

    private findValueField(data: any[]): string | null {
        const firstItem = data[0];
        const possibleValueFields = ['value', 'count', 'amount', 'total', 'active_users', 'number', 'quantity'];
        
        // 首先检查常见的字段名
        for (const field of possibleValueFields) {
            if (field in firstItem && typeof firstItem[field] === 'number') {
                return field;
            }
        }
        
        // 如果没有找到常见字段名，查找包含这些关键词的字段
        const valueKeywords = ['value', 'count', 'amount', 'total', 'number', 'quantity', 'sum'];
        const fields = Object.keys(firstItem);
        const matchingField = fields.find(field => 
            valueKeywords.some(keyword => 
                field.toLowerCase().includes(keyword.toLowerCase())
            ) && typeof firstItem[field] === 'number'
        );
        
        if (matchingField) {
            return matchingField;
        }

        // 最后尝试找到任何数值类型的字段
        return fields.find(key => 
            typeof firstItem[key] === 'number'
        ) || null;
    }

    getEncode(dimensions: string[]) {
        return {
            value: dimensions[1],
            itemName: dimensions[0]
        };
    }

    getSeriesConfig(processedData: ProcessedData, options?: MapChartOptions) {
        const defaultOptions: MapChartOptions = {
            mapName: 'world',
            roam: true,
            showLabel: false,
            emphasis: {
                label: true,
                itemStyle: {
                    areaColor: '#eee',
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        };

        const finalOptions = { ...defaultOptions, ...options };
        const theme = themeManager.getCurrentTheme();
        const colors = this.getColorPalette();

        return [{
            type: 'map',
            map: finalOptions.mapName,
            roam: finalOptions.roam,
            data: processedData.source,
            nameProperty: 'name',
            emphasis: {
                label: {
                    show: finalOptions.emphasis?.label
                },
                itemStyle: finalOptions.emphasis?.itemStyle
            },
            select: {
                label: {
                    show: true,
                    color: theme.textStyle?.color
                }
            },
            label: {
                show: finalOptions.showLabel,
                color: theme.textStyle?.color
            },
            itemStyle: {
                areaColor: colors[0],
                borderColor: theme.backgroundColor || '#fff'
            },
            left: 'center',
            top: 'middle',
            aspectScale: 0.85,
            layoutCenter: ['50%', '50%'],
            layoutSize: '100%'
        }];
    }

    getSpecialConfig(processedData: ProcessedData, options?: MapChartOptions) {
        const baseConfig = super.getSpecialConfig(processedData, options);
        const theme = themeManager.getCurrentTheme();
        const colors = this.getColorPalette();

        // 计算数据范围
        const values = processedData.source.map(item => (item as any).value as number);
        const min = Math.min(...values);
        const max = Math.max(...values);

        const visualMap: VisualMapComponentOption = {
            type: 'continuous',
            min: options?.visualMin ?? min,
            max: options?.visualMax ?? max,
            text: ['高', '低'],
            realtime: false,
            calculable: true,
            inRange: {
                color: [colors[0], colors[1], colors[2]]
            },
            textStyle: {
                color: theme.textStyle?.color
            }
        };

        const tooltip: TooltipComponentOption = {
            trigger: 'item',
            formatter: (params: DefaultLabelFormatterCallbackParams) => {
                const data = params.data || {};
                return `${params.name}<br/>值: ${this.formatValue((data as any).value)}`;
            }
        };

        return {
            ...baseConfig,
            visualMap,
            tooltip
        };
    }
} 