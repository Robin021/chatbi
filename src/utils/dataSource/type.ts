import { ReactNode } from 'react';
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import { DatabaseRecord, CSVRecord, LLMRecord } from '@/utils/pocketbase/collections/type';
import CryptoJS from 'crypto-js';

export interface DataFetchingConfig {

  limitRows: number;

}

// Specific data source interfaces extending the Record types
export type DatabaseDataSource = DatabaseRecord & {
  type: 'database';
}

export type CSVDataSource = CSVRecord & {
  type: 'csv';
}

// Union type of all data sources
export type DataSource = DatabaseDataSource | CSVDataSource;

// Configuration for each data source type
export interface DataSourceConfig<T extends DataSource> {
  type: T['type'];
  icon: React.ComponentType<AntdIconProps>;
  tagColor: string;
  getDisplayInfo: (data: T) => {
    title: string;
    subtitle: string;
  };
  list: (dataSetId: string) => Promise<T[]>;
}


export const generateFetchedDataId = () => {
  return `data-${Math.random().toString(36).slice(2, 11)}`;
};

export interface FetchedData{

  data: {rows: Record<string, any>[]; columns: string[]};
  type: DataSource['type'] | 'transformed';
  dataName: string;
  totalRowsAvailable: number;
  currentLoadedRows: number;
  metadata: any;
  dataSource: DataSource;
  id: string;

}

export type FetchedDataHash = string

export const calculateFetchedDataHash = (fetchedData: FetchedData): FetchedDataHash => {

  const str = JSON.stringify({
    columns: fetchedData.data.columns,
    type: fetchedData.type,
    metadata: fetchedData.metadata,
    dataSource: fetchedData.dataSource
  });
  
  return CryptoJS.MD5(str).toString();
};

export const emptyFetchedData: FetchedData = {
  data: {rows: [], columns: []},
  type: 'database',
  dataName: '',
  metadata: {},
  totalRowsAvailable: 0,
  currentLoadedRows: 0,
  dataSource: {} as DataSource,
  id: generateFetchedDataId(),
}

export interface DataSourceController<T extends DataSource>{
  queryData: (query: string, dataSource: T, config: DataFetchingConfig, llm: LLMRecord) => Promise<FetchedData>;
  fetchMore: (oldData: FetchedData, newConfig: DataFetchingConfig) => Promise<FetchedData>;
}

// Type guard functions
export const isDatabase = (source: DataSource): source is DatabaseDataSource => 
  source.type === 'database';

export const isCSV = (source: DataSource): source is CSVDataSource => 
  source.type === 'csv';