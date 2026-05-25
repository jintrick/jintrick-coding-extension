/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { SandboxPolicyManager } from '../policy/sandboxPolicyManager.js';
import { inspect } from 'node:util';
import process from 'node:process';
import { z } from 'zod';
import type { ConversationRecord } from '../services/chatRecordingService.js';
import type {
  AgentHistoryProviderConfig,
  ContextManagementConfig,
  ToolOutputMaskingConfig,
} from '../context/types.js';
export type { ConversationRecord };
import {
  AuthType,
  createContentGenerator,
  createContentGeneratorConfig,
  type ContentGenerator,
  type ContentGeneratorConfig,
  type VertexAiRoutingConfig,
} from '../core/contentGenerator.js';
import type { OverageStrategy } from '../billing/billing.js';
import { PromptRegistry } from '../prompts/prompt-registry.js';
import { ResourceRegistry } from '../resources/resource-registry.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { LSTool } from '../tools/ls.js';
import { ReadFileTool } from '../tools/read-file.js';
import { ReadMcpResourceTool } from '../tools/read-mcp-resource.js';
import { ListMcpResourcesTool } from '../tools/list-mcp-resources.js';
import { GrepTool } from '../tools/grep.js';
import { RipGrepTool, resolveRipgrepPath } from '../tools/ripGrep.js';
import { GlobTool } from '../tools/glob.js';
import { ActivateSkillTool } from '../tools/activate-skill.js';
import { EditTool } from '../tools/edit.js';
import { ShellTool } from '../tools/shell.js';
import { WriteFileTool } from '../tools/write-file.js';
import { WebFetchTool } from '../tools/web-fetch.js';
import {
  setGeminiMdFilename,
  getCurrentGeminiMdFilename,
} from '../tools/memoryTool.js';
import { WebSearchTool } from '../tools/web-search.js';
import { AskUserTool } from '../tools/ask-user.js';
import { UpdateTopicTool } from '../tools/topicTool.js';
import { TopicState } from './topicState.js';
import { AgentTool } from '../agents/agent-tool.js';
import { ExitPlanModeTool } from '../tools/exit-plan-mode.js';
import { EnterPlanModeTool } from '../tools/enter-plan-mode.js';
import {
  ListBackgroundProcessesTool,
  ReadBackgroundOutputTool,
} from '../tools/shellBackgroundTools.js';
import { GeminiClient } from '../core/client.js';
import { BaseLlmClient } from '../core/baseLlmClient.js';
import { LocalLiteRtLmClient } from '../core/localLiteRtLmClient.js';
import type { HookDefinition, HookEventName } from '../hooks/types.js';
import { FileDiscoveryService } from '../services/fileDiscoveryService.js';
import { GitService } from '../services/gitService.js';
import {
  type SandboxManager,
  NoopSandboxManager,
} from '../services/sandboxManager.js';
import { createSandboxManager } from '../services/sandboxManagerFactory.js';
import { SandboxedFileSystemService } from '../services/sandboxedFileSystemService.js';
import {
  initializeTelemetry,
  DEFAULT_TELEMETRY_TARGET,
  DEFAULT_OTLP_ENDPOINT,
  uiTelemetryService,
  type TelemetryTarget,
} from '../telemetry/index.js';
import { coreEvents, CoreEvent } from '../utils/events.js';
import { tokenLimit } from '../core/tokenLimits.js';
import {
  DEFAULT_GEMINI_EMBEDDING_MODEL,
  DEFAULT_GEMINI_FLASH_MODEL,
  DEFAULT_GEMINI_MODEL_AUTO,
  isAutoModel,
  isPreviewModel,
  isGemini2Model,
  PREVIEW_GEMINI_FLASH_MODEL,
  resolveModel,
} from './models.js';
import { shouldAttemptBrowserLaunch } from '../utils/browser.js';
import type { MCPOAuthConfig } from '../mcp/oauth-provider.js';
import { ideContextStore } from '../ide/ideContext.js';
import { WriteTodosTool } from '../tools/write-todos.js';
import {
  StandardFileSystemService,
  type FileSystemService,
} from '../services/fileSystemService.js';
import {
  TrackerCreateTaskTool,
  TrackerUpdateTaskTool,
  TrackerGetTaskTool,
  TrackerListTasksTool,
  TrackerAddDependencyTool,
  TrackerVisualizeTool,
} from '../tools/trackerTools.js';
import {
  logRipgrepFallback,
  logFlashFallback,
  logApprovalModeSwitch,
  logApprovalModeDuration,
} from '../telemetry/loggers.js';
import {
  RipgrepFallbackEvent,
  FlashFallbackEvent,
  ApprovalModeSwitchEvent,
  ApprovalModeDurationEvent,
} from '../telemetry/types.js';
import type {
  FallbackModelHandler,
  ValidationHandler,
} from '../fallback/types.js';
import { ModelAvailabilityService } from '../availability/modelAvailabilityService.js';
import { ModelRouterService } from '../routing/modelRouterService.js';
import { OutputFormat } from '../output/types.js';
import {
  ModelConfigService,
  type ModelConfig,
  type ModelConfigServiceConfig,
} from '../services/modelConfigService.js';
import { DEFAULT_MODEL_CONFIGS } from './defaultModelConfigs.js';
import { MemoryContextManager } from '../context/memoryContextManager.js';
import { TrackerService } from '../services/trackerService.js';
import type { GenerateContentParameters } from '@google/genai';

