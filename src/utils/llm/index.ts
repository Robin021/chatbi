import { LLMRecord } from "@/utils/pocketbase/collections/type";
import { ChatCompletionMessageParam, OpenAIOptions } from './type';


export async function askLLM(messages: ChatCompletionMessageParam[], llm: LLMRecord) {
  try {

    console.log('LLM Request: ', llm)

    const body = {
      model: llm.model,
      messages,
      temperature: llm.temperature,
      max_tokens: llm.maxTokens,
    }

    const response = await fetch(`${llm.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llm.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
}

/**
 * Quick helper to send a single message to OpenAI
 */
export async function llm(message: string, llm: LLMRecord) {
  return askLLM([{ role: 'user', content: message }], llm);
}

/**
 * Helper to send a message with a system prompt
 */
export async function llmWithContext(message: string, systemPrompt: string, llm: LLMRecord) {
  return askLLM(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }]
      ,llm
  );
}

/**
 * Helper to send a message with a system prompt and chat history
 */
export async function llmChat(message: string, history: ChatCompletionMessageParam[] = [], llm: LLMRecord) {
  return askLLM(
    [...history, { role: 'user', content: message }], llm
  );
}

/**
 * Send a streaming chat completion request to the API
 */
export async function llmStream(message: string, llm: LLMRecord): Promise<ReadableStream<string>> {
  return client.createChatCompletionStream(
    [{ role: 'user', content: message }], llm
  );
}

// Update client object with streaming capability
export const client = {
  async createChatCompletion(messages: ChatCompletionMessageParam[], llm: LLMRecord) {

    const body = {
      model: llm.model,
      messages,
      temperature: llm.temperature,
      max_tokens: llm.maxTokens,
    }

    const response = await fetch(`${llm.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llm.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
  },

  async createChatCompletionStream(messages: ChatCompletionMessageParam[], llm: LLMRecord): Promise<ReadableStream<string>> {
    try {
      const body = {
        model: llm.model,
        messages,
        temperature: llm.temperature,
        max_tokens: llm.maxTokens,
        stream: true
      }
  
      const response = await fetch(`${llm.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llm.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      return new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk
                .split('\n')
                .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');

              for (const line of lines) {
                if (line.includes('data: ')) {
                  try {
                    const data = JSON.parse(line.replace('data: ', ''));
                    const content = data.choices[0]?.delta?.content || '';
                    if (content) {
                      controller.enqueue(content);
                    }
                  } catch (e) {
                    console.error('Error parsing JSON:', e);
                  }
                }
              }
            }
          } finally {
            controller.close();
            reader.releaseLock();
          }
        },
      });
    } catch (error) {
      console.error('Error in streaming API call:', error);
      throw error;
    }
  }
}; 