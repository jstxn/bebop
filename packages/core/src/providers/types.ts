export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string | ContentBlock[];
}

export interface ContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  text?: string;
  toolUse?: {
    id: string;
    name: string;
    input: Record<string, unknown>;
  };
  toolResult?: {
    toolUseId: string;
    content: string;
    isError?: boolean;
  };
}

export interface ChatOptions {
  model: string;
  maxTokens?: number;
  temperature?: number;
  tools?: Tool[];
  systemPrompt?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  maxTokens: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
}

export interface Chunk {
  type: 'content' | 'tool_call' | 'tool_call_done';
  content?: string;
  toolCall?: {
    id: string;
    name: string;
    input: Record<string, unknown>;
  };
  toolCallDone?: boolean;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  execute?(input: unknown): Promise<ToolResult>;
  apply?(input: unknown): Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  description?: string;
  enum?: string[];
}

export interface LLMProvider {
  name: string;
  chat(messages: Message[], options: ChatOptions): AsyncIterable<Chunk>;
  countTokens(text: string): number;
  models: ModelInfo[];
}

export interface Cost {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}
