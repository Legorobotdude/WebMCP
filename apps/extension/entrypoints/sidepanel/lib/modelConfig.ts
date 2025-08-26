import { Collection, createCollection } from '@tanstack/db';
import { localStorageCollectionOptions } from '@tanstack/react-db';

export type ModelConfig = {
  id: string;
  modelProvider: 'openai' | 'anthropic';
  openaiModelName?: OpenAIModelNames;
  openaiApiKey?: string;
  anthropicModelName?: AnthropicModelNames;
  anthropicApiKey?: string;
};

// Available OpenAI models for the UI dropdown
export const OPENAI_MODELS = [
  'gpt-5',
  'gpt-5-2025-08-07',
  'gpt-5-mini',
  'gpt-5-mini-2025-08-07',
  'gpt-5-nano',
  'gpt-5-nano-2025-08-07',
  'gpt-5-chat-latest',
  'gpt-4.1',
  'gpt-4.1-2025-04-14',
  'gpt-4.1-mini',
  'gpt-4.1-mini-2025-04-14',
  'gpt-4.1-nano',
  'gpt-4.1-nano-2025-04-14',
  'gpt-4o',
  'gpt-4o-2024-11-20',
  'gpt-4o-mini',
  'gpt-4o-mini-2024-07-18',
  'gpt-4-turbo',
  'gpt-4-turbo-2024-04-09',
  'gpt-4',
  'chatgpt-4o-latest',
] as const;

type OpenAIModelNames = (typeof OPENAI_MODELS)[number] | (string & {});

// Available Anthropic models for the UI dropdown
export const ANTHROPIC_MODELS = [
  'claude-opus-4-20250514',
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-20250219',
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku-latest',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-latest',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
] as const;

type AnthropicModelNames = (typeof ANTHROPIC_MODELS)[number] | (string & {});

const baseDefaults = {
  id: '1',
  modelProvider: 'openai' as 'openai' | 'anthropic',
  openaiModelName: 'gpt-4o-mini',
  openaiApiKey: undefined,
  anthropicModelName: undefined,
  anthropicApiKey: undefined,
};

const envModelConfig: ModelConfig = {
  ...baseDefaults,
  modelProvider: ((): 'openai' | 'anthropic' => {
    const provider = import.meta.env.VITE_MODEL_PROVIDER as string;
    if (provider === 'openai' || provider === 'anthropic') {
      return provider;
    }
    return baseDefaults.modelProvider; // Fallback to default if invalid
  })(),
  openaiModelName:
    (import.meta.env.VITE_OPENAI_MODEL_NAME as string) ?? baseDefaults.openaiModelName,
  openaiApiKey: (import.meta.env.VITE_OPENAI_API_KEY as string) ?? baseDefaults.openaiApiKey,
  anthropicModelName:
    (import.meta.env.VITE_ANTHROPIC_MODEL_NAME as string) ?? baseDefaults.anthropicModelName,
  anthropicApiKey:
    (import.meta.env.VITE_ANTHROPIC_API_KEY as string) ?? baseDefaults.anthropicApiKey,
};

export const defaultModelConfig: ModelConfig = import.meta.env.DEV ? envModelConfig : baseDefaults;

export const modelGetKey: 'singleton:modelConfig' = 'singleton:modelConfig';

export const modelConfigCollection: Collection<ModelConfig> = (() => {
  const c = createCollection<ModelConfig>(
    localStorageCollectionOptions<ModelConfig>({
      id: 'modelConfig',
      storageKey: 'app-model-config',
      getKey: () => modelGetKey,
    })
  );
  if (!c.get(modelGetKey)) {
    c.insert({ ...defaultModelConfig });
  }
  return c;
})();

export function getModelName(config: ModelConfig) {
  if (config.modelProvider === 'openai') {
    return config.openaiModelName;
  }
  return config.anthropicModelName;
}

export function getAPIKey(config: ModelConfig) {
  if (config.modelProvider === 'openai') {
    return config.openaiApiKey;
  }
  return config.anthropicApiKey;
}
