import { ChatActions, ChatPipeline, ChatPipelineInput } from "@/components/chat/chatPipelines/type";
import { ChatMessage } from "@/components/chat/type";
import { LLMRecord, RecordID } from "@/utils/pocketbase/collections/type";
import { DataFetchingConfig } from "@/utils/dataSource/type";

export interface Agent {

  name: string;
  pipelines: ChatPipeline[];
  dataFetchingConfig: DataFetchingConfig;
  llm: LLMRecord;
  systemPrompt: string;
  maxLLMRows: number;
  run(history: ChatMessage[], actions: ChatActions, inputData: Partial<Record<ChatPipelineInput, any>>, finishedCallback: () => void);

} 