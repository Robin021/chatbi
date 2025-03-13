// 判断是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 调试日志函数，只在开发环境中打印
 * @param label - 日志标签
 * @param data - 要打印的数据
 */
export const debugLog = (label: string, data?: any): void => {
  if (isDevelopment) {
    console.log(`[Debug] ${label}:`, data);
  }
};

/**
 * 调试错误日志函数，只在开发环境中打印
 * @param label - 错误标签
 * @param error - 错误信息
 */
export const debugError = (label: string, error?: any): void => {
  if (isDevelopment) {
    console.error(`[Debug Error] ${label}:`, error);
  }
}; 