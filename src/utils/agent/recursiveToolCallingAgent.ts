import { Agent } from "./type";
import { ChatMessage, createAIMessage, createAIMessageStream, createLoadingMessage, PipelineHistoryData } from "@/components/chat/type";
import { ChatActions, ChatPipeline, ChatPipelineInput, ChatPipelineInputTypes } from "@/components/chat/chatPipelines/type";
import { DataSetRecord } from "@/utils/pocketbase/collections/type";
import { executeToolCalls, parseToolCalls, promptTemplates } from "@/utils/llm/promptTemplates";
import { askLLM, askLLMStream } from "@/utils/llm/api";
import { ChatCompletionMessageParam, Role } from "@/utils/llm/type";
import { Tool } from "@/utils/llm/promptTemplates";


export const createRecursiveToolCallingAgent = (agent: Omit<Agent, 'run'>): Agent => {

    const run = async (history: ChatMessage[], actions: ChatActions, inputData: Partial<Record<ChatPipelineInput, any>>, finishedCallback: () => void, iterationCount: number = 0) => {

        const tools: Tool[] = agent.pipelines.map(p => ({
            name: p.name,
            description: p.description,
            parameters: p.requiredInputs.map(input => ({
                name: input,
                type: ChatPipelineInputTypes[input].type,
                description: ChatPipelineInputTypes[input].description,
                required: true,
            })),
        }));

        const systemPrompt = promptTemplates.toolCall(agent.systemPrompt, tools, { ...inputData, fetchedDataList: actions.getFetchedDataListPreview() });
        
        const messages: ChatCompletionMessageParam[] = [
            { role: "system", content: systemPrompt },
            ...history.map(msg => ({
                role: (msg.sender === "user" ? "user" : "assistant") as Role,
                content: msg.sender === 'pipeline' ? JSON.stringify(msg.historyData) : msg.historyData as string
            }))
        ];

        console.log(messages)

        const llmStream = await askLLMStream( messages, agent.llm);

        const messageId = actions.getNextMessageId();

        const callback = async (content: string) => {

            actions.updateMessage({
                id: messageId,
                historyData: content,
            });

            const { tools: usedTools, errors } = parseToolCalls(content);

            if (errors.length > 0) {
                actions.updateMessage({
                    id: messageId,
                    historyData: errors.map(e => e.message).join('\n'),
                });
                return;
            }

            if (usedTools.length > 0) {
                const pipelineToRun = agent.pipelines.find(p => p.name === usedTools[0].name);
                if (pipelineToRun) {
                    const result = await pipelineToRun.run(actions, usedTools[0].parameters, agent);

                    const directResponseMessage: ChatMessage = {
                        id: messageId,
                        content: '',
                        sender: 'ai',
                        timestamp: new Date(),
                        historyData: content
                    }

                    const updatedHistory = [...history, directResponseMessage, result];

                    if (iterationCount > 2) {

                        const reactToToolResultPrompt = promptTemplates.reactToToolResult(agent.systemPrompt, JSON.stringify(result.historyData));
                        const messages: ChatCompletionMessageParam[] = [
                            { role: "system", content: reactToToolResultPrompt },
                            ...updatedHistory.map(msg => ({
                                role: (msg.sender === "user" ? "user" : "assistant") as Role,
                                content: msg.sender === 'pipeline' ? JSON.stringify(msg.historyData) : msg.historyData as string
                            }))
                        ];

                        const response = await askLLMStream(messages, agent.llm);

                        const messageIdSecondResponse = actions.getNextMessageId();

                        const updateHistoryContentCallback = (content: string) => {
                            actions.updateMessage({
                                id: messageIdSecondResponse,
                                historyData: content,
                            });

                            finishedCallback();
                        }

                        actions.addMessage({
                            id: messageIdSecondResponse,
                            content: createAIMessageStream(response, updateHistoryContentCallback, true),
                            sender: 'ai',
                            timestamp: new Date(),
                            historyData: content
                        });
                        return;
                    }

                    // Get the latest messages from the actionn
                    await run(updatedHistory, actions, inputData, finishedCallback, iterationCount + 1);
                    return
                }
            }

            finishedCallback();
        }

        actions.addMessage({
            id: messageId,
            content: createAIMessageStream(llmStream, callback, true),
            sender: "ai",
            timestamp: new Date(),
            historyData: ""
        });


    };

    return {
        ...agent,
        run
    };
};
