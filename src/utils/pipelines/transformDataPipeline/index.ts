import { emptyFetchedData, FetchedData, generateFetchedDataId } from "@/utils/dataSource/type";
import { promptTemplates } from "@/utils/llm/promptTemplates"
import { llm } from "@/utils/llm"
import { DataTransformActionType, DataTransformAction } from "./type"
import { CSVData } from "@/utils/csv/type"
import { LLMRecord } from "@/utils/pocketbase/collections/type";

const ensureValidJSON = (llmResponse: string): any => {
    try {
        // Try to extract JSON if the response contains additional text
        const jsonMatch = llmResponse.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : llmResponse;
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Failed to parse LLM response:', llmResponse);
        throw new Error('Invalid JSON response from LLM');
    }
};

const parseValue = (value: any): string | number | boolean | Date => {
    // Check if the value is a string
    if (typeof value === 'string') {

        // Handle currency symbols and commas
        const cleanedValue = value.replace(/[^0-9.-]/g, '');

        // Parse the numeric value
        const numericValue = parseFloat(cleanedValue);
        if (!isNaN(numericValue)) {
            return numericValue; // Return numeric value if valid
        }

        // Handle date strings (e.g., "1/2/2024")
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
            return dateValue; // Return Date if valid
        }

        // Return original string if no other type matched
        return value;
    }

    // Handle boolean values directly
    if (typeof value === 'boolean') {
        return value;
    }

    // Handle Date objects directly
    if (value instanceof Date) {
        return value;
    }

    // Return the value as is for other types
    return value;
};

