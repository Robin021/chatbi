import { NextRequest, NextResponse } from 'next/server';
import { Pipeline } from '@/utils/pipelines/transformDataPipeline/index';
import { getAuth } from '@/utils/auth-middleware';
import { ChooseActionRequest, ChooseActionResponse } from '@/app/api/pipeline/transformData/type';
import { DataTransformActionType } from '@/utils/pipelines/transformDataPipeline/type';

export async function POST(request: NextRequest) {

    const auth = await getAuth(request);

    const { query, llm } = await request.json() as ChooseActionRequest;

    try{

    const action = await Pipeline.chooseAction(query, llm);

    const response: ChooseActionResponse = {
        action
    }

    return NextResponse.json(response);

    } catch (e) {

        const response: ChooseActionResponse = {
            action: DataTransformActionType.invalid
        }
    
        return NextResponse.json(response);

    }


    

}