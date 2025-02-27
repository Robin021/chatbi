
import { NextRequest, NextResponse } from 'next/server';
import { GetRelevantDataSourcesRequest, GetRelevantDataSourcesResponse } from '@/app/api/pipeline/fetchData/type';
import { Pipeline } from '@/utils/pipelines/fetchDataPipeline';
import { getAuth } from '@/utils/auth-middleware';

export async function POST(request: NextRequest) {

    const auth = await getAuth(request);

    const { query, dataset, llm } = await request.json() as GetRelevantDataSourcesRequest;

    const dataSources = await Pipeline.getRelevantDataSources(dataset, query, llm);

    return NextResponse.json({ dataSources } as GetRelevantDataSourcesResponse);

}