// Re-export OAuth config type
export type { MCPOAuthConfig, AnyToolInvocation, AnyDeclarativeTool };
import type { AnyToolInvocation, AnyDeclarativeTool } from '../tools/tools.js';
import { WorkspaceContext } from '../utils/workspaceContext.js';
import {
  getWorkspaceContextOverride,
  hasScopedAutoMemoryExtractionWriteAccess,
  hasScopedMemoryInboxAccess,
} from './scoped-config.js';
import { Storage } from './storage.js';
import type { ShellExecutionConfig } from '../services/shellExecutionService.js';
import { FileExclusions } from '../utils/ignorePatterns.js';
import { MessageBus } from '../confirmation-bus/message-bus.js';
import type { EventEmitter } from 'node:events';
import { PolicyEngine } from '../policy/policy-engine.js';
import {
  ApprovalMode,
  type PolicyEngineConfig,
  type PolicyRule,
  type SafetyCheckerRule,
} from '../policy/types.js';
import { HookSystem } from '../hooks/index.js';
import type {
  UserTierId,
  GeminiUserTier,
  RetrieveUserQuotaResponse,
  AdminControlsSettings,
} from '../code_assist/types.js';
import type { HierarchicalMemory } from './memory.js';
import { getCodeAssistServer } from '../code_assist/codeAssist.js';
import {
  getExperiments,
  type Experiments,
} from '../code_assist/experiments/experiments.js';
import { AgentRegistry } from '../agents/registry.js';
import { AcknowledgedAgentsService } from '../agents/acknowledgedAgents.js';
import { setGlobalProxy, updateGlobalFetchTimeouts } from '../utils/fetch.js';
import { ExperimentFlags } from '../code_assist/experiments/flagNames.js';
import { debugLogger } from '../utils/debugLogger.js';
import { ragLogger } from '../utils/ragLogger.js';
import { SkillManager, type SkillDefinition } from '../skills/skillManager.js';
import { startupProfiler } from '../telemetry/startupProfiler.js';
import type { AgentDefinition } from '../agents/types.js';
import { fetchAdminControls } from '../code_assist/admin/admin_controls.js';
import { isSubpath, resolveToRealPath } from '../utils/paths.js';
import { InjectionService } from './injectionService.js';
import { ExecutionLifecycleService } from '../services/executionLifecycleService.js';
import { WORKSPACE_POLICY_TIER } from '../policy/config.js';
import { loadPoliciesFromToml } from '../policy/toml-loader.js';

import { CheckerRunner } from '../safety/checker-runner.js';
import { ContextBuilder } from '../safety/context-builder.js';
import { CheckerRegistry } from '../safety/registry.js';
import { ConsecaSafetyChecker } from '../safety/conseca/conseca.js';
import type { AgentLoopContext } from './agent-loop-context.js';

export interface AccessibilitySettings {
  /** @deprecated Use ui.statusHints instead. */
  enableLoadingPhrases?: boolean;
  screenReader?: boolean;
}

export interface BugCommandSettings {
  urlTemplate: string;
}

export interface SummarizeToolOutputSettings {
  tokenBudget?: number;
}

export interface PlanSettings {
  enabled?: boolean;
  directory?: string;
  modelRouting?: boolean;
}

export interface TelemetrySettings {
  enabled?: boolean;
  traces?: boolean;
  target?: TelemetryTarget;
  otlpEndpoint?: string;
  otlpProtocol?: 'grpc' | 'http';
  logPrompts?: boolean;
  outfile?: string;
  useCollector?: boolean;
  useCliAuth?: boolean;
}

export interface OutputSettings {
  format?: OutputFormat;
}

export interface GemmaModelRouterSettings {
  enabled?: boolean;
  autoStartServer?: boolean;
  binaryPath?: string;
  classifier?: {
    host?: string;
    model?: string;
  };
}

