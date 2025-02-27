import React, { useState, useEffect } from 'react';
import { Typography, Flex, Card, Tag, message } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { PulsingText } from '@/components/ui/PulsingText';
import { ChartControls } from '@/components/charts/controls/ChartControls';
import { EChartsRenderer } from '@/components/charts/renderers/EChartsRenderer';
import { chartTypeIcons } from '@/components/charts/types/chartTypeConstants';
import type { EChartsOption, DatasetComponentOption } from 'echarts';
import { generateChartConfig } from '@/utils/pipelines/genChartPipeline/api';
import translation from '@/locales/translation';

const { Text } = Typography;

// 获取当前语言的翻译
const getTranslation = (path: string[], lang: 'cn' | 'en' = 'en') => {
    let current: any = translation;
    for (const key of path) {
        if (current[key]) {
            current = current[key];
        } else {
            return '';
        }
    }
    return current[lang] || '';
};

export interface GenChartMessageData {
    currentStep: 'analyzingData' | 'generatingChart' | 'finished';
    chartType?: string;
    chartConfig?: EChartsOption;
    data?: any[];
    explanation?: string;
    error?: string;
    query?: string;
}

const stepMessages = {
    analyzingData: getTranslation(['chart', 'message', 'steps', 'analyzingData']),
    generatingChart: getTranslation(['chart', 'message', 'steps', 'generatingChart']),
    finished: getTranslation(['chart', 'message', 'steps', 'finished'])
};

export const GenChartMessage: React.FC<{ 
    genChartMessageData: GenChartMessageData;
    lang?: 'cn' | 'en';
}> = ({
    genChartMessageData,
    lang = 'cn'
}) => {
    const { currentStep, chartType, chartConfig, data, explanation, error, query } = genChartMessageData;
    const [currentConfig, setCurrentConfig] = useState<EChartsOption | undefined>(chartConfig);
    const [currentChartType, setCurrentChartType] = useState<string | undefined>(chartType);
    const [filteredData, setFilteredData] = useState<any[]>(data || []);
    const [isLoading, setIsLoading] = useState(false);

    // 当原始数据更新时，更新筛选后的数据
    useEffect(() => {
        if (data) {
            setFilteredData(data);
        }
    }, [data]);

    // 当配置更新时，更新当前配置
    useEffect(() => {
        if (chartConfig) {
            setCurrentConfig(chartConfig);
        }
    }, [chartConfig]);

    // 当图表类型更新时，更新当前类型
    useEffect(() => {
        if (chartType) {
            setCurrentChartType(chartType);
        }
    }, [chartType]);

    if (error) {
        return (
            <Text type="danger">{error}</Text>
        );
    }

    const handleChartTypeChange = async (type: string) => {
        if (!data || !query) {
            message.error(getTranslation(['chart', 'message', 'errors', 'missingData'], lang));
            console.error('Missing required data:', {
                hasData: !!data,
                dataLength: data?.length,
                hasQuery: !!query,
                query
            });
            return;
        }

        setIsLoading(true);
        setCurrentChartType(type);

        try {
            console.log('Generating new chart config:', {
                type,
                dataLength: data.length,
                query
            });
            
            // 调用 API 重新生成配置
            const result = await generateChartConfig({
                chartType: type,
                data: data,
                query: query
            });
            
            // 更新配置，确保包含筛选后的数据
            const newConfig = {
                ...result.config,
                dataset: {
                    source: filteredData,
                    dimensions: Array.isArray(result.config.dataset) 
                        ? (result.config.dataset[0] as DatasetComponentOption).dimensions 
                        : (result.config.dataset as DatasetComponentOption)?.dimensions || Object.keys(filteredData[0] || {})
                } as DatasetComponentOption
            };
            
            setCurrentConfig(newConfig);
        } catch (error) {
            console.error('生成图表配置失败:', error);
            message.error(getTranslation(['chart', 'message', 'errors', 'generateFailed'], lang));
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfigChange = (newConfig: EChartsOption) => {
        // 更新配置时，需要确保数据源被正确设置
        const updatedConfig = {
            ...newConfig,
            dataset: {
                source: filteredData,
                dimensions: Array.isArray(newConfig.dataset) 
                    ? (newConfig.dataset[0] as DatasetComponentOption).dimensions 
                    : (newConfig.dataset as DatasetComponentOption)?.dimensions || Object.keys(filteredData[0] || {})
            } as DatasetComponentOption
        };
        setCurrentConfig(updatedConfig);
    };

    const handleDataFilter = (newData: any[]) => {
        setFilteredData(newData);
        // 更新当前配置中的数据源
        if (currentConfig) {
            const updatedConfig = {
                ...currentConfig,
                dataset: {
                    source: newData,
                    dimensions: Array.isArray(currentConfig.dataset)
                        ? (currentConfig.dataset[0] as DatasetComponentOption).dimensions
                        : (currentConfig.dataset as DatasetComponentOption)?.dimensions || Object.keys(newData[0] || {})
                } as DatasetComponentOption
            };
            setCurrentConfig(updatedConfig);
        }
    };

    // 确保配置中包含正确的数据源
    const getConfigWithData = (): EChartsOption => {
        if (!currentConfig) return {} as EChartsOption;
        return {
            ...currentConfig,
            dataset: {
                source: filteredData,
                dimensions: Array.isArray(currentConfig.dataset)
                    ? (currentConfig.dataset[0] as DatasetComponentOption).dimensions
                    : (currentConfig.dataset as DatasetComponentOption)?.dimensions || Object.keys(filteredData[0] || {})
            } as DatasetComponentOption
        };
    };

    // 获取图表类型的显示名称
    const getChartTypeName = (type: string) => {
        return getTranslation(['chart', 'types', type], lang);
    };

    return (
        <Flex vertical gap="middle">
            {/* Chart Type Section */}
            {currentChartType && (
                <Card size="small">
                    <Flex align="center" gap="small">
                        {React.createElement(chartTypeIcons[currentChartType] || BarChartOutlined)}
                        <Text type="secondary">
                            {getTranslation(['chart', 'message', 'chartType', 'selected'], lang)}
                        </Text>
                        <Tag color="blue">{getChartTypeName(currentChartType)}</Tag>
                    </Flex>
                    {explanation && (
                        <Text type="secondary" style={{ marginTop: 8 }}>
                            {explanation}
                        </Text>
                    )}
                </Card>
            )}

            {/* Chart Controls */}
            {currentStep === 'finished' && currentConfig && (
                <ChartControls
                    chartType={currentChartType || ''}
                    chartConfig={currentConfig}
                    data={filteredData}
                    onChartTypeChange={handleChartTypeChange}
                    onConfigChange={handleConfigChange}
                    onDataFilter={handleDataFilter}
                    lang={lang}
                />
            )}

            {/* Chart Preview Section */}
            {currentConfig && (
                <Card size="small" loading={isLoading}>
                    <EChartsRenderer option={getConfigWithData()} />
                </Card>
            )}

            {/* Progress Section */}
            {currentStep !== 'finished' && (
                <PulsingText type="secondary">
                    ...
                </PulsingText>
            )}
        </Flex>
    );
};

export const createGenChartMessage = (data: GenChartMessageData, lang: 'cn' | 'en' = 'en'): React.ReactNode => {
    return <GenChartMessage genChartMessageData={data} lang={lang} />;
}; 