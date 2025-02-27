import { DataTransformActionType } from "../pipelines/transformDataPipeline/type";

export interface Tool {
    name: string;
    description: string;
    parameters?: {
        name: string;
        type: string;
        description: string;
        required?: boolean;
    }[];
}

export interface ToolCall {
    name: string;
    parameters: Record<string, unknown>;
}

export interface ParseError {
    type: 'SYNTAX_ERROR' | 'JSON_PARSE_ERROR' | 'INVALID_FORMAT';
    message: string;
    originalError?: Error;
    toolCallText?: string;
}

export interface ToolFunction {
    name: string;
    execute: (parameters: Record<string, unknown>) => Promise<unknown>;
}

export const promptTemplates = {
    generateDataName: (query: string) => `
        As a data analytics expert, generate a concise 2-3 word business-friendly name based on this analytical query.

        Context:
        Query: ${query}

        Requirements:
        - Keep name between 2-3 words
        - Make it descriptive and meaningful
        - Use standard business terminology
        - Name should reflect the analysis being performed
        - Focus on the metrics or insights being analyzed
        - Avoid technical jargon

        Return only the name, no additional text or explanation.
    `,

    toolCall: (prompt: string, tools: Tool[], additionalData?: Record<string, unknown>) => `
        ${prompt}

        Note: You can call a tool if you need it to complete your task. The tool will be directly called after your response. 

        - Don't do example:
                I've calculated your request. Do you want to visualize it?
                <tool>
                name: Calculate
                parameters: {
                    number1: 5
                    number2: 6
                }
                </tool>
        - Do example:
                I will calculate the result for you:
                <tool>
                    name: Calculate
                    parameters: {
                        number1: 5
                        number2: 6
                    }
                </tool>

        You have access to the following tools to help complete this task:

        ${tools.map(tool => `
        Tool: ${tool.name}
        Purpose: ${tool.description}
        ${tool.parameters ? `Parameters:
        ${tool.parameters.map(param =>
        `- ${param.name} (${param.type}${param.required ? ', required' : ''}): ${param.description}`
        ).join('\n')}`
            : ''}`).join('\n\n')}

        ${additionalData ? `
        Context data:
        ${Object.entries(additionalData).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}
        ` : ''}

        You are only allowed to call one tool.
        Use this format at the end of your response:
        
        <tool>
        name: [tool name]
        parameters: {
            [parameter name]: [parameter value]
        }
        </tool>
        `,

    reactToToolResult: (prompt: string, toolResult: string) => `
        ${prompt}

        A tool has been executed with the following result:
        ${toolResult}

        Please analyze this result and incorporate it into your response. Consider:
        - How this information helps address the user's request
        - What additional insights can be drawn from this data
        - Whether follow-up tool calls are needed
        - How to present the findings in a clear and actionable way
        - What the next steps could be

        Remember to:
        - Maintain a natural conversational tone
        - Focus on insights rather than raw data
        - Be concise but thorough
        - Avoid technical jargon unless necessary

        Proceed with the task, incorporating this new information.
    `,

    chooseAction: (query: string) => `
        You are an expert data analyst. I will provide you with a query.
        Your task is to choose the best action to perform the query
        The action should:
        - Be a valid action from the list of actions: ${Object.keys(DataTransformActionType).join(', ')}
        - Be the best action to solve the query
        - only respond with the exact action name
        - do not include any other text or meta-text

        Query: ${query}
    `,

    generateDatabaseDescription: (tables: string) => `
        You are an expert data analyst. I will provide you with a list of table names from a database.
        Your task is to generate a clear and concise description of what this database contains and its purpose.
        The description should:
        - Be 2-3 sentences long
        - Describe the database's purpose based on the table names: ${tables}
        - State specific use cases and analysis that can be done with this data
        - Be written in a clear, business-friendly way
        - Clearly explain what this database is used for

        Please provide only the description text, with no additional formatting or meta-text.
        Do not use uncertain language like "might", "likely", "could be" - be direct and definitive.
    `,

    generateCsvDescription: (columns: string) => ` 
    You are an expert data analyst. I will provide you with a list of column names from a CSV file.
        Your task is to generate a clear and concise description of what this CSV file contains and its purpose.
        The description should:
        - Be 2-3 sentences long
        - Describe the CSV's purpose based on the column names: ${columns}
        - State specific use cases and analysis that can be done with this data
        - Be written in a clear, business-friendly way
        - Clearly explain what this CSV is used for

        Please provide only the description text, with no additional formatting or meta-text.
        Do not use uncertain language like "might", "likely", "could be" - be direct and definitive.
    `,

    generateAnalysisReportTitle: (query: string, availableColumns: string[]) => `
        You are an expert data analyst tasked with creating a title for a data analysis report. The title should be concise, informative, and reflect the essence of the analysis being performed. 

        Consider the following:
        - The title should clearly indicate the main focus of the analysis based on the provided query.
        - Incorporate key terms from the available columns to highlight the specific data being analyzed.
        - Aim for a title length of 5-10 words to ensure clarity and impact.

        Here is the information you have:
        Query: ${query}
        Available Columns: ${availableColumns.join(', ')}

        Based on this information, generate a suitable title for the data analysis report.
    `,
}

// parsing helper function

// prase Tool Calls stream

export const parseToolCalls = (response: string): { tools: ToolCall[], errors: ParseError[], parsedResponse: string } => {
    const tools: ToolCall[] = [];
    const errors: ParseError[] = [];

    if (!response || typeof response !== 'string') {
        errors.push({
            type: 'INVALID_FORMAT',
            message: 'Response must be a non-empty string',
        });
        return { tools, errors, parsedResponse: response };
    }

    const toolPattern = /<tool>\s*name:\s*([^\n]+)\s*parameters:\s*(\{[\s\S]*?\})\s*<\/tool>/g;
    let match;
    
    while ((match = toolPattern.exec(response)) !== null) {
        const [fullMatch, name, parametersStr] = match;
        
        try {
            // Only fix unquoted property names
            const cleanedStr = parametersStr.replace(/([{,])\s*([a-zA-Z0-9_]+):/g, '$1"$2":');
            const parameters = JSON.parse(cleanedStr);
            tools.push({ name: name.trim(), parameters });
        } catch (error) {
            errors.push({
                type: 'JSON_PARSE_ERROR',
                message: 'Failed to parse tool parameters',
                originalError: error as Error,
                toolCallText: fullMatch
            });
        }
    }

    const parsedResponse = response.replace(/<tool>[\s\S]*?<\/tool>/g, '').trim();
    return { tools, errors, parsedResponse };
}

export const executeToolCalls = async (
    toolCalls: ToolCall[],
    availableFunctions: ToolFunction[]
): Promise<{ results: unknown[], errors: Error[] }> => {
    const results: unknown[] = [];
    const errors: Error[] = [];

    for (const toolCall of toolCalls) {
        try {
            const toolFunction = availableFunctions.find(f => f.name === toolCall.name);

            if (!toolFunction) {
                throw new Error(`Tool "${toolCall.name}" not found`);
            }

            const result = await toolFunction.execute(toolCall.parameters);
            results.push(result);
        } catch (error) {
            errors.push(error instanceof Error ? error : new Error(String(error)));
        }
    }

    return { results, errors };
};