export interface ADKSettings {
  agentSessionNoninteractiveEnabled?: boolean;
  agentSessionInteractiveEnabled?: boolean;
  agentSessionSubagentEnabled?: boolean;
}

export interface ExtensionSetting {
  name: string;
  description: string;
  envVar: string;
  sensitive?: boolean;
}

export interface ResolvedExtensionSetting {
  name: string;
  envVar: string;
  value?: string;
  sensitive: boolean;
  scope?: 'user' | 'workspace';
  source?: string;
}

export interface TrajectoryProvider {
  /** Prefix used to identify sessions from this provider (e.g., 'ext:') */
  prefix: string;
  /** Optional display name for UI Tabs */
  displayName?: string;
  /** Return an array of conversational tags/ids */
  listSessions(workspaceUri?: string): Promise<
    Array<{
      id: string;
      mtime: string;
      name?: string;
      displayName?: string;
      messageCount?: number;
    }>
  >;
  /** Load a single conversation payload */
  loadSession(id: string): Promise<ConversationRecord | null>;
}

export interface AgentRunConfig {
  maxTimeMinutes?: number;
  maxTurns?: number;
}

/**
 * Override configuration for a specific agent.
 * Generic fields (modelConfig, runConfig, enabled) are standard across all agents.
 */
export interface AgentOverride {
  modelConfig?: ModelConfig;
  runConfig?: AgentRunConfig;
  enabled?: boolean;
  tools?: string[];
  mcpServers?: Record<string, MCPServerConfig>;
}

export interface AgentSettings {
  overrides?: Record<string, AgentOverride>;
  browser?: BrowserAgentCustomConfig;
}

export interface CustomTheme {
  type: 'custom';
  name: string;

  text?: {
    primary?: string;
    secondary?: string;
    link?: string;
    accent?: string;
    response?: string;
  };
  background?: {
    primary?: string;
    diff?: {
      added?: string;
      removed?: string;
    };
  };
  border?: {
    default?: string;
  };
  ui?: {
    comment?: string;
    symbol?: string;
    active?: string;
    focus?: string;
    gradient?: string[];
  };
  status?: {
    error?: string;
    success?: string;
    warning?: string;
  };

  // Legacy properties (all optional)
  Background?: string;
  Foreground?: string;
  LightBlue?: string;
  AccentBlue?: string;
  AccentPurple?: string;
  AccentCyan?: string;
  AccentGreen?: string;
  AccentYellow?: string;
  AccentRed?: string;
  DiffAdded?: string;
  DiffRemoved?: string;
  Comment?: string;
  Gray?: string;
  DarkGray?: string;
  GradientColors?: string[];
}

/**
 * Browser agent custom configuration.
 * Used in agents.browser
 *
 * IMPORTANT: Keep in sync with the browser settings schema in
 * packages/cli/src/config/settingsSchema.ts (agents.browser.properties).
 */
export interface BrowserAgentCustomConfig {
  /**
   * Session mode:
   * - 'persistent': Launch Chrome with a persistent profile at ~/.cache/chrome-devtools-mcp/ (default)
   * - 'isolated': Launch Chrome with a temporary profile, cleaned up after session
   * - 'existing': Attach to an already-running Chrome instance (requires remote debugging
   *   enabled at chrome://inspect/#remote-debugging)
   */
  sessionMode?: 'isolated' | 'persistent' | 'existing';
  /** Run browser in headless mode. Default: false */
  headless?: boolean;
  /** Path to Chrome profile directory for session persistence. */
  profilePath?: string;
  /** Model for the visual agent's analyze_screenshot tool. When set, enables the tool. */
  visualModel?: string;
  /** List of allowed domains for the browser agent (e.g., ["github.com", "*.google.com"]). */
  allowedDomains?: string[];
  /** Disable user input on the browser window during automation. Default: true in non-headless mode */
  disableUserInput?: boolean;
  /** Maximum number of actions (tool calls) allowed per task. Default: 100 */
  maxActionsPerTask?: number;
  /** Whether to confirm sensitive actions (e.g., fill_form, evaluate_script). */
  confirmSensitiveActions?: boolean;
  /** Whether to block file uploads. */
  blockFileUploads?: boolean;
}

/**
 * All information required in CLI to handle an extension. Defined in Core so
 * that the collection of loaded, active, and inactive extensions can be passed
 * around on the config object though Core does not use this information
 * directly.
 */
