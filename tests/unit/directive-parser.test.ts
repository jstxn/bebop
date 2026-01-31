import { parseDirectives } from '../../src/directive-parser';

describe('parseDirectives', () => {
  it('parses slash-delimited pack names', () => {
    const parsed = parseDirectives('&use core/security Create user');
    expect(parsed.packs).toEqual(['core/security']);
    expect(parsed.cleanedInput).toBe('Create user');
    expect(parsed.hasDirectives).toBe(true);
  });

  it('parses space-delimited pack names into namespace/name', () => {
    const parsed = parseDirectives('&use core example Create user');
    expect(parsed.packs).toEqual(['core/example']);
    expect(parsed.cleanedInput).toBe('Create user');
  });

  it('does not treat task tokens as packs', () => {
    const parsed = parseDirectives('&use core example create user');
    expect(parsed.packs).toEqual(['core/example']);
    expect(parsed.cleanedInput).toBe('create user');
  });

  it('supports multiple packs and stops at non-pack tokens', () => {
    const parsed = parseDirectives('&use core example core/security Create feature');
    expect(parsed.packs).toEqual(['core/example', 'core/security']);
    expect(parsed.cleanedInput).toBe('Create feature');
  });
});
