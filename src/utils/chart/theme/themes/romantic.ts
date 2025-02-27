import { ThemeOption } from '../types';

export const romanticTheme: ThemeOption = {
    color: [
        '#ff7878',
        '#ffa1a1',
        '#ffd4d4',
        '#ffb6c1',
        '#ffc0cb',
        '#dda0dd',
        '#e6e6fa',
        '#d8bfd8',
        '#f0e68c'
    ],
    backgroundColor: '#fff6f6',
    textStyle: {
        color: '#4a4a4a',
        fontSize: 12,
        fontFamily: 'Helvetica, sans-serif'
    },
    title: {
        textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ff7878'
        },
        subtextStyle: {
            fontSize: 12,
            color: '#ffa1a1'
        }
    },
    legend: {
        textStyle: {
            color: '#4a4a4a'
        }
    },
    axisLine: {
        lineStyle: {
            color: '#ffb6c1'
        }
    },
    splitLine: {
        lineStyle: {
            color: '#ffd4d4',
            type: 'dashed'
        }
    },
    tooltip: {
        backgroundColor: 'rgba(255, 246, 246, 0.9)',
        borderColor: '#ffb6c1',
        textStyle: {
            color: '#4a4a4a'
        }
    }
}; 