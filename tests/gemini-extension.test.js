import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('gemini-extension.json Manifest Validation', () => {
  const manifestPath = path.resolve(__dirname, '../gemini-extension.json');
  const schemaPath = path.resolve(__dirname, '../gemini-extension.schema.json');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  it('should have all required fields', () => {
    schema.required.forEach(field => {
      expect(manifest).toHaveProperty(field);
    });
  });

  it('should match the name pattern', () => {
    const pattern = new RegExp(schema.properties.name.pattern);
    expect(manifest.name).toMatch(pattern);
  });

  it('should match the version pattern', () => {
    const pattern = new RegExp(schema.properties.version.pattern);
    expect(manifest.version).toMatch(pattern);
  });

  it('should have a valid commands structure if present', () => {
    if (manifest.commands) {
      expect(Array.isArray(manifest.commands)).toBe(true);
      manifest.commands.forEach(cmd => {
        expect(typeof cmd.path).toBe('string');
      });
    }
  });

  it('should have a valid description if present', () => {
    if (manifest.description) {
      expect(typeof manifest.description).toBe('string');
    }
  });
});
