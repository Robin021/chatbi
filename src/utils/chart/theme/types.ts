export interface ThemeOption {
    // 主题色系
    color?: string[];
    
    // 背景色
    backgroundColor?: string;
    
    // 文字样式
    textStyle?: {
        color?: string;
        fontSize?: number;
        fontFamily?: string;
    };
    
    // 标题样式
    title?: {
        textStyle?: {
            color?: string;
            fontSize?: number;
            fontWeight?: string | number;
        };
        subtextStyle?: {
            color?: string;
            fontSize?: number;
        };
    };
    
    // 图例样式
    legend?: {
        textStyle?: {
            color?: string;
        };
    };
    
    // 坐标轴样式
    axisLine?: {
        lineStyle?: {
            color?: string;
        };
    };
    
    // 分割线样式
    splitLine?: {
        lineStyle?: {
            color?: string;
            type?: string;
        };
    };

    // 工具提示样式
    tooltip?: {
        backgroundColor?: string;
        borderColor?: string;
        textStyle?: {
            color?: string;
        };
    };
} 