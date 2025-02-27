import type { CSSProperties } from 'react';
import type { EChartsOption } from 'echarts';
import type { ChartEvent, ChartTheme } from '../../../utils/chart/types/chart.types';

// 图表渲染器属性
export interface EChartsRendererProps {
    option: EChartsOption;
    style?: CSSProperties;
    theme?: ChartTheme;
    data?: any[];
    loading?: boolean;
    onEvents?: {
        [key: string]: (params: ChartEvent) => void;
    };
    onChartReady?: (instance: any) => void;
}

// 图表渲染配置
export interface RenderOptions {
    notMerge?: boolean;
    lazyUpdate?: boolean;
    silent?: boolean;
}

// 图表实例方法
export interface ChartInstanceMethods {
    getWidth: () => number;
    getHeight: () => number;
    getDom: () => HTMLElement;
    getOption: () => EChartsOption;
    resize: (opts?: { width?: number | string; height?: number | string; silent?: boolean }) => void;
    dispatchAction: (payload: any) => void;
    on: (eventName: string, handler: Function) => void;
    off: (eventName: string, handler?: Function) => void;
    convertToPixel: (finder: any, value: any) => number[];
    convertFromPixel: (finder: any, value: any) => number[];
    containPixel: (finder: any, value: any) => boolean;
    showLoading: (type?: string, opts?: any) => void;
    hideLoading: () => void;
    getDataURL: (opts?: { type?: string; pixelRatio?: number; backgroundColor?: string }) => string;
    getConnectedDataURL: (opts?: { type?: string; pixelRatio?: number; backgroundColor?: string }) => string;
    clear: () => void;
    dispose: () => void;
}

// 图表渲染错误
export interface RenderError {
    type: 'config' | 'data' | 'render';
    message: string;
    details?: any;
} 