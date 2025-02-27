import type { ChartType } from '../types/chartTypes';
import type { ChartTypeHandler } from '../../../utils/chart/types/handler.types';

class ChartHandlerRegistry {
    private static instance: ChartHandlerRegistry;
    private handlers = new Map<ChartType, ChartTypeHandler>();

    private constructor() {}

    static getInstance(): ChartHandlerRegistry {
        if (!ChartHandlerRegistry.instance) {
            ChartHandlerRegistry.instance = new ChartHandlerRegistry();
        }
        return ChartHandlerRegistry.instance;
    }

    register(type: ChartType, handler: ChartTypeHandler): void {
        this.handlers.set(type, handler);
    }

    getHandler(type: ChartType): ChartTypeHandler | undefined {
        return this.handlers.get(type);
    }

    getImplementedTypes(): ChartType[] {
        return Array.from(this.handlers.keys());
    }

    hasHandler(type: ChartType): boolean {
        return this.handlers.has(type);
    }
}

// 导出单例实例
export const chartHandlerRegistry = ChartHandlerRegistry.getInstance();

// 导出已实现的图表类型
export const getImplementedChartTypes = () => chartHandlerRegistry.getImplementedTypes(); 