import { ThemeOption } from '../types';

export const darkTheme: ThemeOption = {
    color: [
        '#4992ff',
        '#7cffb2',
        '#fddd60',
        '#ff6e76',
        '#58d9f9',
        '#05c091',
        '#ff8a45',
        '#8d48e3',
        '#dd6b66'
    ],
    backgroundColor: '#100c2a',
    textStyle: {
        color: '#ecf0f1',
        fontSize: 12,
        fontFamily: 'sans-serif'
    },
    title: {
        textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ecf0f1'
        },
        subtextStyle: {
            fontSize: 12,
            color: '#95a5a6'
        }
    },
    legend: {
        textStyle: {
            color: '#ecf0f1'
        }
    },
    axisLine: {
        lineStyle: {
            color: '#2c3e50'
        }
    },
    splitLine: {
        lineStyle: {
            color: '#34495e',
            type: 'dashed'
        }
    },
    tooltip: {
        backgroundColor: 'rgba(24, 24, 36, 0.9)',
        borderColor: '#2c3e50',
        textStyle: {
            color: '#ecf0f1'
        }
    }
}; 