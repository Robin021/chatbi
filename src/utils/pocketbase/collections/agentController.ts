import { getPocketBaseClient } from '@/utils/pocketbase';
import { AgentRecord, RecordID } from '@/utils/pocketbase/collections/type';

const COLLECTION_NAME = 'agent';
const pb = getPocketBaseClient();

const createAgent = async (data: Omit<AgentRecord, 'id'>): Promise<AgentRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).create(data);
  } catch (error) {
    console.error('Failed to create agent:', error);
    throw error;
  }
};

const getAgentById = async (id: RecordID): Promise<AgentRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).getOne(id);
  } catch (error) {
    console.error('Failed to get agent:', error);
    throw error;
  }
};

const listAgents = async (): Promise<AgentRecord[]> => {
  try {
    return await pb.collection(COLLECTION_NAME).getFullList();
  } catch (error) {
    console.error('Failed to list agents:', error);
    throw error;
  }
};

const updateAgent = async (id: RecordID, data: Omit<AgentRecord, 'id'>): Promise<AgentRecord> => {
  try {
    return await pb.collection(COLLECTION_NAME).update(id, data);
  } catch (error) {
    console.error('Failed to update agent:', error);
    throw error;
  }
};

const deleteAgent = async (id: RecordID): Promise<boolean> => {
  try {
    await pb.collection(COLLECTION_NAME).delete(id);
    return true;
  } catch (error) {
    console.error('Failed to delete agent:', error);
    throw error;
  }
};

export const agentController = {
  create: createAgent,
  getById: getAgentById,
  list: listAgents,
  update: updateAgent,
  delete: deleteAgent
};
