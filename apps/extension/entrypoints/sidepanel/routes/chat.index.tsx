import { Thread } from '@/entrypoints/sidepanel/components/assistant-ui/thread';
import { ThreadList } from '@/entrypoints/sidepanel/components/assistant-ui/thread-list';
import { ToolSelector } from '@/entrypoints/sidepanel/components/tool-selector';
import { Button } from '@/entrypoints/sidepanel/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/entrypoints/sidepanel/components/ui/tooltip';
import { AssistantRuntimeProvider, useAssistantRuntime } from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { McpClientProvider } from '@mcp-b/mcp-react-hooks';
import { createFileRoute } from '@tanstack/react-router';
import {
  BrainCircuitIcon,
  ChevronRightIcon,
  HelpCircleIcon,
  MenuIcon,
  PlusIcon,
  Settings2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
// import { AssistantChatTransport } from '../components/assistant-ui/AssistantChatTransport';
import { client, transport } from '../lib/client';

// Inner component that has access to the runtime context
const ChatContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isToolSelectorOpen, setIsToolSelectorOpen] = useState(false);
  const assistantRuntime = useAssistantRuntime();

  // Handle new chat creation
  const handleNewChat = () => {
    // Use the proper Assistant UI API to create a new thread
    assistantRuntime.switchToNewThread();
  };

  // Allow other components to open the tool selector via a window event
  useEffect(() => {
    const handler = () => setIsToolSelectorOpen(true);
    window.addEventListener('open-tool-selector', handler as EventListener);
    return () => window.removeEventListener('open-tool-selector', handler as EventListener);
  }, []);

  return (
    <TooltipProvider>
      <McpClientProvider client={client} transport={transport} opts={{}}>
        {isToolSelectorOpen ? (
          // Tool selector view
          <ToolSelector onClose={() => setIsToolSelectorOpen(false)} />
        ) : isSidebarOpen ? (
          // Thread list takes over entire sidepanel
          <div className="h-full bg-background flex flex-col">
            <div className="flex-1 overflow-hidden">
              <div className="p-4 overflow-y-auto h-full">
                <ThreadList onThreadSelect={() => setIsSidebarOpen(false)} />
              </div>
            </div>
            {/* Bottom bar aligned with toolbar */}
            <div className="toolbar-surface">
              <div className="toolbar-inner">
                <h2 className="font-semibold text-sm">Threads</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 flex items-center gap-2 hover:bg-primary/10 transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="text-xs font-medium">Back to Chat</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Chat view with toolbar
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <Thread />
            </div>
            {/* Enhanced Toolbar */}
            <div className="toolbar-surface">
              <div className="toolbar-inner">
                <div className="toolbar-group">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="btn-toolbar-primary"
                        onClick={() => setIsSidebarOpen(true)}
                      >
                        <MenuIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">Threads</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View all threads</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="btn-toolbar-icon-primary"
                        onClick={handleNewChat}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New chat</TooltipContent>
                  </Tooltip>

                  <div className="w-px h-6 bg-border/50 mx-1" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="btn-toolbar-icon-primary"
                        onClick={() => setIsToolSelectorOpen(true)}
                      >
                        <BrainCircuitIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Select tools</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 hover:bg-primary/10 transition-colors"
                        disabled
                      >
                        <Settings2Icon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings (Coming soon)</TooltipContent>
                  </Tooltip>
                </div>

                <div className="toolbar-group">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="btn-toolbar-icon-secondary"
                        disabled
                      >
                        <HelpCircleIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Help (Coming soon)</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        )}
      </McpClientProvider>
    </TooltipProvider>
  );
};

// Main component that provides the runtime
const Chat = () => {
  // Example 1: Custom API URL while keeping system/tools forwarding
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: 'http://localhost:8787/api/chat', // Custom API URL with forwarding
    }),
    sendAutomaticallyWhen: (messages) => lastAssistantMessageIsCompleteWithToolCalls(messages),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatContent />
    </AssistantRuntimeProvider>
  );
};

export const Route = createFileRoute('/chat/')({
  component: Chat,
});
