import { NextRequest, NextResponse } from 'next/server';
import { GenerateChartConfigRequest, GenerateChartConfigResponse } from '@/app/api/pipeline/genChart/type';
import { Pipeline } from '@/utils/pipelines/genChartPipeline';
import { getAuth } from '@/utils/auth-middleware';
import { ChartType } from '@/utils/chart/types/chartTypes';


const cleanResponse = (result: any) => {
    // 确保返回的是干净的对象
    return {
        config: result.config || {},
        explanation: result.explanation || ''
    };
};

export async function POST(request: NextRequest) {
    try {
        const auth = await getAuth(request);
        const { query, chartType, data } = await request.json() as GenerateChartConfigRequest;
        const result = await Pipeline.generateChartConfig(chartType as ChartType, data, query);
        
        // 确保返回干净的响应对象
        return NextResponse.json(cleanResponse(result));
    } catch (error) {
        console.error('Error in generateChartConfig:', error);
        return NextResponse.json(
            { error: 'Failed to generate chart configuration' },
            { status: 500 }
        );
    }
} 