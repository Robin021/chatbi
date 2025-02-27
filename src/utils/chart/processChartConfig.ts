import { isObject } from 'lodash';

/**
 * 执行 JavaScript 表达式并返回结果
 * @param expression JavaScript 表达式字符串
 * @param context 执行上下文（包含可用的变量）
 * @returns 执行结果
 */
const evaluateExpression = (expression: string, context: any = {}) => {
    try {
        // 如果是函数定义
        if (expression.startsWith('function(')) {
            return new Function('return ' + expression)();
        }
        
        // 如果是箭头函数或 data.map 表达式
        if (expression.includes('=>') || expression.includes('data.map')) {
            const { data } = context;
            // 使用 Function 构造器创建一个新的函数，并传入必要的上下文
            return new Function('data', `return ${expression}`)(data);
        }

        // 其他简单表达式
        return new Function('context', `with(context) { return ${expression}; }`)(context);
    } catch (error) {
        console.error('Error evaluating expression:', expression, error);
        return null;
    }
};

/**
 * 递归处理配置对象中的 JavaScript 表达式
 * @param config 配置对象
 * @param context 执行上下文
 * @returns 处理后的配置对象
 */
const processConfigValue = (value: any, context: any): any => {
    // 处理字符串类型的 JavaScript 表达式
    if (typeof value === 'string' && (
        value.includes('function(') ||
        value.includes('=>') ||
        value.includes('data.map')
    )) {
        return evaluateExpression(value, context);
    }

    // 处理数组
    if (Array.isArray(value)) {
        return value.map(item => processConfigValue(item, context));
    }

    // 处理对象
    if (isObject(value)) {
        const result: any = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = processConfigValue(val, context);
        }
        return result;
    }

    return value;
};

/**
 * 处理 ECharts 配置，执行其中的 JavaScript 表达式
 * @param config 原始配置对象
 * @param context 执行上下文（包含数据等信息）
 * @returns 处理后的配置对象
 */
export const processChartConfig = (config: any, context: any = {}) => {
    try {
        return processConfigValue(config, context);
    } catch (error) {
        console.error('Error processing chart config:', error);
        return config; // 如果处理失败，返回原始配置
    }
}; 