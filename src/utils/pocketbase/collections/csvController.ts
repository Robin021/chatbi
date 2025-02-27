import { getPocketBaseClient } from '@/utils/pocketbase';
import { CSVRecord, RecordID } from '@/utils/pocketbase/collections/type';

const COLLECTION_NAME = 'csv';
const pb = getPocketBaseClient();

const createCSV = async (file: File, name: string, dataSetId: string): Promise<CSVRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).create({
      name: name,
      file: file,
      dataset: dataSetId
    });
  } catch (error) {
    console.error('Failed to create CSV record:', error);
    throw error;
  }
};

const getCSVById = async (id: RecordID): Promise<CSVRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).getOne(id);
  } catch (error) {
    console.error('Failed to get CSV record:', error);
    throw error;
  }
};

const listCSVs = async (dataSetFilter: RecordID): Promise<CSVRecord[]> => {
  try {
    return await pb.collection(COLLECTION_NAME).getFullList({
      filter: `dataset = "${dataSetFilter}"`
    });
  } catch (error) {
    console.error('Failed to list CSV records:', error);
    throw error;
  }
};

const updateCSV = async (id: RecordID, data: Omit<CSVRecord, 'id' | 'file'>, file?: File): Promise<CSVRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).update(id, {
      name: data.name,
      description: data.description,
      contextDesc: data.contextDesc,
      file: file,
      dataset: data.dataset,
      totalAvailableRows: data.totalAvailableRows
    });
  } catch (error) {
    console.error('Failed to update CSV record:', error);
    throw error;
  }
};

const deleteCSV = async (id: RecordID): Promise<boolean> => {
  try {
    await pb.collection(COLLECTION_NAME).delete(id);
    return true;
  } catch (error) {
    console.error('Failed to delete CSV record:', error);
    throw error;
  }
};

const getCSVFile = async (record: CSVRecord): Promise<Blob> => {
  try {
    const token = await pb.files.getToken();
    const url = pb.files.getURL(record, record.file, { token });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch CSV file');
    }
    return await response.blob();
  } catch (error) {
    console.error('Failed to get CSV file:', error);
    throw error;
  }
};

const getCSVFileURL = async (record: CSVRecord): Promise<string> => {
  const token = await pb.files.getToken();
  return pb.files.getURL(record, record.file, { token });
};

export const csvController = {
  create: createCSV,
  getById: getCSVById,
  list: listCSVs,
  update: updateCSV,
  delete: deleteCSV,
  getFile: getCSVFile,
  getFileURL: getCSVFileURL
};
