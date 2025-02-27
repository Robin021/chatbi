import { getPocketBaseClient, getAuthenticatedUser } from '@/utils/pocketbase';
import { DataSetRecord, RecordID } from '@/utils/pocketbase/collections/type';

const COLLECTION_NAME = 'dataset';
const pb = getPocketBaseClient();

const createDataSet = async (data: Omit<DataSetRecord, 'id' | 'owner'>): Promise<DataSetRecord> => {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const record = {
      ...data,
      owner: user.id
    }

    return await pb.collection(COLLECTION_NAME).create(record);
  } catch (error) {
    console.error('Failed to create data set:', error);
    throw error;
  }
};

const getDataSetById = async (id: RecordID): Promise<DataSetRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).getOne(id);
  } catch (error) {
    console.error('Failed to get data set:', error);
    throw error;
  }
};

const listDataSets = async (): Promise<DataSetRecord[]> => {
  try {
    return await pb.collection(COLLECTION_NAME).getFullList();
  } catch (error) {
    console.error('Failed to list data sets:', error);
    throw error;
  }
};

const updateDataSet = async (id: RecordID, data: Omit<DataSetRecord, 'id'>): Promise<DataSetRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).update(id, data);
  } catch (error) {
    console.error('Failed to update data set:', error);
    throw error;
  }
};

const deleteDataSet = async (id: RecordID): Promise<boolean> => {
  try {
    await pb.collection(COLLECTION_NAME).delete(id);
    return true;
  } catch (error) {
    console.error('Failed to delete data set:', error);
    throw error;
  }
};

export const dataSetController = {
  create: createDataSet,
  getById: getDataSetById,
  list: listDataSets,
  update: updateDataSet,
  delete: deleteDataSet
};
