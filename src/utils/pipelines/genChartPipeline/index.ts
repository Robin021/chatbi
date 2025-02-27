import { llm, llmWithContext } from "@/utils/llm";
import translation from "@/locales/translation";
import { ChartTypeResult, ChartConfigResult, ChartGenerationError, ChartErrorType } from "./type";
import { ChartError } from "@/utils/chart/types/handler.types";
import { chartHandlerRegistry } from "@/utils/chart/handlers/registry";
import { ChartType } from "@/utils/chart/types/chartTypes";
import type { EChartsOption } from 'echarts';
// 确保图表处理器被初始化
import '@/utils/chart/handlers';
import { LLMRecord } from "@/utils/pocketbase/collections/type";

const SYSTEM_PROMPT = `You are a data visualization expert and ECharts configuration generator.
Important: 
1. Always return valid JSON without any markdown formatting or additional text.
2. Never use \`\`\`json or any other markdown markers.
3. Always use double quotes (") for string values and property names, never use single quotes (').
4. All positioning values like "left", "right", "top", "bottom" must use double quotes.
5. All color values must use double quotes.
6. All function strings must use double quotes and proper escaping.`;

const getChartType = async (sampleData: any[], query: string, lang: 'cn' | 'en' = 'en', llm: LLMRecord): Promise<ChartTypeResult> => {
    const prompt = `You are a data visualization expert. Based on the following data and query, recommend the most suitable chart type.

Important: 
1. The user's query is in ${lang === 'cn' ? 'Chinese' : 'English'}, please provide your response in the same language.
2. When choosing a chart type, consider these key factors:
   - Data Structure Analysis:
     * Is the data hierarchical, temporal, or categorical?
     * How many dimensions and metrics are involved?
     * What are the relationships between variables?
   
   - Visualization Goals:
     * What insights are we trying to communicate?
     * What patterns or relationships need to be highlighted?
     * What's the primary focus of the analysis?
   
   - Visual Effectiveness:
     * Which chart type best represents the data structure?
     * How easily can users interpret the visualization?
     * Does it effectively show comparisons, trends, or distributions?

3. Available Chart Types (choose the BEST one regardless of implementation status):
   - Basic: bar, line, pie
   - Hierarchical: tree, treemap, sunburst
   - Advanced: scatter, radar, heatmap, boxplot, candlestick, map
   - Flow & Relationships: sankey, chord
   - Combinations: line-bar, scatter-line
   - Statistical: funnel, gauge, themeRiver, parallel

Data sample:
${JSON.stringify(sampleData)}

Query: ${query}

Return a JSON object in this exact format:
{
    "chartType": "The most suitable chart type based on data characteristics and analysis goals",
    "reasoning": "Detailed explanation of why this chart type is the best choice, including analysis of data structure, visualization goals, and expected insights"
}`;

    let rawResponse = '';
    try {
        rawResponse = await llmWithContext(prompt, SYSTEM_PROMPT, llm);
        console.log('Raw response:', rawResponse);
        
        // 尝试直接解析
        try {
            const result = JSON.parse(rawResponse);
            // 验证图表类型是否有效
            if (!chartHandlerRegistry.hasHandler(result.chartType as ChartType)) {
                console.warn(`Chart type '${result.chartType}' is not yet implemented. This should be added to our development backlog.`);
                throw new Error(
                    lang === 'cn'
                        ? `抱歉，${result.chartType} 图表类型目前尚未实现。\n\nLLM 推荐使用此图表的原因是：${result.reasoning}\n\n我们会将此需求添加到开发计划中。请尝试使用其他已实现的图表类型。`
                        : `Sorry, the ${result.chartType} chart type is not implemented yet.\n\nLLM recommended this chart because: ${result.reasoning}\n\nWe'll add this to our development roadmap. Please try using other available chart types.`
                );
            }
            return {
                chartType: result.chartType as ChartType,
                reasoning: result.reasoning
            };
        } catch (parseError) {
            // 如果直接解析失败，尝试清理后再解析
            const cleaned = rawResponse
                .replace(/```json\s*|\s*```/g, '')  // 移除代码块标记
                .replace(/[\u200B-\u200D\uFEFF]/g, '')  // 移除零宽字符
                .trim();
                
            const result = JSON.parse(cleaned);
            // 验证图表类型是否有效
            if (!chartHandlerRegistry.hasHandler(result.chartType as ChartType)) {
                console.warn(`Chart type '${result.chartType}' is not yet implemented. This should be added to our development backlog.`);
                throw new Error(
                    lang === 'cn'
                        ? `抱歉，${result.chartType} 图表类型目前尚未实现。\n\nLLM 推荐使用此图表的原因是：${result.reasoning}\n\n我们会将此需求添加到开发计划中。请尝试使用其他已实现的图表类型。`
                        : `Sorry, the ${result.chartType} chart type is not implemented yet.\n\nLLM recommended this chart because: ${result.reasoning}\n\nWe'll add this to our development roadmap. Please try using other available chart types.`
                );
            }
            return {
                chartType: result.chartType as ChartType,
                reasoning: result.reasoning
            };
        }
    } catch (error) {
        console.error('Chart type error:', error);
        if (rawResponse) {
            console.error('Full response:', rawResponse);
        }
        throw error;  // 直接抛出错误，保留原始错误信息
    }
};

