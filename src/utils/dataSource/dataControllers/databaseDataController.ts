import { DataFetchingConfig, DataSource, FetchedData, DataSourceController, DatabaseDataSource, generateFetchedDataId } from "../type";
import { llm } from "@/utils/llm";
import { createConnection, executeQuery, closeConnection } from "@/utils/db";
import { DbConfig, TableSchema } from "@/utils/db/type";
import { fetchSchema } from "@/utils/db/schema";
import { promptTemplates } from "@/utils/llm/promptTemplates";
import { LLMRecord } from "@/utils/pocketbase/collections/type";

const genSql = async (query: string, dataSource: DatabaseDataSource, config: DataFetchingConfig, llmRecord: LLMRecord) => {

  const dbConfig = dataSource as DbConfig;
  const schema = await fetchSchema(dataSource.id);

  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  async function testSQL(sql: string): Promise<{ success: boolean; error?: string }> {
    let sequelize;
    try {
      sequelize = await createConnection(dbConfig);
      await executeQuery(sequelize, sql);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      if (sequelize) {
        await closeConnection(sequelize);
      }
    }
  }

  async function generateSQL(error?: string, schema?: TableSchema[]): Promise<string> {
    const errorContext = error ? `Previous attempt failed with error: ${error}. Please fix the SQL query and ensure it is compatible with the database schema.` : '';
    
    const sql = await llm(`
      You are an expert SQL developer. Your task is to generate a precise and efficient SQL query.
      
      Natural Language Query:
      ${query}

      Database Schema:
      ${JSON.stringify(schema)}

      Requirements:
      - Generate a valid SQL query that matches the user's intent
      - Use appropriate JOIN conditions based on foreign key relationships
      - Include proper WHERE clauses to filter data as needed
      - Ensure correct table and column names from the schema
      - Follow SQL best practices for readability and performance
      - Handle NULL values appropriately
      - Use aliases for complex queries
      - Add appropriate GROUP BY/ORDER BY clauses if needed
      - Always limit the number of rows returned to 10000

      ${errorContext}

      Return only the raw SQL query without any explanations or markdown formatting.
      The query must be executable on a standard SQL database.
    `, llmRecord);

    const fixed_sql = sql?.replace(/```sql/g, '').replace(/```/g, '');
    return fixed_sql;

  }

  let sql = await generateSQL(query);
  let testResult = await testSQL(sql);

  while (!testResult.success && attempts < MAX_ATTEMPTS) {
    attempts++;
    sql = await generateSQL(testResult.error, schema);
    testResult = await testSQL(sql);
  }

  if (!testResult.success) {
    throw new Error('Failed to generate valid SQL after multiple attempts');
  }

  return sql;

}

export const databaseDataController: DataSourceController<DatabaseDataSource> = {
  
  queryData: async (query: string, dataSource: DatabaseDataSource, config: DataFetchingConfig, llmRecord: LLMRecord) => {


    // gen sql
    const sql = await genSql(query, dataSource, config, llmRecord);

    const sequelize = await createConnection(dataSource);

    //execute sql
    const data = await executeQuery(sequelize, sql);

    const totalRowsAvailable = data.length;
    const currentLoadedRows = Math.min(config.limitRows, totalRowsAvailable);
    const limitedData = data.slice(0, currentLoadedRows);

    // generate data name
    const dataName = await llm(promptTemplates.generateDataName(query), llmRecord);

    // calc as more
    const hasMoreData = data.length > config.limitRows;

     // Handle database data (array format)
    const rows = Array.isArray(limitedData) ? limitedData : [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    //return data
    await closeConnection(sequelize);

    const response: FetchedData = {
      data: {
        rows: rows,
        columns: columns
      },
      type: 'database',
      dataName,
      metadata: {sql},
      dataSource: dataSource,
      id: generateFetchedDataId(),
      totalRowsAvailable,
      currentLoadedRows
    };

    return response;
  },

  fetchMore: async (oldData: FetchedData, newConfig: DataFetchingConfig) => {
    const {sql} = oldData.metadata;
    const sequelize = await createConnection(oldData.dataSource as DatabaseDataSource);
    const data = await executeQuery(sequelize, sql);
    
    const totalRowsAvailable = data.length;
    const currentLoadedRows = Math.min(newConfig.limitRows, totalRowsAvailable);
    const limitedData = data.slice(0, currentLoadedRows);
    const hasMoreData = data.length > currentLoadedRows;

    // Transform data into required format
    const rows = Array.isArray(limitedData) ? limitedData : [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    await closeConnection(sequelize);

    return {
      data: {
        rows: rows,
        columns: columns
      },
      type: 'database',
      dataName: oldData.dataName,
      metadata: {sql},
      dataSource: oldData.dataSource,
      id: oldData.id,
      totalRowsAvailable,
      currentLoadedRows
    };
  }
  
}