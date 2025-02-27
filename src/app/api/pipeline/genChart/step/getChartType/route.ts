import { NextRequest, NextResponse } from 'next/server';
import { GetChartTypeRequest, GetChartTypeResponse } from '@/app/api/pipeline/genChart/type';
import { getAuth } from '@/utils/auth-middleware';
import { Pipeline } from '@/utils/pipelines/genChartPipeline';

export async function POST(request: NextRequest) {
    try {
        const auth = await getAuth(request);
        const { query, sampleData, llm } = await request.json() as GetChartTypeRequest;
        const result = await Pipeline.getChartType(sampleData, query, 'en', llm);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in getChartType:', error);
        return NextResponse.json(
            { error: 'Failed to determine chart type' },
            { status: 500 }
        );
    }
} 