const validateConfigValue = (value: any): any => {
    if (typeof value === 'string') {
        // 确保字符串值使用双引号
        return value.replace(/'/g, '"');
    }
    if (Array.isArray(value)) {
        return value.map(validateConfigValue);
    }
    if (typeof value === 'object' && value !== null) {
        const result: any = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = validateConfigValue(val);
        }
        return result;
    }
    return value;
};

const createChartError = (
    message: string,
    chartType: ChartType,
    type: ChartErrorType,
    originalError?: Error
): ChartGenerationError => {
    const error = new Error(message) as ChartGenerationError;
    error.type = type;
    error.chartType = chartType;
    error.cause = originalError;
    return error;
};

const generateChartConfig = async (chartType: ChartType, data: any[], query: string, lang: 'cn' | 'en' = 'en'): Promise<ChartConfigResult> => {
    try {
        // 获取图表处理器
        const handler = chartHandlerRegistry.getHandler(chartType);
        if (!handler) {
            throw createChartError(
                lang === 'cn' ? `不支持的图表类型: ${chartType}` : `Unsupported chart type: ${chartType}`,
                chartType,
                'validation'
            );
        }

        // 验证数据
        const validation = handler.validateData(data);
        if (!validation.valid) {
            throw createChartError(
                validation.message || (lang === 'cn' ? '数据验证失败' : 'Data validation failed'),
                chartType,
                'validation'
            );
        }

        try {
            // 预处理数据
            const processedData = handler.preProcess(data, { lang, query });
            console.log('Processed data:', processedData);

            // 获取基础配置
            const baseConfig: Partial<EChartsOption> = {
                title: {
                    text: lang === 'cn' ? '数据可视化' : 'Data Visualization',
                    subtext: query
                },
                dataset: {
                    dimensions: processedData.dimensions,
                    source: processedData.source
                }
            };

            // 获取系列配置
            const series = handler.getSeriesConfig(processedData, { lang, query });

            // 获取特殊配置
            const specialConfig = handler.getSpecialConfig?.(processedData, { lang, query }) || {};

            // 合并所有配置
            const config: EChartsOption = {
                ...baseConfig,
                ...specialConfig,
                series: Array.isArray(series) ? series : [series],
                animation: true,
                animationDuration: 1000,
                animationEasing: 'cubicOut'
            };

            // 验证配置
            validateConfigValue(config);

            console.log('Final config:', JSON.stringify(config, null, 2));

            const dimensionsText = lang === 'cn' 
                ? `包含 ${processedData.dimensions.length} 个维度`
                : `contains ${processedData.dimensions.length} dimensions`;

            const chartTypeText = lang === 'cn'
                ? `使用 ${chartType} 图表展示数据`
                : `Using ${chartType} chart to visualize data`;

            return {
                config,
                explanation: `${chartTypeText}, ${dimensionsText}.`
            };
        } catch (error) {
            if (error instanceof ChartError) {
                throw error;
            }
            throw createChartError(
                error instanceof Error ? error.message : (lang === 'cn' ? '图表配置生成失败' : 'Failed to generate chart configuration'),
                chartType,
                'configuration',
                error instanceof Error ? error : undefined
            );
        }
    } catch (error) {
        console.error('Chart generation error:', error);
        
        if (error instanceof ChartError || error instanceof Error) {
            const message = lang === 'cn'
                ? `图表生成失败: ${error.message}`
                : `Chart generation failed: ${error.message}`;
            throw new Error(message);
        }
        
        throw new Error(lang === 'cn' ? '图表生成过程中发生未知错误' : 'Unknown error during chart generation');
    }
};

export const Pipeline = {
    getChartType,
    generateChartConfig
};