import React, { useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsRendererProps } from '../types';
import { processChartConfig } from '@/utils/chart/processChartConfig';
import * as echarts from 'echarts';
import { themeManager } from '@/utils/chart/theme';

export const EChartsRenderer: React.FC<EChartsRendererProps> = ({
    option,
    style = { height: '400px' },
    data
}) => {
    // 监听主题变化
    useEffect(() => {
        const handleThemeChange = () => {
            // 强制重新渲染图表
            const chartInstance = echarts.getInstanceByDom(
                document.querySelector('.echarts-for-react') as HTMLElement
            );
            if (chartInstance) {
                chartInstance.dispose();
            }
        };

        themeManager.addThemeChangeListener(handleThemeChange);
        return () => {
            themeManager.removeThemeChangeListener(handleThemeChange);
        };
    }, []);

    // 加载地图数据
    useEffect(() => {
        const loadMapData = async () => {
            try {
                // 检查是否已经注册了世界地图
                if (!echarts.getMap('world')) {
                    const response = await fetch('/world.json');
                    const geoJson = await response.json();
                    echarts.registerMap('world', geoJson);
                }
            } catch (error) {
                console.error('Failed to load world map data:', error);
            }
        };

        loadMapData();
    }, []);

    // 处理配置和数据
    const processedOption = useMemo(() => {
        try {
            // 确保配置对象存在
            if (!option) {
                console.error('Chart option is missing');
                return {};
            }

            // 确保 dataset 配置正确
            if (option.dataset) {
                console.log('Dataset in option:', option.dataset);
            } else {
                console.error('Dataset is missing in option');
            }

            // 获取当前主题
            const theme = themeManager.getCurrentTheme();

            // 处理配置中的 JavaScript 表达式
            const processed = processChartConfig(option, { data });

            // 添加通用配置和主题配置
            const finalOption = {
                ...processed,
                backgroundColor: theme.backgroundColor,
                textStyle: theme.textStyle,
                title: {
                    ...processed.title,
                    textStyle: theme.title?.textStyle,
                    subtextStyle: theme.title?.subtextStyle
                },
                legend: {
                    ...processed.legend,
                    textStyle: theme.legend?.textStyle
                },
                tooltip: {
                    ...processed.tooltip,
                    ...theme.tooltip,
                    confine: true
                },
                grid: {
                    ...processed.grid,
                    containLabel: true
                },
                animation: true
            };

            console.log('Final processed option:', JSON.stringify(finalOption, null, 2));
            return finalOption;
        } catch (error) {
            console.error('Error processing chart option:', error);
            return option; // 如果处理失败，返回原始配置
        }
    }, [option, data]);

    // 图表事件处理
    const onChartReady = (echarts: any) => {
        console.log('Chart is ready');
    };

    const onChartClick = (params: any) => {
        console.log('Chart clicked:', params);
    };

    const onEvents = {
        'click': onChartClick
    };

    return (
        <ReactECharts 
            option={processedOption}
            style={style}
            notMerge={true}
            lazyUpdate={true}
            onChartReady={onChartReady}
            onEvents={onEvents}
            theme={themeManager.getCurrentThemeName()}
        />
    );
}; 