import { Agent } from "./type";
import { aiErrorMessage, ChatMessage, createAIMessage, createAIMessageStream } from "@/components/chat/type";
import { ChatActions, ChatPipelineInput, ChatPipelineInputTypes } from "@/components/chat/chatPipelines/type";
import { parseToolCalls, promptTemplates } from "@/utils/llm/promptTemplates";
import { askLLM, askLLMStream } from "@/utils/llm/api";
import { ChatCompletionMessageParam, Role } from "@/utils/llm/type";
import { Tool } from "@/utils/llm/promptTemplates";

const formatResultPrompt = `
You are a tool call summarize AI Module.
Present the tool results in a natural, readable way:

Create a clear markdown message that:
- Flows naturally like a conversation
- Summarize information give a concise but complete answer
- Don't display technical names always use natural language
- Uses basic markdown for emphasis where helpful
- Reads like a helpful summary rather than a technical report
- Don't add any follow up question possibilities like: Feel free to ask if you need more details on any of these!
`;

export const createSimpleToolCallingAgent = (agent: Omit<Agent, 'run'>): Agent => {
    const run = async (
        history: ChatMessage[],
        actions: ChatActions,
        inputData: Partial<Record<ChatPipelineInput, any>>,
        finishedCallback: () => void
    ) => {
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

        const simplePrompt = `  ${agent.systemPrompt}
                                You are a simple tool executor. Your only job is to select and call ONE tool based on the user's request.

                                Rules:
                                1. ONLY respond with a tool call
                                2. If no tool is needed, leave your response empty
                                3. Do not explain or add any other text
                                5. Choose the most appropriate tool for the task`;

        const messages: ChatCompletionMessageParam[] = [
            { role: "system", content: promptTemplates.toolCall(simplePrompt, tools, {...inputData, fetchedDataList: actions.getFetchedDataList()} ) },
            ...history.map(msg => ({
                role: (msg.sender === "user" ? "user" : "assistant") as Role,
                content: msg.sender === 'pipeline' ? JSON.stringify(msg.historyData) : msg.historyData as string
            }))
        ];

        const response = await askLLM( messages, agent.llm);

        try {
            const { tools: usedTools } = parseToolCalls(response);
            if (usedTools.length > 0) {
                const pipelineToRun = agent.pipelines.find(p => p.name === usedTools[0].name);
                if (pipelineToRun) {
                    const result = await pipelineToRun.run(actions, usedTools[0].parameters, agent);

                    // Format the tool result for better readability
                    const formatMessages: ChatCompletionMessageParam[] = [
                        { role: "system", content: formatResultPrompt },
                        { role: "user", content: JSON.stringify(result.historyData, null, 2) }
                    ];

                    const formattedResult = await askLLMStream( messages, agent.llm);

                    const formatMessageId = actions.getNextMessageId()

                    const updateHistoryContentCallback = (content: string) => {

                        actions.updateMessage({id: formatMessageId, historyData: content})

                    }

                    actions.addMessage({
                        id: formatMessageId,
                        content: createAIMessageStream(formattedResult, updateHistoryContentCallback),
                        sender: "ai",
                        timestamp: new Date(),
                        historyData: ''
                    });
                }
            } else {

                actions.addMessage({
                    id: actions.getNextMessageId(),
                    content: createAIMessage("The agent decided your query doesn't need any action, please try again with a different one!"),
                    sender: "ai",
                    timestamp: new Date(),
                    historyData: "No action needed"
                });

            }
        } catch (error) {
            actions.addMessage({
                id: actions.getNextMessageId(),
                content: aiErrorMessage("Invalid tool call, please try again with a different query!"),
                sender: "ai",
                timestamp: new Date(),
                historyData: "Invalid tool call, please try again with a different query!"
            });
        }


        finishedCallback();
    };

    return {
        ...agent,
        run
    };
}; 

