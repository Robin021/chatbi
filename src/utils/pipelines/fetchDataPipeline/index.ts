import { DataSetRecord, LLMRecord } from "@/utils/pocketbase/collections/type";
import { PipelineData } from "./type"
import { DataFetchingConfig, DataSource, FetchedData, dataSourceTypes } from "@/utils/dataSource";
import {llm} from "@/utils/llm"
import { dataControllers } from "@/utils/dataSource/dataControllers";

const getRelevantDataSources = async (dataSet: DataSetRecord, query: string, llmRecord: LLMRecord) => {
   
    const dataSources = (await Promise.all(dataSourceTypes.map(config => config.list(dataSet.id)))).flat();

    const prompt = `
    You are a data expert tasked with selecting all necessary data sources to fully answer a user's query.

    Available data sources and their descriptions:
    ${dataSources.map(source => `ID: ${source.id}: Name: ${source.name}; ${source.description}`).join('\n    ')}

    User query: "${query}"

    Analyze each data source and evaluate if it contains information needed to answer the query. Consider:
    - What specific data points from each source are needed to fully answer the query
    - How the data sources might need to be combined to provide a complete answer
    - The quality and reliability of each data source
    - Whether excluding any relevant source would lead to an incomplete or inaccurate answer
    - Only output a data source if you are sure it relevant.

    Return ALL necessary data sources in valid JSON format:
    {
        "dataSources": ["source_id_1", "source_id_2", ...], // Array of source IDs for ALL sources needed to answer the query
        "reasoning": "Detailed explanation of why these sources are needed and how they will be used together"
    }

    Important: Include ALL data sources required for a complete and accurate answer, regardless of number.
`

    const relevantDataSourcesResponse = await llm(prompt, llmRecord);

    const fixedRelevantDataSourcesResponse = relevantDataSourcesResponse.replace(/```json/g, '').replace(/```/g, '');

    try {
        const parsedResponse = JSON.parse(fixedRelevantDataSourcesResponse);
        const relevantSourceIds = parsedResponse.dataSources;
        
        // Filter the original dataSources array to only include the relevant ones
        const relevantSources = dataSources.filter(source => 
            relevantSourceIds.includes(source.id)
        );

        return relevantSources;
    } catch (error) {
        console.error('Failed to parse LLM response:', error);
        // Return empty array if parsing fails
        return [];
    }
}

export const fetchData = async (dataSources: DataSource[], query: string, config: DataFetchingConfig, llm: LLMRecord) => {
    const results: FetchedData[] = [];

    for (const dataSource of dataSources) {
        const controller = dataControllers[dataSource.type];

        if (!controller) {
            throw new Error(`No controller found for data source type: ${dataSource.type}`);
        }       

        const sourceData = await controller.queryData(query, dataSource, config, llm);

        results.push(sourceData);
    }

    return results;
}

export const Pipeline = {
    getRelevantDataSources,
    fetchData
}