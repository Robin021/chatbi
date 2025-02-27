'use client';

import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, Tabs, Space, Alert, Divider, Switch, InputNumber, Select } from 'antd';
import type { ChartConfigDrawerProps } from '../types';
import { useChartTranslation } from '../hooks/useChartTranslation';
import type { EChartsOption } from 'echarts';
import type { NamePath } from 'antd/es/form/interface';
import { themeManager } from '@/utils/chart/theme';

interface FormValues extends EChartsOption {
    theme?: string;
    title?: {
        show?: boolean;
        text?: string;
        subtext?: string;
    };
    legend?: {
        show?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
        show?: boolean;
        trigger?: 'item' | 'axis';
    };
    grid?: {
        show?: boolean;
        containLabel?: boolean;
    };
    animation?: boolean;
    animationDuration?: number;
}

interface ConfigItem {
    name: NamePath;
    type: 'switch' | 'input' | 'select' | 'number';
    label: string;
    options?: Array<{ value: string; label: string }>;
    props?: Record<string, any>;
}

type ConfigSectionType = Record<string, ConfigItem[]>;

const ConfigSections: ConfigSectionType = {
    theme: [
        {
            name: 'theme',
            type: 'select',
            label: 'config.theme',
            options: Object.entries(themeManager.getAllThemes()).map(([value, label]) => ({
                value,
                label: `config.theme${value.charAt(0).toUpperCase() + value.slice(1)}`
            }))
        }
    ],
    title: [
        { name: ['title', 'show'], type: 'switch', label: 'config.showTitle' },
        { name: ['title', 'text'], type: 'input', label: 'config.titleText' },
        { name: ['title', 'subtext'], type: 'input', label: 'config.subTitleText' }
    ],
    legend: [
        { name: ['legend', 'show'], type: 'switch', label: 'config.showLegend' },
        { 
            name: ['legend', 'position'], 
            type: 'select', 
            label: 'config.legendPosition',
            options: [
                { value: 'top', label: 'config.top' },
                { value: 'bottom', label: 'config.bottom' },
                { value: 'left', label: 'config.left' },
                { value: 'right', label: 'config.right' }
            ]
        }
    ],
    tooltip: [
        { name: ['tooltip', 'show'], type: 'switch', label: 'config.showTooltip' },
        {
            name: ['tooltip', 'trigger'],
            type: 'select',
            label: 'config.tooltipTrigger',
            options: [
                { value: 'item', label: 'config.tooltipTriggerItem' },
                { value: 'axis', label: 'config.tooltipTriggerAxis' }
            ]
        }
    ],
    grid: [
        { name: ['grid', 'show'], type: 'switch', label: 'config.showGrid' },
        { name: ['grid', 'containLabel'], type: 'switch', label: 'config.containLabel' }
    ],
    map: [
        { name: ['series', 0, 'roam'], type: 'switch', label: 'config.mapRoam' },
        { name: ['series', 0, 'label', 'show'], type: 'switch', label: 'config.mapShowLabel' },
        { name: ['visualMap', 'show'], type: 'switch', label: 'config.mapShowVisualMap' },
        { name: ['visualMap', 'calculable'], type: 'switch', label: 'config.mapVisualMapCalculable' },
        { name: ['visualMap', 'min'], type: 'number', label: 'config.mapVisualMapMin' },
        { name: ['visualMap', 'max'], type: 'number', label: 'config.mapVisualMapMax' }
    ],
    animation: [
        { name: ['animation'], type: 'switch', label: 'config.enableAnimation' },
        { name: ['animationDuration'], type: 'number', label: 'config.animationDuration', props: { min: 0, max: 5000 } }
    ]
};

const SECTION_TRANSLATION_KEYS = {
    theme: 'config.themeSection',
    title: 'config.title',
    legend: 'config.legend',
    tooltip: 'config.tooltip',
    grid: 'config.grid',
    animation: 'config.animation'
} as const;

export const ChartConfigDrawer: React.FC<ChartConfigDrawerProps> = ({
    visible,
    onClose,
    config,
    onConfigUpdate
}) => {
    const { t } = useChartTranslation();
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [currentTheme, setCurrentTheme] = useState(themeManager.getCurrentThemeName());

    useEffect(() => {
        const handleThemeChange = (theme: string) => {
            setCurrentTheme(theme);
        };

        themeManager.addThemeChangeListener(handleThemeChange);
        return () => {
            themeManager.removeThemeChangeListener(handleThemeChange);
        };
    }, []);

    const handleVisualFormSubmit = (values: FormValues) => {
        const { theme, ...otherValues } = values;
        
        if (theme && theme !== currentTheme) {
            themeManager.setCurrentTheme(theme);
        }

        onConfigUpdate(otherValues);
        onClose();
    };

    const handleTextFormSubmit = (values: { config: string }) => {
        try {
            const newConfig = JSON.parse(values.config);
            onConfigUpdate(newConfig);
            onClose();
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : String(error));
        }
    };

    const renderFormItem = (item: ConfigItem) => {
        const baseProps = { label: t(item.label as any), name: item.name };

        switch (item.type) {
            case 'switch':
                return (
                    <Form.Item {...baseProps} valuePropName="checked">
                        <Switch />
                    </Form.Item>
                );
            case 'input':
                return (
                    <Form.Item {...baseProps}>
                        <Input />
                    </Form.Item>
                );
            case 'select':
                return (
                    <Form.Item {...baseProps}>
                        <Select>
                            {item.options?.map(opt => (
                                <Select.Option key={opt.value} value={opt.value}>
                                    {t(opt.label as any)}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                );
            case 'number':
                return (
                    <Form.Item {...baseProps}>
                        <InputNumber {...item.props} />
                    </Form.Item>
                );
            default:
                return null;
        }
    };

    const renderVisualForm = () => (
        <Form 
            layout="vertical"
            initialValues={{ ...config, theme: currentTheme }}
            onFinish={handleVisualFormSubmit}
        >
            {Object.entries(ConfigSections).map(([section, items]) => (
                <React.Fragment key={section}>
                    <Divider orientation="left">{t(SECTION_TRANSLATION_KEYS[section as keyof typeof SECTION_TRANSLATION_KEYS])}</Divider>
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            {renderFormItem(item)}
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {t('config.update')}
                    </Button>
                    <Button onClick={onClose}>
                        {t('config.cancel')}
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );

    const items = [
        {
            key: 'visual',
            label: t('config.visualEditor'),
            children: (
                <>
                    <Alert
                        message={t('config.visualEditorTip')}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    {renderVisualForm()}
                </>
            )
        },
        {
            key: 'text',
            label: t('config.textEditor'),
            children: (
                <Form 
                    layout="vertical"
                    onFinish={handleTextFormSubmit}
                    initialValues={{ config: JSON.stringify(config, null, 2) }}
                >
                    <Alert
                        message={t('config.textEditorTip')}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    {jsonError && (
                        <Alert
                            message={t('config.jsonError')}
                            description={jsonError}
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}
                    <Form.Item name="config">
                        <Input.TextArea 
                            rows={20} 
                            style={{ fontFamily: 'monospace' }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {t('config.update')}
                            </Button>
                            <Button onClick={onClose}>
                                {t('config.cancel')}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            )
        }
    ];

    return (
        <Drawer
            title={t('config.title')}
            open={visible}
            onClose={onClose}
            width={800}
        >
            <Tabs items={items} defaultActiveKey="visual" />
        </Drawer>
    );
}; 