export interface GeminiCLIExtension {
  name: string;
  version: string;
  isActive: boolean;
  path: string;
  installMetadata?: ExtensionInstallMetadata;
  mcpServers?: Record<string, MCPServerConfig>;
  contextFiles: string[];
  excludeTools?: string[];
  id: string;
  hooks?: { [K in HookEventName]?: HookDefinition[] };
  settings?: ExtensionSetting[];
  resolvedSettings?: ResolvedExtensionSetting[];
  skills?: SkillDefinition[];
  agents?: AgentDefinition[];
  /**
   * Custom themes contributed by this extension.
   * These themes will be registered when the extension is activated.
   */
  themes?: CustomTheme[];
  /**
   * Policy rules contributed by this extension.
   */
  rules?: PolicyRule[];
  /**
   * Safety checkers contributed by this extension.
   */
  checkers?: SafetyCheckerRule[];
  /**
   * Planning features configuration contributed by this extension.
   */
  plan?: {
    /**
     * The directory where planning artifacts are stored.
     */
    directory?: string;
  };
  /**
   * Used to migrate an extension to a new repository source.
   */
  migratedTo?: string;
  /** Loaded JS module for trajectory decoding */
  trajectoryProviderModule?: TrajectoryProvider;
}

export interface ExtensionInstallMetadata {
  source: string;
  type: 'git' | 'local' | 'link' | 'github-release';
  releaseTag?: string; // Only present for github-release installs.
  ref?: string;
  autoUpdate?: boolean;
  allowPreRelease?: boolean;
}

import { getChannelFromVersion } from '../utils/channel.js';
import { DEFAULT_MAX_ATTEMPTS } from '../utils/retry.js';
import {
  DEFAULT_FILE_FILTERING_OPTIONS,
  DEFAULT_MEMORY_FILE_FILTERING_OPTIONS,
  type FileFilteringOptions,
} from './constants.js';
import {
  DEFAULT_TOOL_PROTECTION_THRESHOLD,
  DEFAULT_MIN_PRUNABLE_TOKENS_THRESHOLD,
  DEFAULT_PROTECT_LATEST_TURN,
} from '../context/toolOutputMaskingService.js';

import {
  type ExtensionLoader,
  SimpleExtensionLoader,
} from '../utils/extensionLoader.js';
import { McpClientManager } from '../tools/mcp-client-manager.js';
import { A2AClientManager } from '../agents/a2a-client-manager.js';
import { type McpContext } from '../tools/mcp-client.js';
import type { EnvironmentSanitizationConfig } from '../services/environmentSanitization.js';

export type { FileFilteringOptions };
export {
  DEFAULT_FILE_FILTERING_OPTIONS,
  DEFAULT_MEMORY_FILE_FILTERING_OPTIONS,
};

export const DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD = 40_000;

export class MCPServerConfig {
  constructor(
    // For stdio transport
    readonly command?: string,
    readonly args?: string[],
    readonly env?: Record<string, string>,
    readonly cwd?: string,
    // For sse transport
    readonly url?: string,
    // For streamable http transport
    readonly httpUrl?: string,
    readonly headers?: Record<string, string>,
    // For websocket transport
    readonly tcp?: string,
    // Transport type (optional, for use with 'url' field)
    // When set to 'http', uses StreamableHTTPClientTransport
    // When set to 'sse', uses SSEClientTransport
    // When omitted, auto-detects transport type
    // Note: 'httpUrl' is deprecated in favor of 'url' + 'type'
    readonly type?: 'sse' | 'http',
    // Common
    readonly timeout?: number,
    readonly trust?: boolean,
    // Metadata
    readonly description?: string,
    readonly includeTools?: string[],
    readonly excludeTools?: string[],
    readonly extension?: GeminiCLIExtension,
    // OAuth configuration
    readonly oauth?: MCPOAuthConfig,
    readonly authProviderType?: AuthProviderType,
    // Service Account Configuration
    /* targetAudience format: CLIENT_ID.apps.googleusercontent.com */
    readonly targetAudience?: string,
    /* targetServiceAccount format: <service-account-name>@<project-num>.iam.gserviceaccount.com */
    readonly targetServiceAccount?: string,
  ) {}
}

export enum AuthProviderType {
  DYNAMIC_DISCOVERY = 'dynamic_discovery',
  GOOGLE_CREDENTIALS = 'google_credentials',
  SERVICE_ACCOUNT_IMPERSONATION = 'service_account_impersonation',
}

export interface SandboxConfig {
  enabled: boolean;
  allowedPaths?: string[];
  includeDirectories?: string[];
  networkAccess?: boolean;
  command?:
    | 'docker'
    | 'podman'
    | 'sandbox-exec'
    | 'runsc'
    | 'lxc'
    | 'windows-native';
  image?: string;
}

