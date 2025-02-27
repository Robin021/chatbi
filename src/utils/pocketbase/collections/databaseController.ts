import { getPocketBaseClient } from '@/utils/pocketbase';
import { DatabaseRecord, RecordID } from '@/utils/pocketbase/collections/type';

const COLLECTION_NAME = 'database';
const pb = getPocketBaseClient();

 const createDatabase = async (data: Omit<DatabaseRecord, 'id'>): Promise<DatabaseRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).create(data);
  } catch (error) {
    console.error('Failed to create database:', error);
    throw error;
  }
};

 const getDatabaseById = async (id: RecordID): Promise<DatabaseRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).getOne(id);
  } catch (error) {
    console.error('Failed to get database:', error);
    throw error;
  }
};

 const listDatabases = async (dataSetFilter: RecordID): Promise<DatabaseRecord[]> => {
  try {
    return await pb.collection(COLLECTION_NAME).getFullList({
      filter: `dataset = "${dataSetFilter}"`
    });
  } catch (error) {
    console.error('Failed to list databases:', error);
    throw error;
  }
};

 const updateDatabase = async (id: RecordID, data: Omit<DatabaseRecord, 'id'>): Promise<DatabaseRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).update(id, data);
  } catch (error) {
    console.error('Failed to update database:', error);
    throw error;
  }
};

 const deleteDatabase = async (id: RecordID): Promise<boolean> => {
  try {
    await pb.collection(COLLECTION_NAME).delete(id);
    return true;
  } catch (error) {
    console.error('Failed to delete database:', error);
    throw error;
  }
};

export const databaseController = {
  create: createDatabase,
  getById: getDatabaseById,
  list: listDatabases,
  update: updateDatabase,
  delete: deleteDatabase
};