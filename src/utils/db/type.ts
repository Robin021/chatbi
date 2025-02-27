import { RecordID } from '@/utils/pocketbase/collections/type';

export type DbDialect = 'postgres' | 'mysql' | 'sqlite' | 'mssql';

export interface DbConfig {
  uri?: string;
  name: string;
  details?: {
    username: string;
    password: string;
    database: string;
    host: string;
    dialect: DbDialect;
    port: number;
  }
}

export interface TableSchema {
  tableName: string;
  columns: {
    name: string;
    type: string;
    allowNull: boolean;
    defaultValue: any;
    primaryKey: boolean;
    autoIncrement: boolean;
    comment: string | null;
    references?: {
      model: string;
      key: string;
    };
  }[];

}

export type TableNodeData = TableSchema & {
  id: RecordID;
  nodeX: number;
  nodeY: number;

}



