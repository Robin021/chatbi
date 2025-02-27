import { databaseDataController } from './databaseDataController';
import { csvDataController } from './csvDataController';
import { DataSourceController } from '../type';
import { DataSource } from '../type';

export const dataControllers: { [key: string]: DataSourceController<DataSource> } = {
  database: databaseDataController,
  csv: csvDataController
}