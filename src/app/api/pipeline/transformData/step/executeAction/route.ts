
import { NextRequest, NextResponse } from 'next/server';
import { Pipeline } from '@/utils/pipelines/transformDataPipeline/index';
import { getAuth } from '@/utils/auth-middleware';
import { ChooseActionRequest, ChooseActionResponse, ExecuteActionRequest, ExecuteActionResponse } from '@/app/api/pipeline/transformData/type';

export async function POST(request: NextRequest) {

    const auth = await getAuth(request);

    const { action, fetchedData, query, llm } = await request.json() as ExecuteActionRequest;

    const newFetchedData = await Pipeline.executeAction(action, fetchedData, query, llm);

    const response: ExecuteActionResponse = {
        fetchedData: newFetchedData
    }

    return NextResponse.json(response);

}