import Anthropic from '@anthropic-ai/sdk';
import type {
  Message,
  ChatOptions,
  Chunk,
  ModelInfo,
  LLMProvider,
  Cost,
} from './types';

const ANTHROPIC_MODELS: ModelInfo[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    maxTokens: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    maxTokens: 200000,
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
  },
  {
    id: 'claude-haiku-4-20250514',
    name: 'Claude Haiku 4',
    maxTokens: 200000,
    inputCostPer1k: 0.0008,
    outputCostPer1k: 0.004,
  },
  {
    id: 'claude-sonnet-3-5-sonnet-20241022',
    name: 'Claude Sonnet 3.5',
    maxTokens: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
  },
  {
    id: 'claude-opus-3-opus-20240229',
    name: 'Claude Opus 3',
    maxTokens: 200000,
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
  },
  {
    id: 'claude-haiku-3-haiku-20240307',
    name: 'Claude Haiku 3',
    maxTokens: 200000,
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
  },
];

export class AnthropicProvider implements LLMProvider {
  public readonly name = 'anthropic';
  public readonly models = ANTHROPIC_MODELS;

  private client: Anthropic;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    this.client = new Anthropic({ apiKey: key });
  }

  async *chat(messages: Message[], options: ChatOptions): AsyncIterable<Chunk> {
    const systemPrompt = options.systemPrompt || '';

    // Convert our Message format to Anthropic's format
    const anthropicMessages: Anthropic.MessageParam[] = messages
      .filter((m) => m.role !== 'system')
      .map((msg) => {
        if (typeof msg.content === 'string') {
          return {
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          };
        } else {
          // Handle content blocks - use type assertion to work with SDK types
          const content = msg.content.map((block): any => {
            if (block.type === 'text') {
              return { type: 'text', text: block.text || '' };
            } else if (block.type === 'tool_use') {
              return {
                type: 'tool_use',
                id: block.toolUse?.id || '',
                name: block.toolUse?.name || '',
                input: block.toolUse?.input || {},
              };
            } else if (block.type === 'tool_result') {
              return {
                type: 'tool_result',
                tool_use_id: block.toolResult?.toolUseId || '',
                content: block.toolResult?.content || '',
                is_error: block.toolResult?.isError || false,
              };
            }
            return { type: 'text', text: '' };
          });
          return {
            role: msg.role === 'user' ? 'user' : 'assistant',
            content,
          };
        }
      });

    // Convert tools to Anthropic format
    const tools: Anthropic.Tool[] = (options.tools || []).map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
    }));

    try {
      const stream = await this.client.messages.stream(
        {
          model: options.model,
          messages: anthropicMessages,
          system: systemPrompt || undefined,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature,
          tools: tools.length > 0 ? tools : undefined,
        },
        {
          signal: AbortSignal.timeout(120000), // 2 minute timeout
        }
      );

      let currentToolCall: { id: string; name: string; input: Record<string, unknown> } | null = null;

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            currentToolCall = {
              id: event.content_block.id,
              name: event.content_block.name,
              input: {},
            };
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            yield {
              type: 'content',
              content: event.delta.text,
            };
          } else if (event.delta.type === 'input_json_delta') {
            if (currentToolCall) {
              const partialJson = event.delta.partial_json || '{}';
              try {
                const parsed = JSON.parse(partialJson);
                currentToolCall.input = { ...currentToolCall.input, ...parsed };
              } catch {
                // Incomplete JSON, wait for more
              }
            }
          }
        } else if (event.type === 'content_block_stop') {
          if (currentToolCall) {
            yield {
              type: 'tool_call',
              toolCall: currentToolCall,
            };
            currentToolCall = null;
          }
        }
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'type' in err && err.type === 'error') {
        const error = err as { type: 'error'; message: string };
        throw new Error(`Anthropic API error: ${error.message}`);
      }
      throw err;
    }
  }

  countTokens(text: string): number {
    // Simple estimation - Anthropic uses a different tokenizer but this gives reasonable approximation
    // For production, would want to use tiktoken or a proper tokenizer
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words * 1.3));
  }

  calculateCost(inputTokens: number, outputTokens: number): Cost {
    const model = this.models.find((m) => m.id === this.getDefaultModel());
    if (!model) {
      throw new Error(`Model not found for cost calculation`);
    }

    const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * model.outputCostPer1k;

    return {
      inputTokens,
      outputTokens,
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }

  private getDefaultModel(): string {
    return 'claude-sonnet-4-20250514';
  }
}

export function createAnthropicProvider(apiKey?: string): AnthropicProvider {
  return new AnthropicProvider(apiKey);
}
