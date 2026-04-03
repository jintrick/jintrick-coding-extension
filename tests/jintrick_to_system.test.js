import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
const { sanitize, getLatestSourcePath } = require('../tools/jintrick_to_system.cjs');

describe('jintrick_to_system.cjs', () => {
  describe('sanitization', () => {
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

  describe('path resolution', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should resolve the latest version directory', () => {
      const systemPromptsDir = path.resolve(__dirname, '../skills/gemini-cli-expert/references/system_prompts');
      const latestPath = path.join(systemPromptsDir, 'v0.36.0', 'jintrick.md');

      vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
        return true; // Mock that everything exists
      });

      vi.spyOn(fs, 'readdirSync').mockImplementation((dir) => {
        if (dir === systemPromptsDir) {
          return [
            { name: 'v0.35.3', isDirectory: () => true },
            { name: 'v0.36.0', isDirectory: () => true },
            { name: 'v1.0.0', isDirectory: () => false }, // Not a directory
            { name: 'invalid_dir', isDirectory: () => true }
          ];
        }
        return [];
      });

      const result = getLatestSourcePath();
      expect(result).toBe(latestPath);
    });

    it('should handle complex version sorting correctly', () => {
      const systemPromptsDir = path.resolve(__dirname, '../skills/gemini-cli-expert/references/system_prompts');
      const latestPath = path.join(systemPromptsDir, 'v2.0.0', 'jintrick.md');

      vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      vi.spyOn(fs, 'readdirSync').mockReturnValue([
        { name: 'v0.35.3', isDirectory: () => true },
        { name: 'v1.10.0', isDirectory: () => true },
        { name: 'v2.0.0', isDirectory: () => true },
        { name: 'v1.2.0', isDirectory: () => true },
      ]);

      const result = getLatestSourcePath();
      expect(result).toBe(latestPath);
    });
  });
});
