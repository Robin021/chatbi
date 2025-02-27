import { ThemeOption } from '../types';

export const defaultTheme: ThemeOption = {
    color: [
        '#5470c6',
        '#91cc75',
        '#fac858',
        '#ee6666',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4',
        '#ea7ccc'
    ],
    backgroundColor: '#ffffff',
    textStyle: {
        color: '#333333',
        fontSize: 12,
        fontFamily: 'sans-serif'
    },
    title: {
        textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333333'
        },
        subtextStyle: {
            fontSize: 12,
            color: '#666666'
        }
    },
    legend: {
        textStyle: {
            color: '#333333'
        }
    },
    axisLine: {
        lineStyle: {
            color: '#cccccc'
        }
    },
    splitLine: {
        lineStyle: {
            color: '#eeeeee',
            type: 'dashed'
        }
    },
    tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#cccccc',
        textStyle: {
            color: '#333333'
        }
    }
}; 