export const DataTransformActions: Record<DataTransformActionType, DataTransformAction> = {
    'remove columns': {
        run: async (FetchedData: FetchedData, query: string, llmRecord: LLMRecord) => {
            const columnsToRemovePrompt = `Given the query "${query}" and the available columns ${FetchedData.data.columns.join(', ')}, 
                list only the column names that should be removed. Return the column names separated by commas.`;
            const columnsToRemoveStr = await llm(columnsToRemovePrompt, llmRecord);
            const columnsToRemove = columnsToRemoveStr.split(',').map(col => col.trim());

            const remainingColumns = FetchedData.data.columns.filter(
                col => !columnsToRemove.includes(col)
            );

            const newRows = FetchedData.data.rows.map(row => {
                const newRow = {};
                remainingColumns.forEach(col => {
                    newRow[col] = row[col];
                });
                return newRow;
            });

            return {
                ...FetchedData,
                data: { rows: newRows, columns: remainingColumns }
            };
        }
    },

    'remove duplicates': {
        run: async (fetchedData: FetchedData, query: string, llmRecord: LLMRecord) => {
            const columnsPrompt = `Given the query "${query}" and the available columns ${fetchedData.data.columns.join(', ')}, 
                list only the column names that should be used to identify duplicates. Return the column names separated by commas.`;
            const columnsStr = await llm(columnsPrompt, llmRecord);
            const columns = columnsStr.split(',').map(col => col.trim());

            const seen = new Set();
            const newRows = fetchedData.data.rows.filter(row => {
                const key = columns.map(col => row[col]).join('|');
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            return {
                ...fetchedData,
                data: { rows: newRows, columns: fetchedData.data.columns }
            };
        }
    },

    'group by': {
        run: async (fetchedData: FetchedData, query: string, llmRecord: LLMRecord) => {
            const groupingPrompt = `Return ONLY a JSON object (no additional text) with:
                1. groupBy: array of column names to group by
                2. aggregations: array of objects with {column: string, function: "sum"|"avg"|"count"|"min"|"max"}
                Use these columns: ${fetchedData.data.columns.join(', ')}
                Format: {"groupBy":["category"],"aggregations":[{"column":"sales","function":"sum"}]}
                Query: ${query}`;
            
            const groupingConfig = ensureValidJSON(await llm(groupingPrompt, llmRecord));

            const grouped = new Map();
            fetchedData.data.rows.forEach(row => {
                const groupKey = groupingConfig.groupBy.map(col => parseValue(row[col])).join('|');
                if (!grouped.has(groupKey)) {
                    grouped.set(groupKey, {
                        group: Object.fromEntries(groupingConfig.groupBy.map(col => [col, parseValue(row[col])])),
                        rows: []
                    });
                }
                grouped.get(groupKey).rows.push(row);
            });

            const newRows = Array.from(grouped.values()).map(({ group, rows }) => {
                const aggregated = { ...group };
                groupingConfig.aggregations.forEach(agg => {
                    const values = rows.map(r => parseValue(r[agg.column])).filter(n => !isNaN(n));
                    switch (agg.function) {
                        case 'sum':
                            aggregated[`${agg.column}_sum`] = values.reduce((a, b) => a + b, 0);
                            break;
                        case 'avg':
                            aggregated[`${agg.column}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
                            break;
                        case 'count':
                            aggregated[`${agg.column}_count`] = values.length;
                            break;
                        case 'min':
                            aggregated[`${agg.column}_min`] = Math.min(...values);
                            break;
                        case 'max':
                            aggregated[`${agg.column}_max`] = Math.max(...values);
                            break;
                    }
                });
                return aggregated;
            });

            const newColumns = Object.keys(newRows[0] || {});
            return {
                ...fetchedData,
                data: { rows: newRows, columns: newColumns }
            };
        }
    },

    'sort by': {
        run: async (fetchedData: FetchedData, query: string, llmRecord: LLMRecord) => {
            const sortingPrompt = `Return ONLY a JSON array (no additional text) of objects with {column: string, direction: "asc"|"desc"}
                Use these columns: ${fetchedData.data.columns.join(', ')}
                Format: [{"column":"age","direction":"desc"}]
                Query: ${query}`;
            
            const sortingConfig = ensureValidJSON(await llm(sortingPrompt, llmRecord));

            const newRows = [...fetchedData.data.rows].sort((a, b) => {
                for (const sort of sortingConfig) {
                    const aVal = parseValue(a[sort.column]);
                    const bVal = parseValue(b[sort.column]);

                    if (aVal === bVal) continue;
                    
                    const comparison = (aVal < bVal ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
                    if (comparison !== 0) return comparison;
                }
                return 0;
            });

            return {
                ...fetchedData,
                data: { rows: newRows, columns: fetchedData.data.columns }
            };
        }
    },

    'filter': {
        run: async (fetchedData: FetchedData, query: string, llmRecord: LLMRecord) => {
            const filterPrompt = `Return ONLY a JSON array (no additional text) of filter conditions with {column: string, operator: "equals"|"contains"|"greater"|"less"|"between", value: any, value2?: any}
                Use these columns: ${fetchedData.data.columns.join(', ')}
                Format: [{"column":"age","operator":"greater","value":25}]
                Query: ${query}
                Note: "greater" means the data value must be > the filter value, and "less" means the data value must be < the filter value.`;
            
            const filterConfig = ensureValidJSON(await llm(filterPrompt, llmRecord));
            

            const newRows = fetchedData.data.rows.filter(row => {
                return filterConfig.every(filter => {
                    const value = row[filter.column];

                    switch (filter.operator) {
                        case 'equals':
                            return parseValue(value) === filter.value;
                        case 'contains':
                            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                        case 'less':
                            return parseValue(value) < parseValue(filter.value);
                        case 'greater':
                            return parseValue(value) > parseValue(filter.value);
                        case 'between':
                            return parseValue(value) >= parseValue(filter.value) && parseValue(value) <= parseValue(filter.value2);
                        default:
                            return true;
                    }
                });
            });

            return {
                ...fetchedData,
                data: { rows: newRows, columns: fetchedData.data.columns }
            };
        }
    },
    'invalid': {
        run(dataSourceData, query) {
            return Promise.resolve(emptyFetchedData)
        },
    }

}

const chooseAction = async (query: string, llmRecord: LLMRecord): Promise<DataTransformActionType> => {
    const prompt = promptTemplates.chooseAction(query)
    const actionResponse = await llm(prompt, llmRecord)

    try {
        const filteredAction = Object.keys(DataTransformActions).find(
            validAction => validAction.toLowerCase() === actionResponse.trim().toLowerCase()
        ) as DataTransformActionType

        if (!filteredAction) {
            throw new Error('No valid action found')
        }
        return filteredAction
    } catch (error) {
        console.error(error)
        throw new Error('No valid action found')
    }
}

const executeAction = async (actionType: DataTransformActionType, fetchedData: FetchedData, query: string, llmRecord: LLMRecord) => {
    const action = DataTransformActions[actionType]
    const newFetchedData = await action.run(fetchedData, query, llmRecord)
    newFetchedData.currentLoadedRows = newFetchedData.data.rows.length
    newFetchedData.dataName = newFetchedData.dataName
    newFetchedData.totalRowsAvailable = newFetchedData.currentLoadedRows
    newFetchedData.metadata = 'transformed data'
    newFetchedData.type = 'transformed'
    return newFetchedData
}

export const Pipeline = {
    chooseAction,
    executeAction
}