import { NextRequest } from 'next/server';
import { getAuth } from '@/utils/auth-middleware';
import { client } from '@/utils/llm';
import { ChatCompletionMessageParam, OpenAIOptions } from '@/utils/llm/type';
import { LLMRecord } from '@/utils/pocketbase/collections/type';
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const auth = await getAuth(request);

        const {messages, llm}: {messages: ChatCompletionMessageParam[], llm: LLMRecord} = await request.json();
        
        // Create stream from LLM
        const stream = await client.createChatCompletionStream(messages, llm);

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Streaming API Error:', error);
        return new Response('Error processing stream', { status: 500 });
    }
} 