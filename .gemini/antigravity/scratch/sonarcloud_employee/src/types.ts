export interface IncomingMessage {
    customer_name: string;
    customer_email: string;
    school_name?: string;
    conversation_id: string;
    message_body: string;
    previous_messages?: string[];
    customer_history?: string | null;
}

export type Priority = "High" | "Medium" | "Low";
export type Category = "Technical Issue" | "Billing" | "Feature Request" | "General Inquiry" | "Installation" | "Training";
export type Sentiment = "positive" | "neutral" | "frustrated" | "angry";
export type Urgency = "critical" | "high" | "normal";

export interface Analysis {
    category: Category;
    priority: Priority;
    sentiment: Sentiment;
    summary: string;
    school_name: string | null;
    is_repeat_issue: boolean;
    requires_escalation: boolean;
    escalation_reason: string | null;
}

export interface CreateNotionTaskParams {
    title: string;
    priority: Priority;
    category: Category;
    customer_email: string;
    customer_name: string;
    school_name?: string;
    intercom_conversation_id: string;
    summary: string;
    troubleshooting_steps: string[];
    notes?: string;
}

export interface DraftEmailParams {
    to: string;
    subject: string;
    body: string;
}

export interface EscalateToHumanParams {
    reason: string;
    urgency: Urgency;
}

export interface SearchKnowledgeBaseParams {
    query: string;
}

export type ActionToolName = "create_notion_task" | "draft_email" | "escalate_to_human" | "search_knowledge_base";

export interface Action {
    tool: ActionToolName;
    parameters: CreateNotionTaskParams | DraftEmailParams | EscalateToHumanParams | SearchKnowledgeBaseParams;
}

export interface AgentOutput {
    analysis: Analysis;
    actions: Action[];
}
