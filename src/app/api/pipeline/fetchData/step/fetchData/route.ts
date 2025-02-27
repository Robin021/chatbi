
import { NextRequest, NextResponse } from 'next/server';
import { FetchDataRequest, FetchDataResponse } from '@/app/api/pipeline/fetchData/type';
import { Pipeline } from '@/utils/pipelines/fetchDataPipeline';
import { getAuth } from '@/utils/auth-middleware';

export async function POST(request: NextRequest) {

    const auth = await getAuth(request);

    const { query, dataSources, config, llm } = await request.json() as FetchDataRequest;
    const data = await Pipeline.fetchData(dataSources, query, config, llm);

    const response: FetchDataResponse = {
        data
    }

    return NextResponse.json(response);

}