export const ConfigSchema = z.object({
  sandbox: z
    .object({
      enabled: z.boolean().default(false),
      allowedPaths: z.array(z.string()).default([]),
      includeDirectories: z.array(z.string()).default([]),
      networkAccess: z.boolean().default(false),
      command: z
        .enum([
          'docker',
          'podman',
          'sandbox-exec',
          'runsc',
          'lxc',
          'windows-native',
        ])
        .optional(),
      image: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.enabled && !data.command) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sandbox command is required when sandbox is enabled',
          path: ['command'],
        });
      }
    })
    .optional(),
});

/**
 * Callbacks for checking MCP server enablement status.
 * These callbacks are provided by the CLI package to bridge
 * the enablement state to the core package.
 */
export interface McpEnablementCallbacks {
  /** Check if a server is disabled for the current session only */
  isSessionDisabled: (serverId: string) => boolean;
  /** Check if a server is enabled in the file-based configuration */
  isFileEnabled: (serverId: string) => Promise<boolean>;
}

export interface PolicyUpdateConfirmationRequest {
  scope: string;
  identifier: string;
  policyDir: string;
  newHash: string;
}

export interface WorktreeSettings {
  name: string;
  path: string;
  baseSha: string;
}

export interface ConfigParameters {
  sessionId: string;
  clientName?: string;
  clientVersion?: string;
  embeddingModel?: string;
  sandbox?: SandboxConfig;
  toolSandboxing?: boolean;
  targetDir: string;
  debugMode: boolean;
  question?: string;

  coreTools?: string[];
  mainAgentTools?: string[];
  /** @deprecated Use Policy Engine instead */
  allowedTools?: string[];
  /** @deprecated Use Policy Engine instead */
  excludeTools?: string[];
  toolDiscoveryCommand?: string;
  toolCallCommand?: string;
  mcpServerCommand?: string;
  mcpServers?: Record<string, MCPServerConfig>;
  mcpEnablementCallbacks?: McpEnablementCallbacks;
  userMemory?: string | HierarchicalMemory;
  geminiMdFileCount?: number;
  geminiMdFilePaths?: string[];
  approvalMode?: ApprovalMode;
  showMemoryUsage?: boolean;
  contextFileName?: string | string[];
  accessibility?: AccessibilitySettings;
  telemetry?: TelemetrySettings;
  usageStatisticsEnabled?: boolean;
  fileFiltering?: {
    respectGitIgnore?: boolean;
    respectGeminiIgnore?: boolean;
    enableFileWatcher?: boolean;
    enableRecursiveFileSearch?: boolean;
    enableFuzzySearch?: boolean;
    maxFileCount?: number;
    searchTimeout?: number;
    customIgnoreFilePaths?: string[];
  };
  checkpointing?: boolean;
  proxy?: string;
  cwd: string;
  fileDiscoveryService?: FileDiscoveryService;
  includeDirectories?: string[];
  bugCommand?: BugCommandSettings;
  model: string;
  disableLoopDetection?: boolean;
  maxSessionTurns?: number;
  acpMode?: boolean;
  listSessions?: boolean;
  deleteSession?: string;
  listExtensions?: boolean;
  extensionLoader?: ExtensionLoader;
  enabledExtensions?: string[];
  enableExtensionReloading?: boolean;
  allowedMcpServers?: string[];
  blockedMcpServers?: string[];
  allowedEnvironmentVariables?: string[];
  blockedEnvironmentVariables?: string[];
  enableEnvironmentVariableRedaction?: boolean;
  noBrowser?: boolean;
  summarizeToolOutput?: Record<string, SummarizeToolOutputSettings>;
  folderTrust?: boolean;
  ideMode?: boolean;
  loadMemoryFromIncludeDirectories?: boolean;
  includeDirectoryTree?: boolean;
  importFormat?: 'tree' | 'flat';
  discoveryMaxDirs?: number;
  compressionThreshold?: number;
  interactive?: boolean;
  trustedFolder?: boolean;
  useBackgroundColor?: boolean;
  useAlternateBuffer?: boolean;
  useTerminalBuffer?: boolean;
  useRenderProcess?: boolean;
  useRipgrep?: boolean;
  enableInteractiveShell?: boolean;
  shellBackgroundCompletionBehavior?: string;
  skipNextSpeakerCheck?: boolean;
  shellExecutionConfig?: ShellExecutionConfig;
  extensionManagement?: boolean;
  extensionRegistryURI?: string;
  truncateToolOutputThreshold?: number;
  eventEmitter?: EventEmitter;
  useWriteTodos?: boolean;
  workspacePoliciesDir?: string;
  policyEngineConfig?: PolicyEngineConfig;
  directWebFetch?: boolean;
  policyUpdateConfirmationRequest?: PolicyUpdateConfirmationRequest;
  output?: OutputSettings;
  gemmaModelRouter?: GemmaModelRouterSettings;
  adk?: ADKSettings;
  disableModelRouterForAuth?: AuthType[];
  retryFetchErrors?: boolean;
  maxAttempts?: number;
  enableShellOutputEfficiency?: boolean;
  shellToolInactivityTimeout?: number;
  fakeResponses?: string;
  fakeResponsesNonStrict?: string;
  recordResponses?: string;
  ptyInfo?: string;
  disableYoloMode?: boolean;
  disableAlwaysAllow?: boolean;
  voiceMode?: boolean;
  rawOutput?: boolean;
  acceptRawOutputRisk?: boolean;
  dynamicModelConfiguration?: boolean;
  modelConfigServiceConfig?: ModelConfigServiceConfig;
  enableHooks?: boolean;
  enableHooksUI?: boolean;
  experiments?: Experiments;
  contextManagement?: Partial<ContextManagementConfig>;
  hooks?: { [K in HookEventName]?: HookDefinition[] };
  disabledHooks?: string[];
  projectHooks?: { [K in HookEventName]?: HookDefinition[] };
  enableAgents?: boolean;
  enableEventDrivenScheduler?: boolean;
  skillsSupport?: boolean;
  disabledSkills?: string[];
  adminSkillsEnabled?: boolean;
  autoDistillation?: boolean;
  experimentalAutoMemory?: boolean;
  experimentalGemma?: boolean;
  experimentalContextManagementConfig?: string;
  experimentalAgentHistoryTruncation?: boolean;
  experimentalAgentHistoryTruncationThreshold?: number;
  experimentalAgentHistoryRetainedMessages?: number;
  experimentalAgentHistorySummarization?: boolean;
  memoryBoundaryMarkers?: string[];
  topicUpdateNarration?: boolean;

