import { describe, it, expect } from 'vitest';
const { sanitize } = require('../tools/jintrick_to_system.cjs');

describe('jintrick_to_system.cjs sanitization', () => {
  it('should remove HTML comments completely', () => {
    const input = 'Hello<!-- comment -->World';
    expect(sanitize(input)).toBe('HelloWorld');
  });

  it('should remove multi-line HTML comments', () => {
    const input = 'Hello<!-- \n multi \n line \n comment \n -->World';
    expect(sanitize(input)).toBe('HelloWorld');
  });

  it('should collapse 3 or more newlines into 2', () => {
    const input = 'Block 1\n\n\n\nBlock 2';
    // 4 newlines -> 2 newlines (one empty line in between)
    expect(sanitize(input)).toBe('Block 1\n\nBlock 2');
  });

  it('should handle trash newlines left by removed comments', () => {
    const input = 'Line 1\n\n<!-- comment -->\n\nLine 2';
    // Comment removal leaves \n\n\n\n which should be collapsed
    expect(sanitize(input)).toBe('Line 1\n\nLine 2');
  });

  it('should preserve dynamic placeholders like ${SubAgents}', () => {
    const input = 'Agents:\n${SubAgents}';
    expect(sanitize(input)).toBe('Agents:\n${SubAgents}');
  });

  it('should trim leading and trailing whitespace', () => {
    const input = '   \nContent\n   ';
    expect(sanitize(input)).toBe('Content');
  });
});
