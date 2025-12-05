import Anthropic from '@anthropic-ai/sdk';
import { IncomingMessage, AgentOutput } from './types';
import { PRODUCT_KNOWLEDGE, PRIORITY_GUIDELINES, ESCALATION_TRIGGERS } from './knowledge';
import { RagService } from './services/rag';
import * as dotenv from 'dotenv';

dotenv.config();

export class SupportAgent {
  private anthropic: Anthropic;
  private ragService: RagService;

  constructor(apiKey?: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.ragService = new RagService();
  }

  async processMessage(message: IncomingMessage): Promise<AgentOutput> {
    // 1. Retrieve relevant context from RAG
    const relevantHistory = this.ragService.search(message.message_body);
    const historyContext = relevantHistory.length > 0
      ? `## RELEVANT PAST ISSUES & SOLUTIONS\n${relevantHistory.join('\n\n')}\n`
      : '## RELEVANT PAST ISSUES\nNone found.\n';

    const systemPrompt = `
You are the AI support operations agent for SonarCloud, an educational technology company.
You serve approximately 20 schools per semester.

## YOUR ROLE
1. Analyze the issue using the provided context and PAST ISSUES.
2. Categorize and prioritize it.
3. Create a Notion task with troubleshooting steps.
4. Draft an email response.

## CRITICAL RULES - DO NOT GUESS
1. Search your knowledge base and the "RELEVANT PAST ISSUES" provided below.
2. If you find a matching solution, use it.
3. **IF YOU DO NOT KNOW THE ANSWER OR ARE UNSURE:**
   - You MUST escalate immediately.
   - Use the 'escalate_to_human' tool.
   - The 'draft_email' tool must still be used to inform the customer we are looking into it, but DO NOT guess a solution.
   - The 'create_notion_task' tool must include "ESCALATION" in the title.

## ESCALATION CONTACTS
When escalating, the system will automatically notify:
- JBAPTISTE@GETSONARCLOUD.COM
- ROMAN@GETSONARCLOUD.COM

## CONTEXT
${PRODUCT_KNOWLEDGE}

${PRIORITY_GUIDELINES}

${ESCALATION_TRIGGERS}

${historyContext}

## RESPONSE STYLE
- Be warm, professional, and solution-oriented.
- If finding a known solution, provide it clearly.
- If escalating, assure the customer that senior support (Roman/JBaptiste) has been notified.

## OUTPUT FORMAT
You must respond with a valid JSON object matching this structure:
{
  "analysis": {
    "category": "string",
    "priority": "string",
    "sentiment": "string",
    "summary": "string",
    "school_name": "string or null",
    "is_repeat_issue": boolean,
    "requires_escalation": boolean,
    "escalation_reason": "string or null"
  },
  "actions": [
    {
      "tool": "create_notion_task",
      "parameters": { ... }
    },
    {
      "tool": "draft_email",
      "parameters": { ... }
    },
    {
      "tool": "escalate_to_human",
      "parameters": { ... }
    }
  ]
}

Available tools:
- create_notion_task: title, priority, category, customer_email, customer_name, school_name, intercom_conversation_id, summary, troubleshooting_steps, notes
- draft_email: to, subject, body
- search_knowledge_base: query
- escalate_to_human: reason, urgency
`;

    const userMessageContent = JSON.stringify(message, null, 2);

    try {
      const msg = await this.anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: "user", content: userMessageContent }
        ]
      });

      const textBlock = msg.content[0];
      if (textBlock.type !== 'text') {
        throw new Error("Unexpected response type from Claude");
      }

      const responseContent = textBlock.text;
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseContent;

      const parsedResponse = JSON.parse(jsonString) as AgentOutput;
      return parsedResponse;

    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }
}