  disableLLMCorrection?: boolean;
  plan?: boolean;
  tracker?: boolean;
  planSettings?: PlanSettings;
  worktreeSettings?: WorktreeSettings;
  modelSteering?: boolean;
  onModelChange?: (model: string) => void;
  mcpEnabled?: boolean;
  extensionsEnabled?: boolean;
  agents?: AgentSettings;
  onReload?: () => Promise<{
    disabledSkills?: string[];
    adminSkillsEnabled?: boolean;
    agents?: AgentSettings;
  }>;
  enableConseca?: boolean;
  billing?: {
    overageStrategy?: OverageStrategy;
  };
  vertexAiRouting?: VertexAiRoutingConfig;
  logRagSnippets?: boolean;
}

export class Config implements McpContext, AgentLoopContext {
  private _toolRegistry!: ToolRegistry;
  private mcpClientManager?: McpClientManager;
  private readonly a2aClientManager?: A2AClientManager;
  private allowedMcpServers: string[];
  private blockedMcpServers: string[];
  private allowedEnvironmentVariables: string[];
  private blockedEnvironmentVariables: string[];
  private readonly enableEnvironmentVariableRedaction: boolean;
  private _promptRegistry!: PromptRegistry;
  private _resourceRegistry!: ResourceRegistry;
  private agentRegistry!: AgentRegistry;
  private readonly acknowledgedAgentsService: AcknowledgedAgentsService;
  private skillManager!: SkillManager;
  private _sessionId: string;
  private readonly clientName: string | undefined;
  private _clientVersion: string;

  private fileSystemService: FileSystemService;
  private trackerService?: TrackerService;
  readonly topicState = new TopicState();
  private contentGeneratorConfig!: ContentGeneratorConfig;
  private contentGenerator!: ContentGenerator;
  readonly modelConfigService: ModelConfigService;
  private readonly embeddingModel: string;
  private readonly sandbox: SandboxConfig | undefined;
  private _sandboxForbiddenPaths: string[] | undefined;
  private readonly targetDir: string;
  private _ripgrepPathPromise?: Promise<string | null>;
  private workspaceContext: WorkspaceContext;
  private readonly debugMode: boolean;
  private readonly question: string | undefined;
  private readonly worktreeSettings: WorktreeSettings | undefined;
  readonly enableConseca: boolean;

