import { getPocketBaseClient } from '@/utils/pocketbase';
import { LLMRecord, RecordID } from '@/utils/pocketbase/collections/type';

const COLLECTION_NAME = 'llm';
const pb = getPocketBaseClient();

const createLLM = async (data: Omit<LLMRecord, 'id'>): Promise<LLMRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).create(data);
  } catch (error) {
    console.error('Failed to create LLM:', error);
    throw error;
  }
};

const getLLMById = async (id: RecordID): Promise<LLMRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).getOne(id);
  } catch (error) {
    console.error('Failed to get LLM:', error);
    throw error;
  }
};

const listLLMs = async (): Promise<LLMRecord[]> => {
  try {
    return await pb.collection(COLLECTION_NAME).getFullList();
  } catch (error) {
    console.error('Failed to list LLMs:', error);
    throw error;
  }
};

const updateLLM = async (id: RecordID, data: Omit<LLMRecord, 'id'>): Promise<LLMRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).update(id, data);
  } catch (error) {
    console.error('Failed to update LLM:', error);
    throw error;
  }
};

const deleteLLM = async (id: RecordID): Promise<boolean> => {
  try {
    await pb.collection(COLLECTION_NAME).delete(id);
    return true;
  } catch (error) {
    console.error('Failed to delete LLM:', error);
    throw error;
  }
};

export const llmController = {
  create: createLLM,
  getById: getLLMById,
  list: listLLMs,
  update: updateLLM,
  delete: deleteLLM
};
