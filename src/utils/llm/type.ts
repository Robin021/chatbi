export type Role = 'system' | 'user' | 'assistant';

export interface Message {
    role: Role;
    content: string;
}

export type ChatCompletionMessageParam = Message;

export interface OpenAIOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    messages: ChatCompletionMessageParam[];
} 