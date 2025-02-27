import React, { useState } from 'react';
import { Card, Flex, Select, Button, Space, Tooltip, Tag } from 'antd';
import { 
    SettingOutlined, 
    FilterOutlined, 
    DownloadOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import type { ChartControlsProps } from '@/components/charts/types';
import { chartTypeConfigs } from '../../../utils/chart/types/chartTypes';
import { getImplementedChartTypes } from '../../../utils/chart/handlers/registry';
import { ChartConfigDrawer } from './ChartConfigDrawer';
import { ChartFilterDrawer } from './ChartFilterDrawer';
import { useChartTranslation } from '../hooks/useChartTranslation';
import type { DefaultOptionType } from 'antd/es/select';
import type { ChartTranslationKey } from '../hooks/useChartTranslation';

interface ChartOption extends DefaultOptionType {
    searchText?: string;
    group?: string;
    icon?: React.ComponentType<{ style?: React.CSSProperties }>;
    description?: string;
    development?: boolean;
}

interface GroupedOption {
    label: string;
    options: ChartOption[];
}

// 辅助函数：从 dataset 中提取维度名称
const getDimensionsFromDataset = (dataset: any): string[] => {
    if (!dataset) return [];
    if (Array.isArray(dataset)) {
        return (dataset[0]?.dimensions || []).map(dim => 
            typeof dim === 'string' ? dim : dim.name || ''
        ).filter(Boolean);
    }
    return (dataset.dimensions || []).map(dim => 
        typeof dim === 'string' ? dim : dim.name || ''
    ).filter(Boolean);
};

export const ChartControls: React.FC<ChartControlsProps> = ({
    chartType,
    chartConfig,
    data,
    onChartTypeChange,
    onConfigChange,
    onDataFilter,
    lang = 'cn'
}) => {
    const [configDrawerVisible, setConfigDrawerVisible] = useState(false);
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const { t, translateCategory } = useChartTranslation();

    // 获取已实现的图表类型
    const implementedTypes = getImplementedChartTypes();

    const options = chartTypeConfigs.map(type => {
        const isImplemented = !type.development;
        const label = t(`types.${type.value}`);
        const description = t(`descriptions.${type.value}`);
        const category = translateCategory(type.category);

        const option: ChartOption = {
            label: label,
            value: type.value,
            disabled: !isImplemented,
            group: category,
            searchText: `${label} ${description}`.toLowerCase(),
            icon: type.icon,
            description,
            development: type.development
        };

        return option;
    });

    // 按类别分组选项
    const groupedOptions: GroupedOption[] = Object.entries(
        options.reduce((groups, option) => {
            const group = option.group || '';
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(option);
            return groups;
        }, {} as Record<string, ChartOption[]>)
    ).map(([label, options]) => ({
        label,
        options
    }));

    // 导出图表为图片
    const handleExport = () => {
        const chartElement = document.querySelector('.echarts-for-react');
        if (chartElement) {
            const canvas = chartElement.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `chart-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        }
    };

    return (
        <Card size="small">
            <Flex gap="middle" align="center">
                <Select<string, ChartOption>
                    style={{ width: '100%' }}
                    placeholder={t('controls.selectChartType')}
                    onChange={onChartTypeChange}
                    options={groupedOptions}
                    optionFilterProp="searchText"
                    showSearch
                    filterOption={(input, option) => {
                        if (!option?.searchText) return false;
                        return option.searchText.includes(input.toLowerCase());
                    }}
                    listHeight={400}
                    optionRender={(option) => {
                        if (!option.data) return null;
                        if (!option.data.icon) return null;
                        
                        return (
                            <Flex align="center" gap="small" style={{ padding: '4px 0' }}>
                                {React.createElement(option.data.icon, {
                                    style: { fontSize: '16px', color: '#666' }
                                })}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {option.data.label}
                                        {option.data.development && (
                                            <Tag color="warning" style={{ marginLeft: 8 }}>
                                                {t('message.development')}
                                            </Tag>
                                        )}
                                    </div>
                                    <div style={{ 
                                        color: 'rgba(0, 0, 0, 0.45)',
                                        fontSize: '12px',
                                        lineHeight: '1.4',
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        marginTop: '4px'
                                    }}>
                                        {option.data.description}
                                    </div>
                                </div>
                            </Flex>
                        );
                    }}
                />
                
                <Space>
                    <Tooltip title={t('controls.adjustConfig')}>
                        <Button 
                            icon={<SettingOutlined />} 
                            onClick={() => setConfigDrawerVisible(true)}
                        />
                    </Tooltip>
                    
                    <Tooltip title={t('controls.filterData')}>
                        <Button 
                            icon={<FilterOutlined />}
                            onClick={() => setFilterDrawerVisible(true)}
                        />
                    </Tooltip>
                    
                    <Tooltip title={t('controls.exportChart')}>
                        <Button 
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                        />
                    </Tooltip>
                </Space>
            </Flex>

            <ChartConfigDrawer
                visible={configDrawerVisible}
                onClose={() => setConfigDrawerVisible(false)}
                config={chartConfig}
                onConfigUpdate={onConfigChange}
                lang={lang}
            />

            <ChartFilterDrawer
                visible={filterDrawerVisible}
                onClose={() => setFilterDrawerVisible(false)}
                data={data}
                dimensions={getDimensionsFromDataset(chartConfig.dataset)}
                onFilter={onDataFilter}
                lang={lang}
            />
        </Card>
    );
}; 