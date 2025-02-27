import { DataSetRecord } from "../pocketbase/collections/type";
import { DataSource, DataFetchingConfig, FetchedData } from "./type";
import { apiRequest } from "@/utils/api";
import { dataSourceTypes } from "./index";

export const fetchMore = async (oldData: FetchedData, newConfig: DataFetchingConfig) => {

    const response = await apiRequest('/api/data/fetchMore', 'POST', {
        oldData,
        newConfig
      });

  return response as FetchedData;
}

export const getDataSetInfo = async (dataset: DataSetRecord): Promise<DataSource[]> => {

  const sources = await Promise.all(dataSourceTypes.map(async (dataSourceType) => {

    const sources = await dataSourceType.list(dataset.id)
    return sources;
  }))

  return sources.flat(1);
    
}