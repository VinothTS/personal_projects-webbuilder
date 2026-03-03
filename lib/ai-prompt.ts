import OpenAI from 'openai';

const useOllama = process.env.USE_OLLAMA === 'true';
const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

let client: OpenAI;

if (useOllama) {
  // Use Ollama via OpenAI-compatible API
  client = new OpenAI({
    apiKey: 'ollama', // Ollama doesn't require an API key
    baseURL: `${ollamaUrl}/v1`,
  });
} else {
  // Use OpenAI API
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface PromptResult {
  action: 'add' | 'update' | 'delete';
  productData?: {
    name: string;
    description: string;
    category: 'Rice' | 'Pulses' | 'Tea' | 'Fish Products' | 'Flowers';
    specifications?: Record<string, string>;
  };
  productId?: string;
  imageUrl?: string;
}

export async function processPrompt(prompt: string): Promise<PromptResult> {
  const systemMessage = `You are an AI assistant helping business owners manage their agro export website products.
Parse the user's natural language request and determine:
1. What action they want (add, update, or delete a product)
2. Product details (name, description, category, specifications)
3. Image URL if provided

Categories must be one of: Rice, Pulses, Tea, Fish Products, Flowers

Respond in JSON format:
{
  "action": "add|update|delete",
  "productData": {
    "name": "product name",
    "description": "product description",
    "category": "category",
    "specifications": {"key": "value"}
  },
  "productId": "id if updating/deleting",
  "imageUrl": "url if provided"
}`;

  const modelToUse = useOllama ? ollamaModel : 'gpt-4-turbo-preview';

  const response = await client.chat.completions.create({
    model: modelToUse,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result as PromptResult;
}
