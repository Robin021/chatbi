import { ThemeOption } from '../types';

export const techBlueTheme: ThemeOption = {
    color: [
        '#0077ff',
        '#00bcd4',
        '#00e5ff',
        '#4fc3f7',
        '#40c4ff',
        '#18ffff',
        '#80d8ff',
        '#03a9f4',
        '#00b0ff'
    ],
    backgroundColor: '#001529',
    textStyle: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'Roboto, sans-serif'
    },
    title: {
        textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#00bcd4'
        },
        subtextStyle: {
            fontSize: 12,
            color: '#4fc3f7'
        }
    },
    legend: {
        textStyle: {
            color: '#ffffff'
        }
    },
    axisLine: {
        lineStyle: {
            color: '#003366'
        }
    },
    splitLine: {
        lineStyle: {
            color: '#002952',
            type: 'dashed'
        }
    },
    tooltip: {
        backgroundColor: 'rgba(0, 21, 41, 0.9)',
        borderColor: '#003366',
        textStyle: {
            color: '#ffffff'
        }
    }
}; 