import { createContext, useContext, ReactNode, useState } from 'react';
import { DataSetRecord } from '@/utils/pocketbase/collections/type';
import { DataSource } from '@/utils/dataSource/type';
export type CardType = 'DataSet' | 'Database' | 'CSV' | 'DatabaseSchema';

export const moveCardTypeBack = (cardType: CardType) => {
    if (cardType === 'DatabaseSchema') return 'Database';
    if (cardType === 'Database') return 'DataSet';
    if (cardType === 'CSV') return 'DataSet';
    return cardType;
}

// Define the context interface
interface DataPageContextType {
  currentCard: CardType;
  setCurrentCard: (card: CardType) => void;
  selectedDataSet: DataSetRecord | null;
  setSelectedDataSet: (dataSet: DataSetRecord | null) => void;
  selectedDataSource: DataSource | null;
  setSelectedDataSource: (dataSource: DataSource | null) => void;
}

// Create default value for the context
const defaultContextValue: DataPageContextType = {
  selectedDataSet: null,
  currentCard: 'DataSet',
  setSelectedDataSet: () => {
    console.warn('DataPageContext: setSelectedDataSet was called before Provider was initialized');
  },
  setCurrentCard: () => {
    console.warn('DataPageContext: setCurrentCard was called before Provider was initialized');
  },
  selectedDataSource: null,
  setSelectedDataSource: () => {
    console.warn('DataPageContext: setSelectedDataSource was called before Provider was initialized');
  },
};

// Create the context with the default value
const DataPageContext = createContext<DataPageContextType>(defaultContextValue);

interface DataPageProviderProps {
  children: ReactNode;
}

export function DataPageProvider({ children }: DataPageProviderProps) {
  const [selectedDataSet, setSelectedDataSet] = useState<DataSetRecord | null>(null);
  const [currentCard, setCurrentCard] = useState<CardType>('DataSet');
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const value = {
    selectedDataSet,
    currentCard,
    setSelectedDataSet,
    setCurrentCard,
    selectedDataSource,
    setSelectedDataSource,
  };

  return <DataPageContext.Provider value={value}>{children}</DataPageContext.Provider>;
}

// Custom hook to use the context
export function useDataPageContext() {
  const context = useContext(DataPageContext);
  if (context === defaultContextValue) {
    throw new Error('useDataPage must be used within a DataPageProvider');
  }
  return context;
}

export default DataPageContext;
