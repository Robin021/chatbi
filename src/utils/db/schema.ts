import { tableController } from '@/utils/pocketbase/collections/tableController';
import { RecordID } from '@/utils/pocketbase/collections/type';
import { columnController } from '@/utils/pocketbase/collections/columnController';
import { TableNodeData, TableSchema } from '@/utils/db/type';
import {FetchSchemaResponse} from '@/app/api/data/sources/db/type';

export const saveSchema = async (schema: TableSchema[], databaseId: RecordID): Promise<void> => {


    try {
      // Delete existing tables for this database
      const existingTables = await tableController.list(databaseId);
  
      await Promise.all(
        existingTables.map(table => 
          tableController.delete(table.id)
        )
      );
  
      // Save tables and columns
      for (const tableSchema of schema) {
        // Create table record
        const tableRecord = await tableController.create({
          database: databaseId,
          tableName: tableSchema.tableName
        });
  
        // Create column records for each column in the table
        const columnPromises = tableSchema.columns.map(column => 
          columnController.create({
            ...column,
            table: tableRecord.id
          })
        );
  
        await Promise.all(columnPromises);
      }
    } catch (error) {
      console.error('Failed to save schema:', error);
      throw new Error(
        `Failed to save database schema: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

export const saveNodeSchema = async (schema: TableNodeData[], databaseId: RecordID): Promise<void> => {
    await Promise.all(schema.map(table => tableController.update(table.id, { ...table, database: databaseId })));
}

export const deleteSchema = async (databaseId: RecordID): Promise<void> => {
    const tables = await tableController.list(databaseId);
    await Promise.all(tables.map(table => tableController.delete(table.id)));
}

export const fetchSchema = async (databaseId: RecordID): Promise<TableSchema[]> => {
    const tables = await tableController.list(databaseId);
   
    const schema: TableSchema[] = [];

    for (const table of tables) {
        const columns = await columnController.list(table.id);
        schema.push({
            tableName: table.tableName,
            columns: columns
        });
    }

    return schema;
}


export const fetchSchemaNodes = async (databaseId: RecordID): Promise<TableNodeData[]> => {
    const tables = await tableController.list(databaseId);
   
    const schema: TableNodeData[] = [];

    for (const table of tables) {
        const columns = await columnController.list(table.id);
        schema.push({
            tableName: table.tableName,
            columns: columns,
            nodeX: table.nodeX || 0,
            nodeY: table.nodeY || 0,
            id: table.id
        });
    }

    return schema;
}