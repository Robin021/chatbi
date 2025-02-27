import { Sequelize, ColumnsDescription } from 'sequelize';
import { DbConfig, TableSchema } from './type';
import { RecordID } from '../pocketbase/collections/type';
import { tableController } from '../pocketbase/collections/tableController';
import { columnController } from '../pocketbase/collections/columnController';
import { databaseController } from '../pocketbase/collections/databaseController';

export const createConnection = (config: DbConfig): Sequelize => {
    if (config.uri && config.uri.trim() !== '') {
        return new Sequelize(config.uri, {
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        });
    }

    if (!config.details?.username || !config.details?.database || !config.details?.host) {
        throw new Error('Either URI or complete database details are required');
    }

    return new Sequelize(
        config.details.database,
        config.details.username,
        config.details.password,
        {
            host: config.details.host,
            dialect: config.details.dialect,
            port: config.details.port,
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
};

export const getCompleteSchema = async (
  sequelize: Sequelize
): Promise<TableSchema[]> => {
  const tables = await sequelize.getQueryInterface().showAllTables();
  const schema: TableSchema[] = [];

  for (const table of tables) {
    const columns = await sequelize.getQueryInterface().describeTable(table) as ColumnsDescription;

    schema.push({
      tableName: table,
      columns: Object.entries(columns).map(([name, details]) => ({
        name,
        type: details.type,
        allowNull: details.allowNull,
        defaultValue: details.defaultValue,
        primaryKey: details.primaryKey,
        autoIncrement: !!details.autoIncrement,
        comment: details.comment,
        references: 'references' in details && details.references 
          ? {
              model: (details.references as { model: string, key: string }).model,
              key: (details.references as { model: string, key: string }).key
            } 
          : undefined
      }))
    });
  }

  return schema;
};

export const testConnection = async (config: DbConfig): Promise<boolean> => {
  const sequelize = createConnection(config);
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  } finally {
    await sequelize.close();
  }
};

export const executeQuery = async (sequelize: Sequelize, query: string): Promise<any> => {
  try {
    if (!sequelize) {
      throw new Error('Database connection not initialized');
    }

    if (!query || typeof query !== 'string') {
      throw new Error('Invalid query parameter');
    }

    const [result] = await sequelize.query(query );
    return result;
  } catch (error) {
    console.error('Error executing database query:', error);
    throw new Error(
      `Failed to execute query: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const closeConnection = async (sequelize: Sequelize): Promise<void> => {
  await sequelize.close();
};