  private readonly coreTools: string[] | undefined;
  private readonly mainAgentTools: string[] | undefined;
  /** @deprecated Use Policy Engine instead */
  private readonly allowedTools: string[] | undefined;
  /** @deprecated Use Policy Engine instead */
  private readonly excludeTools: string[] | undefined;
  private readonly toolDiscoveryCommand: string | undefined;
  private readonly toolCallCommand: string | undefined;
  private readonly mcpServerCommand: string | undefined;
  private readonly mcpEnabled: boolean;
  private readonly extensionsEnabled: boolean;
  private mcpServers: Record<string, MCPServerConfig> | undefined;
  private readonly mcpEnablementCallbacks?: McpEnablementCallbacks;
  private userMemory: string | HierarchicalMemory;
  private geminiMdFileCount: number;
  private geminiMdFilePaths: string[];
  private readonly showMemoryUsage: boolean;
  private readonly logRagSnippets: boolean;
  private readonly accessibility: AccessibilitySettings;
  private readonly telemetrySettings: TelemetrySettings;
  private readonly usageStatisticsEnabled: boolean;
  private _geminiClient!: GeminiClient;
  private _sandboxManager: SandboxManager;
  private readonly _sandboxPolicyManager: SandboxPolicyManager;
  private baseLlmClient!: BaseLlmClient;
  private localLiteRtLmClient?: LocalLiteRtLmClient;
  private modelRouterService: ModelRouterService;
  private readonly modelAvailabilityService: ModelAvailabilityService;
  private readonly fileFiltering: {
    respectGitIgnore: boolean;
    respectGeminiIgnore: boolean;
    enableFileWatcher: boolean;
    enableRecursiveFileSearch: boolean;
    enableFuzzySearch: boolean;
    maxFileCount: number;
    searchTimeout: number;
    customIgnoreFilePaths: string[];
  };
  private fileDiscoveryService: FileDiscoveryService | null = null;
  private gitService: GitService | undefined = undefined;
  private readonly checkpointing: boolean;
  private readonly proxy: string | undefined;
  private readonly cwd: string;
  private readonly bugCommand: BugCommandSettings | undefined;
  private model: string;
  private readonly disableLoopDetection: boolean;
  // null = unknown (quota not fetched); true = has access; false = definitively no access
  private hasAccessToPreviewModel: boolean | null = null;
  private readonly noBrowser: boolean;
  private readonly folderTrust: boolean;
  private ideMode: boolean;

  private _activeModel: string;
  private readonly maxSessionTurns: number;
  private readonly listSessions: boolean;
  private readonly deleteSession: string | undefined;
  private readonly listExtensions: boolean;
  private readonly _extensionLoader: ExtensionLoader;
  private readonly _enabledExtensions: string[];
  private readonly enableExtensionReloading: boolean;
  fallbackModelHandler?: FallbackModelHandler;
  validationHandler?: ValidationHandler;
  private quotaErrorOccurred: boolean = false;
  private creditsNotificationShown: boolean = false;
  private modelQuotas: Map<
    string,
    { remaining: number; limit: number; resetTime?: string }
  > = new Map();
  private lastRetrievedQuota?: RetrieveUserQuotaResponse;
  private lastQuotaFetchTime = 0;
  private lastEmittedQuotaRemaining: number | undefined;
  private lastEmittedQuotaLimit: number | undefined;

  private emitQuotaChangedEvent(): void {
    const remaining = this.getQuotaRemaining();
    const limit = this.getQuotaLimit();
    const resetTime = this.getQuotaResetTime();
    if (
      this.lastEmittedQuotaRemaining !== remaining ||
      this.lastEmittedQuotaLimit !== limit
    ) {
      this.lastEmittedQuotaRemaining = remaining;
      this.lastEmittedQuotaLimit = limit;
      coreEvents.emitQuotaChanged(remaining, limit, resetTime);
    }
  }

  private readonly summarizeToolOutput:
    | Record<string, SummarizeToolOutputSettings>
    | undefined;
  private readonly acpMode: boolean = false;
  private readonly loadMemoryFromIncludeDirectories: boolean = false;
  private readonly includeDirectoryTree: boolean = true;
  private readonly importFormat: 'tree' | 'flat';
  private readonly discoveryMaxDirs: number;
  private readonly compressionThreshold: number | undefined;
  /** Public for testing only */
  readonly interactive: boolean;
  private readonly ptyInfo: string;
  private readonly trustedFolder: boolean | undefined;
  private readonly directWebFetch: boolean;
  private readonly useRipgrep: boolean;
  private readonly enableInteractiveShell: boolean;
  private readonly shellBackgroundCompletionBehavior:
    | 'inject'
    | 'notify'
    | 'silent';
  private readonly skipNextSpeakerCheck: boolean;
  private readonly useBackgroundColor: boolean;
  private readonly useAlternateBuffer: boolean;
  private readonly useTerminalBuffer: boolean;
  private readonly useRenderProcess: boolean;
  private shellExecutionConfig: ShellExecutionConfig;
  private readonly extensionManagement: boolean = true;
  private readonly extensionRegistryURI: string | undefined;
  private readonly truncateToolOutputThreshold: number;
  private compressionTruncationCounter = 0;
  private initialized = false;
  private initPromise: Promise<void> | undefined;
  private mcpInitializationPromise: Promise<void> | null = null;
  readonly storage: Storage;
  private readonly fileExclusions: FileExclusions;
  private readonly eventEmitter?: EventEmitter;
  private readonly useWriteTodos: boolean;
  private readonly workspacePoliciesDir: string | undefined;
  private readonly _messageBus: MessageBus;
  private readonly policyEngine: PolicyEngine;
  private policyUpdateConfirmationRequest:
    | PolicyUpdateConfirmationRequest
    | undefined;
  private readonly outputSettings: OutputSettings;

