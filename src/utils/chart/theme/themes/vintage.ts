import { ThemeOption } from '../types';

export const vintageTheme: ThemeOption = {
    color: [
        '#d87c7c',
        '#919e8b',
        '#d7ab82',
        '#6e7074',
        '#61a0a8',
        '#efa18d',
        '#787464',
        '#cc7e63',
        '#724e58'
    ],
    backgroundColor: '#fef8ef',
    textStyle: {
        color: '#333333',
        fontSize: 12,
        fontFamily: 'Georgia, serif'
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
            color: '#999999'
        }
    },
    splitLine: {
        lineStyle: {
            color: '#dddddd',
            type: 'dashed'
        }
    },
    tooltip: {
        backgroundColor: 'rgba(254, 248, 239, 0.9)',
        borderColor: '#999999',
        textStyle: {
            color: '#333333'
        }
    }
}; 