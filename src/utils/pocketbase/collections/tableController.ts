import { getPocketBaseClient } from '@/utils/pocketbase';
import { TableRecord } from '@/utils/pocketbase/collections/type';

import { RecordID } from '@/utils/pocketbase/collections/type';

const COLLECTION_NAME = 'table';
const pb = getPocketBaseClient();

 const createTable = async (data: Omit<TableRecord, 'id'>): Promise<TableRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).create(data);
  } catch (error) {
    console.error('Failed to create table:', error);
    throw error;
  }
};

 const getTableById = async (id: RecordID): Promise<TableRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).getOne(id);
  } catch (error) {
    console.error('Failed to get table:', error);
    throw error;
  }
};

 const listTables = async (databaseFilter: RecordID): Promise<TableRecord[]> => {
  try {
    return await pb.collection(COLLECTION_NAME).getFullList({
      filter: `database = "${databaseFilter}"`
    });
  } catch (error) {
    console.error('Failed to list tables:', error);
    throw error;
  }
};

 const updateTable = async (id: RecordID, data: Omit<TableRecord, 'id'>): Promise<TableRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).update(id, data);
  } catch (error) {
    console.error('Failed to update table:', error);
    throw error;
  }
};

 const deleteTable = async (id: RecordID): Promise<boolean> => {
  try {
    await pb.collection(COLLECTION_NAME).delete(id);
    return true;
  } catch (error) {
    console.error('Failed to delete table:', error);
    throw error;
  }
};

export const tableController = {
  create: createTable,
  getById: getTableById,
  list: listTables,
  update: updateTable,
  delete: deleteTable
};