  private readonly gemmaModelRouter: GemmaModelRouterSettings;
  private readonly agentSessionNoninteractiveEnabled: boolean;
  private readonly agentSessionInteractiveEnabled: boolean;
  private readonly agentSessionSubagentEnabled: boolean;

  private readonly retryFetchErrors: boolean;
  private readonly maxAttempts: number;
  private readonly enableShellOutputEfficiency: boolean;
  private readonly shellToolInactivityTimeout: number;
  readonly fakeResponses?: string;
  readonly fakeResponsesNonStrict?: string;
  readonly recordResponses?: string;
  private readonly disableYoloMode: boolean;
  private readonly disableAlwaysAllow: boolean;
  private readonly rawOutput: boolean;
  private readonly acceptRawOutputRisk: boolean;
  private readonly dynamicModelConfiguration: boolean;
  private pendingIncludeDirectories: string[];
  private readonly enableHooksUI: boolean;
  private readonly enableHooks: boolean;

  private hooks: { [K in HookEventName]?: HookDefinition[] } | undefined;
  private projectHooks:
    | ({ [K in HookEventName]?: HookDefinition[] } & { disabled?: string[] })
    | undefined;
  private disabledHooks: string[];
  private experiments: Experiments | undefined;
  private experimentsPromise: Promise<Experiments | undefined> | undefined;
  private hookSystem?: HookSystem;
  private readonly onModelChange: ((model: string) => void) | undefined;
  private readonly onReload:
    | (() => Promise<{
        disabledSkills?: string[];
        adminSkillsEnabled?: boolean;
        agents?: AgentSettings;
      }>)
    | undefined;

  private readonly billing: {
    overageStrategy: OverageStrategy;
  };
  private readonly vertexAiRouting: VertexAiRoutingConfig | undefined;

  private readonly enableAgents: boolean;
  private agents: AgentSettings;
  private readonly enableEventDrivenScheduler: boolean;
  private readonly skillsSupport: boolean;
  private disabledSkills: string[];
  private readonly adminSkillsEnabled: boolean;
  private readonly experimentalAutoMemory: boolean;
  private readonly experimentalGemma: boolean;
  private readonly experimentalContextManagementConfig?: string;
  private readonly memoryBoundaryMarkers: readonly string[];
  private readonly topicUpdateNarration: boolean;
  private readonly disableLLMCorrection: boolean;
  private readonly planEnabled: boolean;
  private readonly voiceMode: boolean;
  private readonly trackerEnabled: boolean;
  private readonly planModeRoutingEnabled: boolean;
  private readonly modelSteering: boolean;
  private memoryContextManager?: MemoryContextManager;
  private readonly contextManagement: ContextManagementConfig;
  private terminalBackground: string | undefined = undefined;
  private remoteAdminSettings: AdminControlsSettings | undefined;
  private latestApiRequest: GenerateContentParameters | undefined;
  private lastModeSwitchTime: number = performance.now();
  readonly injectionService: InjectionService;
  private approvedPlanPath: string | undefined;

  constructor(params: ConfigParameters) {
    this._sessionId = params.sessionId;
    this.clientName = params.clientName;
    this._clientVersion = params.clientVersion ?? 'unknown';
    this.approvedPlanPath = undefined;

    this.embeddingModel =
      params.embeddingModel ?? DEFAULT_GEMINI_EMBEDDING_MODEL;
    this.sandbox = params.sandbox
      ? {
          enabled: params.sandbox.enabled || params.toolSandboxing || false,
          allowedPaths: params.sandbox.allowedPaths ?? [],
          includeDirectories: [
            ...(params.sandbox.includeDirectories ?? []),
            ...(params.sandbox.allowedPaths ?? []),
            Storage.getGlobalTempDir(),
          ],
