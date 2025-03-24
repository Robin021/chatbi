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

        // 检查是否至少有一个字符串字段和一个数值字段
        const fields = Object.keys(firstItem);
        const hasStringField = fields.some(field => typeof firstItem[field] === 'string');
        const hasNumberField = fields.some(field => typeof firstItem[field] === 'number');

        if (!hasStringField || !hasNumberField) {
            return {
                valid: false,
                message: '数据必须至少包含一个文本字段（用于地区名称）和一个数值字段（用于展示值）'
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
                throw new Error('无法确定地区名称字段或值字段，请确保数据中包含文本字段和数值字段');
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
        const fields = Object.keys(firstItem);
        
        // 首先找到所有字符串类型的字段
        const stringFields = fields.filter(field => typeof firstItem[field] === 'string');
        
        if (stringFields.length === 0) {
            return null;
        }

        // 如果只有一个字符串字段，直接使用
        if (stringFields.length === 1) {
            return stringFields[0];
        }

        // 如果有多个字符串字段，尝试找到最合适的
        // 1. 优先使用已经标准化的name字段
        if (stringFields.includes('name')) {
            return 'name';
        }

        // 2. 分析每个字段的内容特征，找到最可能是地区名称的字段
        const fieldScores = new Map<string, number>();
        
        for (const field of stringFields) {
            let score = 0;
            const sampleValues = data.slice(0, 5).map(item => String(item[field]).toLowerCase());
            
            // 检查是否包含典型的地区名称特征
            const hasTypicalNames = sampleValues.some(value => 
                /^(北京|上海|广东|california|new york|london|tokyo)/i.test(value)
            );
            if (hasTypicalNames) score += 3;
            
            // 检查字段名是否包含地区相关词
            const fieldNameLower = field.toLowerCase();
            if (/region|area|country|province|city|state|location/i.test(fieldNameLower)) {
                score += 2;
            }
            
            // 检查值的长度是否在合理范围（地区名称通常不会太长）
            const avgLength = sampleValues.reduce((sum, val) => sum + val.length, 0) / sampleValues.length;
            if (avgLength >= 2 && avgLength <= 20) score += 1;
            
            fieldScores.set(field, score);
        }

        // 返回得分最高的字段
        return Array.from(fieldScores.entries())
            .sort((a, b) => b[1] - a[1])[0][0];
    }

    private findValueField(data: any[]): string | null {
        const firstItem = data[0];
        const fields = Object.keys(firstItem);
        
        // 首先找到所有数值类型的字段
        const numberFields = fields.filter(field => typeof firstItem[field] === 'number');
        
        if (numberFields.length === 0) {
            return null;
        }

        // 如果只有一个数值字段，直接使用
        if (numberFields.length === 1) {
            return numberFields[0];
        }

        // 如果有多个数值字段，尝试找到最合适的
        // 1. 优先使用已经标准化的value字段
        if (numberFields.includes('value')) {
            return 'value';
        }

        // 2. 分析每个字段的数值特征，找到最可能是展示值的字段
        const fieldScores = new Map<string, number>();
        
        for (const field of numberFields) {
            let score = 0;
            const values = data.map(item => Number(item[field]));
            
            // 检查数值范围是否合理（排除可能是id、年份等的字段）
            const min = Math.min(...values);
            const max = Math.max(...values);
            if (min >= 0 && max < 1000000) score += 2;
            
            // 检查是否有小数（通常计数类的数据是整数）
            const hasDecimals = values.some(v => v % 1 !== 0);
            if (!hasDecimals) score += 1;
            
            // 检查字段名是否包含数值相关词
            const fieldNameLower = field.toLowerCase();
            if (/count|amount|total|number|quantity|sum|metric/i.test(fieldNameLower)) {
                score += 2;
            }
            
            fieldScores.set(field, score);
        }

        // 返回得分最高的字段
        return Array.from(fieldScores.entries())
            .sort((a, b) => b[1] - a[1])[0][0];
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