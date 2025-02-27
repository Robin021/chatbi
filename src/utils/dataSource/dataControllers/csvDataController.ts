import { DataSource, DataSourceController, CSVDataSource, DataFetchingConfig, FetchedData, generateFetchedDataId } from "../type";
import { csvController } from "@/utils/pocketbase/collections/csvController";
import { llm } from "@/utils/llm";
import {CSVProcessor} from "@/utils/csv";
import { promptTemplates } from "@/utils/llm/promptTemplates";
import { fetchMore } from "../api";
import { LLMRecord } from "@/utils/pocketbase/collections/type";


const getRelevantColumns = async (query: string, dataSource: CSVDataSource, llmRecord: LLMRecord) => {
  const file = await csvController.getFile(dataSource);
  const text = await file.text();
  const columns = await CSVProcessor.getColumns(text);
  
  const prompt = `You are a data analysis expert tasked with identifying relevant columns for a data query.

Given the following query and database columns, identify ONLY the columns that are directly relevant to answering the query.

Query: "${query}"

Available columns: ${columns.join(', ')}

Context Description: ${dataSource.contextDesc}

Instructions:
1. Analyze the query carefully to understand what data is being requested
2. Review each column name to determine if it contains information needed for the query
3. Return ONLY the exact column names that are relevant, separated by commas
4. Do not include any explanations or additional text
5. Only return column names that exist in the available columns list
6. If no columns are relevant, return "none"
7. Use the context description to help you identify relevant columns
Example response format:
column1, column2, column3

Your response:`;

  const result = await llm(prompt, llmRecord);
  
  const relevantColumns: string[] = result
    .toLowerCase()
    .split(',')
    .map(col => col.trim())
    .filter(col => 
      col !== '' && 
      col !== 'none' &&
      columns.map(c => c.toLowerCase()).includes(col)
    )
    .map(col => columns.find(c => c.toLowerCase() === col) || col);

  return relevantColumns;
}

export const csvDataController: DataSourceController<CSVDataSource> = {
  queryData: async (query: string, dataSource: CSVDataSource, config: DataFetchingConfig, llmRecord: LLMRecord) => {
   
    // find relevant columns
    const relevantColumns = await getRelevantColumns(query, dataSource, llmRecord);

    // get data
    const fileUrl = await csvController.getFileURL(dataSource);
    
    const csvData = await CSVProcessor.parseWithLimitedColumnsFromFileUrl(fileUrl, config.limitRows, relevantColumns);

    // generate data name
    const dataName = await llm(promptTemplates.generateDataName(query), llmRecord);

    
    const currentLoadedRows = Math.min(config.limitRows, dataSource.totalAvailableRows);

    const response: FetchedData = {
      data: {rows: csvData.rows, columns: csvData.columns},
      type: 'csv',
      dataName,
      metadata: {relevantColumns},
      totalRowsAvailable: dataSource.totalAvailableRows,
      currentLoadedRows,
      dataSource: dataSource,
      id: generateFetchedDataId(),

    }

    // return data
    return response;
  },

  fetchMore: async (oldData: FetchedData, newConfig: DataFetchingConfig) => {
    // find relevant columns
    const {relevantColumns}: {relevantColumns: string[]} = oldData.metadata;
    // get data
    const fileUrl = await csvController.getFileURL(oldData.dataSource as CSVDataSource);
    const csvData = await CSVProcessor.parseWithLimitedColumnsFromFileUrl(fileUrl, newConfig.limitRows, relevantColumns);

    const currentLoadedRows = Math.min(newConfig.limitRows, oldData.totalRowsAvailable);

    const response: FetchedData = {
      data: {rows: csvData.rows, columns: csvData.columns},
      type: 'csv',
      dataName: oldData.dataName,
      totalRowsAvailable: oldData.totalRowsAvailable,
      currentLoadedRows,
      metadata: {relevantColumns},
      dataSource: oldData.dataSource,
      id: oldData.id
    }

    // return data
    return response;


  }
  
}