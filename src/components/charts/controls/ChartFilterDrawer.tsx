import React, { useState } from 'react';
import { Drawer, Form, Select, Input, Button, Space, Table, Alert, InputNumber, DatePicker } from 'antd';
import type { ChartFilterDrawerProps } from '../types';
import { useChartTranslation } from '../hooks/useChartTranslation';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface FilterCondition {
    field: string;
    operator: string;
    value: any;
}

export const ChartFilterDrawer: React.FC<ChartFilterDrawerProps> = ({
    visible,
    onClose,
    data,
    dimensions = [],
    onFilter,
    lang = 'cn'
}) => {
    const { t } = useChartTranslation();
    const [form] = Form.useForm();
    const [conditions, setConditions] = useState<FilterCondition[]>([]);
    const [previewData, setPreviewData] = useState(data);

    // 获取字段类型
    const getFieldType = (field: string): 'number' | 'date' | 'string' => {
        if (!data || data.length === 0) return 'string';
        const value = data[0][field];
        if (typeof value === 'number') return 'number';
        if (value instanceof Date) return 'date';
        if (!isNaN(Date.parse(value))) return 'date';
        return 'string';
    };

    // 获取字段的唯一值
    const getFieldUniqueValues = (field: string): any[] => {
        if (!data || data.length === 0) return [];
        const values = new Set(data.map(item => item[field]));
        return Array.from(values);
    };

    // 获取操作符选项
    const getOperatorOptions = (fieldType: string) => {
        const commonOperators = [
            { label: t('filter.equals'), value: 'equals' },
            { label: t('filter.notEquals'), value: 'notEquals' },
        ];

        switch (fieldType) {
            case 'number':
                return [
                    ...commonOperators,
                    { label: t('filter.greater'), value: 'greater' },
                    { label: t('filter.less'), value: 'less' },
                    { label: t('filter.greaterEquals'), value: 'greaterEquals' },
                    { label: t('filter.lessEquals'), value: 'lessEquals' },
                ];
            case 'date':
                return [
                    ...commonOperators,
                    { label: t('filter.before'), value: 'before' },
                    { label: t('filter.after'), value: 'after' },
                ];
            default:
                return [
                    ...commonOperators,
                    { label: t('filter.contains'), value: 'contains' },
                    { label: t('filter.notContains'), value: 'notContains' },
                    { label: t('filter.startsWith'), value: 'startsWith' },
                    { label: t('filter.endsWith'), value: 'endsWith' },
                ];
        }
    };

    // 渲染值输入组件
    const renderValueInput = (fieldName: string, operator: string) => {
        const fieldType = getFieldType(fieldName);
        const uniqueValues = getFieldUniqueValues(fieldName);

        if (uniqueValues.length <= 10) {
            return (
                <Select
                    style={{ width: '100%' }}
                    options={uniqueValues.map(value => ({
                        label: String(value),
                        value: value
                    }))}
                />
            );
        }

        switch (fieldType) {
            case 'number':
                return <InputNumber style={{ width: '100%' }} />;
            case 'date':
                return <DatePicker style={{ width: '100%' }} />;
            default:
                return <Input />;
        }
    };

    // 添加筛选条件
    const addCondition = () => {
        setConditions([...conditions, { field: '', operator: '', value: null }]);
    };

    // 删除筛选条件
    const removeCondition = (index: number) => {
        const newConditions = [...conditions];
        newConditions.splice(index, 1);
        setConditions(newConditions);
        applyFilter(newConditions);
    };

    // 应用筛选
    const applyFilter = (currentConditions: FilterCondition[] = conditions) => {
        const filteredData = data.filter(item => {
            return currentConditions.every(condition => {
                const { field, operator, value } = condition;
                const itemValue = item[field];
                
                switch (operator) {
                    case 'equals':
                        return itemValue === value;
                    case 'notEquals':
                        return itemValue !== value;
                    case 'contains':
                        return String(itemValue).includes(String(value));
                    case 'notContains':
                        return !String(itemValue).includes(String(value));
                    case 'greater':
                        return Number(itemValue) > Number(value);
                    case 'less':
                        return Number(itemValue) < Number(value);
                    case 'greaterEquals':
                        return Number(itemValue) >= Number(value);
                    case 'lessEquals':
                        return Number(itemValue) <= Number(value);
                    case 'startsWith':
                        return String(itemValue).startsWith(String(value));
                    case 'endsWith':
                        return String(itemValue).endsWith(String(value));
                    case 'before':
                        return new Date(itemValue) < new Date(value);
                    case 'after':
                        return new Date(itemValue) > new Date(value);
                    default:
                        return true;
                }
            });
        });

        setPreviewData(filteredData);
        return filteredData;
    };

    // 处理表单提交
    const handleSubmit = (values: any) => {
        const filteredData = applyFilter();
        onFilter(filteredData);
        onClose();
    };

    // 预览数据表格列
    const columns = dimensions.map(dim => ({
        title: dim,
        dataIndex: dim,
        key: dim,
        ellipsis: true
    }));

    return (
        <Drawer
            title={t('filter.title')}
            open={visible}
            onClose={onClose}
            width={800}
            styles={{ body: { padding: 24 } }}
        >
            <Form form={form} onFinish={handleSubmit}>
                <Alert
                    message={t('filter.tip')}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                
                {conditions.map((condition, index) => (
                    <div key={index} style={{ marginBottom: 16 }}>
                        <Space align="baseline" style={{ width: '100%', marginBottom: 8 }}>
                            <Form.Item
                                name={['conditions', index, 'field']}
                                style={{ width: 200, marginBottom: 0 }}
                            >
                                <Select
                                    placeholder={t('filter.selectField')}
                                    options={dimensions.map(dim => ({
                                        label: dim,
                                        value: dim
                                    }))}
                                    onChange={(value) => {
                                        const newConditions = [...conditions];
                                        newConditions[index].field = value;
                                        setConditions(newConditions);
                                    }}
                                />
                            </Form.Item>
                            
                            <Form.Item
                                name={['conditions', index, 'operator']}
                                style={{ width: 150, marginBottom: 0 }}
                            >
                                <Select
                                    placeholder={t('filter.selectOperator')}
                                    options={getOperatorOptions(getFieldType(condition.field))}
                                    onChange={(value) => {
                                        const newConditions = [...conditions];
                                        newConditions[index].operator = value;
                                        setConditions(newConditions);
                                    }}
                                />
                            </Form.Item>
                            
                            <Form.Item
                                name={['conditions', index, 'value']}
                                style={{ width: 200, marginBottom: 0 }}
                            >
                                {renderValueInput(condition.field, condition.operator)}
                            </Form.Item>
                            
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => removeCondition(index)}
                            />
                        </Space>
                    </div>
                ))}

                <Button
                    type="dashed"
                    onClick={addCondition}
                    style={{ width: '100%', marginBottom: 16 }}
                    icon={<PlusOutlined />}
                >
                    {t('filter.addCondition')}
                </Button>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            {t('filter.apply')}
                        </Button>
                        <Button onClick={onClose}>
                            {t('filter.cancel')}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            <div style={{ marginTop: 24 }}>
                <h4>{t('filter.preview')}</h4>
                <Table
                    columns={columns}
                    dataSource={previewData}
                    size="small"
                    scroll={{ x: true, y: 300 }}
                    pagination={{ pageSize: 5 }}
                />
            </div>
        </Drawer>
    );
}; 