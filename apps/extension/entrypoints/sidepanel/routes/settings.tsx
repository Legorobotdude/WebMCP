import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/entrypoints/sidepanel/components/ui/select';
import { Input } from '@/entrypoints/sidepanel/components/ui/input';
import { Button } from '@/entrypoints/sidepanel/components/ui/button';
import { Label } from '@/entrypoints/sidepanel/components/ui/label';
import {
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  modelConfigCollection,
  ModelConfig,
  modelGetKey,
} from '../lib/modelConfig';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useLiveQuery, eq } from '@tanstack/react-db';

const Settings = () => {
  const navigate = useNavigate();

  const [showOpenai, setShowOpenai] = useState<boolean>(false);
  const [showAnthropic, setShowAnthropic] = useState<boolean>(false);

  const lq = useLiveQuery((q) =>
    q
      .from({ modelConfig: modelConfigCollection })
      .where(({ modelConfig }) => eq(modelConfig.id, '1'))
  );
  const remoteConfig: ModelConfig | undefined = lq?.data?.[0];
  const [localConfig, setLocalConfig] = useState<ModelConfig | null>(null);

  useEffect(() => {
    if (remoteConfig) setLocalConfig(remoteConfig);
  }, [remoteConfig]);

  function save() {
    if (!localConfig) return;
    modelConfigCollection.update(modelGetKey, (draft) => {
      Object.assign(draft, localConfig);
    });
    toast.success('Settings saved successfully!');
  }

  function handleProviderChange(newProvider: 'openai' | 'anthropic') {
    setLocalConfig((c) => (c ? { ...c, modelProvider: newProvider } : c));
  }

  function handleOpenaiModelChange(modelName: string) {
    setLocalConfig((c) => (c ? { ...c, openaiModelName: modelName } : c));
  }

  function handleAnthropicModelChange(modelName: string) {
    setLocalConfig((c) => (c ? { ...c, anthropicModelName: modelName } : c));
  }

  function handleOpenaiKeyChange(apiKey: string) {
    setLocalConfig((c) => (c ? { ...c, openaiApiKey: apiKey || undefined } : c));
  }

  function handleAnthropicKeyChange(apiKey: string) {
    setLocalConfig((c) => (c ? { ...c, anthropicApiKey: apiKey || undefined } : c));
  }

  if (localConfig === null) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Settings</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => navigate({ to: '/chat' })}
          title="Close Settings"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4">
        <Label>Model Provider</Label>
        <Select value={localConfig.modelProvider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {localConfig.modelProvider === 'openai' ? (
        <div>
          <div className="mb-4">
            <Label>OpenAI Model</Label>
            <Select
              value={localConfig.openaiModelName ?? 'gpt-4o'}
              onValueChange={handleOpenaiModelChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {OPENAI_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label>OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                type={showOpenai ? 'text' : 'password'}
                value={localConfig.openaiApiKey ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleOpenaiKeyChange(e.target.value)
                }
                placeholder="sk-..."
              />
              <Button variant="ghost" onClick={() => setShowOpenai((s) => !s)}>
                {showOpenai ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <Label>Anthropic Model</Label>
            <Select
              value={localConfig.anthropicModelName ?? 'claude-sonnet-4-20250514'}
              onValueChange={handleAnthropicModelChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {ANTHROPIC_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label>Anthropic API Key</Label>
            <div className="flex gap-2">
              <Input
                type={showAnthropic ? 'text' : 'password'}
                value={localConfig.anthropicApiKey ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleAnthropicKeyChange(e.target.value)
                }
                placeholder="sk-ant-..."
              />
              <Button variant="ghost" onClick={() => setShowAnthropic((s) => !s)}>
                {showAnthropic ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/settings')({
  component: Settings,
});
