import { DatabaseOutlined, FileExcelOutlined } from '@ant-design/icons';
import { DataSource, DataSourceConfig, DatabaseDataSource, CSVDataSource } from './type';
import { databaseController } from "@/utils/pocketbase/collections/databaseController";
import { csvController } from "@/utils/pocketbase/collections/csvController";

export * from './type';

export const dataSourceTypes: DataSourceConfig<DataSource>[] = [
  {
    type: 'database',
    icon: DatabaseOutlined,
    tagColor: 'blue',
    getDisplayInfo: (data: DatabaseDataSource) => ({
      title: data.name ?? 'Unnamed Database',
      subtitle: data.details?.database || data.uri || 'No database specified'
    }),
    list: async (dataSetId: string) => {
      const records = await databaseController.list(dataSetId);
      return records.map((record): DatabaseDataSource => ({
        ...record,
        type: 'database',
      }));
    }
  },
  {
    type: 'csv',
    icon: FileExcelOutlined,
    tagColor: 'green',
    getDisplayInfo: (data: CSVDataSource) => ({
      title: data.name,
      subtitle: ""
    }),
    list: async (dataSetId: string) => {
      const records = await csvController.list(dataSetId);
      return records.map((record): CSVDataSource => ({
        ...record,
        type: 'csv',
      }));
    }
  }
]; 