import { ChatCompletionMessageParam, OpenAIOptions } from './type';
import { apiRequest, apiRequestStream } from '@/utils/api';
import { LLMRecord } from '@/utils/pocketbase/collections/type';

/**
 * Send a chat completion request to the API
 */
export async function askLLM(messages: ChatCompletionMessageParam[], llm: LLMRecord): Promise<string> {
    const response = await apiRequest('/api/llm', 'POST', {messages, llm});
    return response.content;
}

export async function askLLMStream(messages: ChatCompletionMessageParam[], llm: LLMRecord): Promise<ReadableStream<Uint8Array>> {
    return await apiRequestStream('/api/llm/stream', 'POST', {messages, llm});
}

/**
 * Quick helper to send a single message to OpenAI
 */
export async function llm(message: string, llm: LLMRecord): Promise<string> {
    return askLLM([{ role: 'user', content: message }], llm);
}

/**
 * Helper to send a message with a system prompt
 */
export async function llmWithContext(message: string, systemPrompt: string, llm: LLMRecord): Promise<string> {
    return askLLM(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ], llm);
}

/**
 * Helper to send a message with chat history
 */
export async function llmChat(message: string, history: ChatCompletionMessageParam[] = [], llm: LLMRecord): Promise<string> {
    return askLLM([...history, { role: 'user', content: message }], llm);
}

/**
 * Send a streaming chat completion request to the API
 */
export async function llmStream(message: string, llm: LLMRecord): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch('/api/llm/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [{ role: 'user', content: message }],
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to get streaming response');
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    return response.body;
}