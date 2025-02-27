import { getPocketBaseClient } from '@/utils/pocketbase';
import { ColumnRecord, RecordID } from '@/utils/pocketbase/collections/type';

const COLLECTION_NAME = 'column';
const pb = getPocketBaseClient();

const createColumn = async (data: Omit<ColumnRecord, 'id'>): Promise<ColumnRecord> => {
  try {
    
    return await pb.collection(COLLECTION_NAME).create(data);
  } catch (error) {
    console.error('Failed to create column:', error);
    throw error;
  }
};

const getColumnById = async (id: RecordID): Promise<ColumnRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).getOne(id);
  } catch (error) {
    console.error('Failed to get column:', error);
    throw error;
  }
};

const listColumns = async (tableFilter: RecordID): Promise<ColumnRecord[]> => {
  try {
    return await pb.collection(COLLECTION_NAME).getFullList({
      filter: `table = "${tableFilter}"`
    });
  } catch (error) {
    console.error('Failed to list columns:', error);
    throw error;
  }
};

const updateColumn = async (id: RecordID, data: Omit<ColumnRecord, 'id'>): Promise<ColumnRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).update(id, data);
  } catch (error) {
    console.error('Failed to update column:', error);
    throw error;
  }
};

const deleteColumn = async (id: RecordID): Promise<boolean> => {
  try {
    await pb.collection(COLLECTION_NAME).delete(id);
    return true;
  } catch (error) {
    console.error('Failed to delete column:', error);
    throw error;
  }
};

export const columnController = {
  create: createColumn,
  getById: getColumnById,
  list: listColumns,
  update: updateColumn,
  delete: deleteColumn
};
