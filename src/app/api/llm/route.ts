import { askLLM } from '@/utils/llm';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/utils/auth-middleware';
import { ChatCompletionMessageParam } from '@/utils/llm/type';
import { LLMRecord } from '@/utils/pocketbase/collections/type';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const auth = await getAuth(request);

        // Parse request body
        const {messages, llm}: {messages: ChatCompletionMessageParam[], llm: LLMRecord} = await request.json();
        // Call LLM
        const response = await askLLM(messages, llm);
       
        return NextResponse.json( { content: response } );
    } catch (error) {
        console.error('LLM API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}