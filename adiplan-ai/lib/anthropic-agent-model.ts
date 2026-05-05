import { anthropic } from "@ai-sdk/anthropic";

/**
 * Default for APAC “agent” flows: match-article, studios, strategic frame,
 * section rewrite, workshop vision, etc. Override with ANTHROPIC_AGENT_MODEL.
 *
 * @see https://docs.claude.com/en/docs/about-claude/models/overview
 */
const DEFAULT_ANTHROPIC_AGENT_MODEL = "claude-opus-4-6";

export function getAnthropicAgentModelId(): string {
  const id = process.env.ANTHROPIC_AGENT_MODEL?.trim();
  return id || DEFAULT_ANTHROPIC_AGENT_MODEL;
}

/** AI SDK language model for generateObject / generateText with Anthropic. */
export function anthropicAgentModel() {
  return anthropic(getAnthropicAgentModelId());
}
