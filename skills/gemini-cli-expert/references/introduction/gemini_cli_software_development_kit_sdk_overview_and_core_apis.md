---
source_url: https://github.com/google-gemini/gemini-cli/blob/main/packages/sdk/README.md
original_title: README
fetched_at: 2026-03-11T11:00:44.598980+00:00
---

# @google/gemini-cli-sdk

The Gemini CLI SDK provides a programmatic interface to interact with Gemini
models and tools.

## Installation

```bash
npm install @google/gemini-cli-sdk
```

## Usage

```typescript
import { GeminiCliAgent } from '@google/gemini-cli-sdk';

async function main() {
  const agent = new GeminiCliAgent({
    instructions: 'You are a helpful assistant.',
  });

  const controller = new AbortController();
  const signal = controller.signal;

  // Stream responses from the agent
  const stream = agent.sendStream('Why is the sky blue?', signal);

  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      process.stdout.write(chunk.value.text || '');
    }
  }
}

main().catch(console.error);
```
