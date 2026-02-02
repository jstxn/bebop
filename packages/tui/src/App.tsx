import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Static } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { AnthropicProvider } from '@bebophq/core';
import type { Message } from '@bebophq/core';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function App(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');

  const provider = useRef<AnthropicProvider | null>(null);
  const [model] = useState('claude-sonnet-4-20250514');
  const [tokens, setTokens] = useState({ input: 0, output: 0 });
  const [cost, setCost] = useState(0);

  useEffect(() => {
    try {
      provider.current = new AnthropicProvider();
    } catch (err) {
      console.error('Failed to initialize provider:', err);
    }
  }, []);

  const handleSubmit = async () => {
    if (!input.trim() || !provider.current) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const inputText = input;
    setInput('');
    setIsThinking(true);
    setCurrentResponse('');

    try {
      const apiMessages: Message[] = [
        { role: 'system', content: 'You are a helpful AI coding assistant.' },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: inputText },
      ];

      let assistantContent = '';
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      for await (const chunk of provider.current.chat(apiMessages, {
        model,
        maxTokens: 4096,
        temperature: 0.7,
      })) {
        if (chunk.type === 'content' && chunk.content) {
          assistantContent += chunk.content || '';
          setCurrentResponse(assistantContent);
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            )
          );
        }
      }

      setIsThinking(false);
      setCurrentResponse('');
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, isStreaming: false } : m
        )
      );

      const inputTokens = provider.current.countTokens(inputText);
      const outputTokens = provider.current.countTokens(assistantContent);
      const costData = provider.current.calculateCost(inputTokens, outputTokens);

      setTokens({ input: inputTokens, output: outputTokens });
      setCost(costData.totalCost);
    } catch (err) {
      setIsThinking(false);
      setCurrentResponse('');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const formatTokens = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Status Bar */}
      <Box borderStyle="single" paddingX={1}>
        <Text color="cyan">{model}</Text>
        <Text> │ </Text>
        <Text color="yellow">
          {formatTokens(tokens.input + tokens.output)}/200k tokens
        </Text>
        <Text> │ </Text>
        <Text color="green">${cost.toFixed(4)} session</Text>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
        {messages.length === 0 ? (
          <Text dimColor>
            Type a message to start. Press Ctrl+C to quit.
          </Text>
        ) : (
          <Static items={messages}>
            {(msg) => (
              <Box key={msg.timestamp.getTime()} marginBottom={1}>
                <Text color={msg.role === 'user' ? 'cyan' : 'blue'} bold>
                  {msg.role === 'user' ? 'You' : 'Assistant'}:
                </Text>
                <Text>{' '}</Text>
                <Text>{msg.content}</Text>
                {msg.isStreaming && <Text color="yellow">_</Text>}
              </Box>
            )}
          </Static>
        )}
      </Box>

      {/* Input */}
      <Box borderStyle="double" paddingX={1} marginTop={-1}>
        {isThinking ? (
          <Box>
            <Text color="yellow">
              <Spinner type="dots" /> Thinking...
            </Text>
          </Box>
        ) : (
          <Box>
            <Text color="cyan">{'> '}</Text>
            <TextInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              placeholder="Type a message..."
            />
          </Box>
        )}
      </Box>

      {/* Help Bar */}
      <Box paddingX={1}>
        <Text dimColor>
          [Ctrl+C] quit  [Ctrl+L] clear  [Enter] send
        </Text>
      </Box>
    </Box>
  );
}
