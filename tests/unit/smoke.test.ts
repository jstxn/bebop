import { estimateTokens } from '../../src/prompt-compiler';

describe('smoke', () => {
  it('estimates tokens for a simple string', () => {
    const tokens = estimateTokens('hello world');
    expect(tokens).toBeGreaterThan(0);
  });
});
